const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { configs } = require('./CloudConfig')
admin.initializeApp()

const express = require('express')
const cors = require('cors')({ origin: true })
const mongo = require('mongodb')
const MongoClient = mongo.MongoClient


const axios = require('axios')
const api = express()
api.use(cors)

let dev = (process.env.FUNCTIONS_EMULATOR === 'true' ? true : false)

let dbUrl = (dev ? configs.dev.mongodb : configs.prod.mongodb)

const youtubeKey = configs.youtube.key
const itemsPerPage = 5


/************
* API CALLS *
************/

/** retrieve match count and filter results */
api.get('/matches', (req, res) => {
    let query = {}
    let skip = 0

    if (req.query.filters) {
        let players = req.query.filters.players
        let strict = req.query.filters.strict === 'true' ? true : false
        let tournament = req.query.filters.tournament.name ? req.query.filters.tournament : null
        let type = req.query.filters.type
        let hasFile = req.query.filters.hasFile === 'true' ? true : false
        let hasVideo = req.query.filters.hasVideo === 'true' ? true : false
        let unfiltered = true
        skip = req.query.page > 0 ? (req.query.page - 1) * itemsPerPage : 0


        for (let i = 0; i < players.length; i++) {
            if (players[i].name) {
                unfiltered = false
                break
            }

            if (players[i].character) {
                unfiltered = false
                break
            }
        }

        query = formatQuery(players, strict, unfiltered, tournament, type, hasFile, hasVideo)
    } else {
        query = ( req.query.tournamentId ?
            {
                'tournament.id': req.query.tournamentId,
                'video.id': req.query.videoId,
                'userId': req.query.fromUser
            } :
            { '_id': mongo.ObjectId(req.query.matchId) }
        )
    }
    
    const pipeline = [
        { '$match': query },
        { '$group': {
            _id: {
                '$cond': {
                    if: {
                        '$eq': ['$type', 'Tournament' ]
                    },
                    then: {
                        tournament: {
                            name: '$tournament.name',
                            num: '$tournament.num',
                            date: '$tournament.date',
                        },
                        id: '$tournament.id',
                        type: '$type',
                        videoId: '$video.id',
                        uploadedBy: '$userId',
                    },
                    else: {
                        // can probably delete conditional ?
                        '$cond': {
                            if: {
                                '$eq': ['$linked', true]
                            },
                            then: {
                                uploadId: '$uploadId',
                                linked: true,
                                type: '$type',
                            },
                            else: {
                                id: '$_id',
                                type: '$type',
                            }
                        }
                    }
                }
            },
            // initial upload date
            uploaded: {
                '$first': {
                    '$concat': ['$uploadDate', 'T', '$uploadTime']
                }
            },
            matches: {
                '$push': {
                    _id: '$_id',
                    userId: '$userId',
                    file: '$file',
                    type: '$type',
                    p1: '$p1',
                    p2: '$p2',
                    uploadDate: '$uploadDate',
                    uploadTime: '$uploadTime',
                    video: '$video'
                }
            },
        }},
    ]
    

    MongoClient.connect(dbUrl, { useUnifiedTopology: true })
    .then((client) => {
        console.log('Connected @ %s', (new Date()).toLocaleString())
        console.log('Filtering with query:\n', query)

        return Promise.all([
            // for getting result count
            // need to use length instead of count -- if no matches then count will be undefined
            client
            .db('tfhr')
            .collection('matches')
            .aggregate([
                ...pipeline
            ])
            .toArray(),
            // for getting matches to display on current page
            client
            .db('tfhr')
            .collection('matches')
            .aggregate([
                ...pipeline,
                { '$sort': { uploaded: -1 } },
                { '$skip': skip },
                { '$limit': itemsPerPage }
            ])
            .toArray()
        ])
    })
    .then((results) => {
        return res.status(200).send({
            count: results[0].length,
            groups: results[1]
        })
    })
    .catch((error) => res.status(400).send(error.toString()))
})

/** upload matches to db */
api.put('/matches', (req, res) => {
    let players = []
    let form = parseInt(req.body.form)
    

    let matches = req.body.matches.map((match) => {
        if (!players.includes(match.p1.name)) players.push(match.p1.name)
        if (!players.includes(match.p2.name)) players.push(match.p2.name)

        // might not need?
        if (match.video && match.video.id && form !== 1) {
            let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${match.video.id}&key=${youtubeKey}`

            return axios.get(url)
            .then((youtube) => {
                if (youtube.data.items.length > 0) {
                    console.log("Successfully retrieved Youtube data")

                    match.video.title = youtube.data.items[0].snippet.title
                    match.video.date = youtube.data.items[0].snippet.publishedAt.split('T')[0]

                    match.video.channel = {
                        id: youtube.data.items[0].snippet.channelId,
                        name: youtube.data.items[0].snippet.channelTitle
                    }
                    
                } else {
                    console.log("Failed to retrieve Youtube data")
                }

                return match
            })
            .catch((error) => res.status(400).send(error.toString()))
        } else {
            return match
        }
    })

    let tournament = req.body.matches[0].tournament ? req.body.matches[0].tournament : null

    // universal database call
    let connectToDb = Promise.all(matches).then((matches) => {
        return Promise.all([
            matches,
            MongoClient.connect(dbUrl, { useUnifiedTopology: true  })
        ])
    })

    let chain = null

    if (tournament) {
        // chain for tournament uploads
        chain = connectToDb
        .then((results) => {
            let matches = results[0]
            console.log('Connected.\nUploading match...')
    
            let db = results[1].db('tfhr')
            return Promise.all([
                db,
                matches,
                db.collection('tournaments')
                .findOneAndUpdate(
                    {
                        name: tournament.name,
                        num: tournament.num,
                        date: tournament.date
                    },
                    
                    {
                        $set: {
                            name: tournament.name,
                            num: tournament.num,
                            date: tournament.date
                            
                        },
                    },
                    { upsert: true, new: true }
                )
            ])
        })
        .then((results) => {
            let db = results[0]
            let matches = results[1]

            let tournamentId = (results[2].value ?
            results[2].value._id :
            results[2].lastErrorObject.upserted).toString()

            return Promise.all([
                db,
                matches.map((match) => {
                    match.tournament.id = tournamentId
                    return match
                })
            ])
        })
    } else {
        // chain for casual uploads
        chain = connectToDb.then((results) => {
            let matches = results[0]
            console.log('Connected.\nUploading match...')
    
            let db = results[1].db('tfhr')

            
            return Promise.all([
                db,
                matches,
            ])
        })
    }
    
    // end of all chains
    chain.then((results) => {
        let db = results[0]
        let matches = results[1]
        return Promise.all([
            db.collection('matches')
            .insertMany(matches),
        ])
    })
    .then((results) => {
        let matchIds = (Object.values(results[0].insertedIds)).map(id => id.toString())

        console.log('Matches uploaded:')

        for (id in matchIds) {
            console.log(matchIds[id])
        }

        return res.status(200).send({matchIds: matchIds})
    })
    .catch((error) => res.status(400).send(error.toString()))
})

/** update match info using edit page */
api.put('/matches/update', (req, res) => {
    let players = []
    let matches = req.body.map((match) => {
        if (!players.includes(match.p1.name)) players.push(match.p1.name)
        if (!players.includes(match.p2.name)) players.push(match.p2.name)

        if (match.video && match.video.id) {
            let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${match.video.id}&key=${youtubeKey}`

            return axios.get(url)
            .then((youtube) => {
                if (youtube.data.items.length > 0) {
                    console.log("Successfully retrieved Youtube data")

                    match.video.title = youtube.data.items[0].snippet.title
                    match.video.date = youtube.data.items[0].snippet.publishedAt.split('T')[0]

                    match.video.channel = {
                        id: youtube.data.items[0].snippet.channelId,
                        name: youtube.data.items[0].snippet.channelTitle
                    }
                    
                } else {
                    console.log("Failed to retrieve Youtube data")
                }

                return match
            })
            .catch((error) => res.status(400).send(error.toString()))
        } else {
            return match
        }
    })

    Promise.all(matches).then((matches) => {
        return Promise.all([
            matches,
            MongoClient.connect(dbUrl, { useUnifiedTopology: true  })
        ])
    })
    .then((results) => {
        let matches = results[0]
        console.log('Connected.\nUploading match...')

        let db = results[1].db('tfhr')
        
        for (i in matches) {
            db.collection('matches')
            .updateOne(
                { _id: mongo.ObjectId(matches[i]._id) },
                { $set: {
                    p1: matches[i].p1,
                    p2: matches[i].p2,
                    video: matches[i].video,
                }},
            )
        }

        return null
    })
    .then(() => { 
        return res.status(200).send()
    })
    .catch((error) => res.status(400).send(error.toString()))
})

/** get list of tournaments */
api.get('/filter/content', (req, res) => {

    MongoClient.connect(dbUrl, { useUnifiedTopology: true })
    .then((client) => {
        let db = client.db('tfhr').collection('matches')

        return Promise.all([
            fetchTournaments(db),
            fetchPlayers(db),
            fetchChannels(db)
        ])
     })
     .then((results) => {
         console.log(results[1])
        console.log('Returning tournament list.')
        return res.status(200).send({
            tournaments: results[0],
            players: results[1][0].players,
            channels: results[2][0].channels
        })
    })
    .catch((error) => res.status(400).send(error.toString()))
})

/** get list of tournaments */
function fetchTournaments(db) {
    const pipeline = [
        {'$match': { 
            'tournament': { '$ne': null }
        }},
        {'$group': {
            _id: '$tournament.name',
            nums: {
                
                '$addToSet': {
                    '$cond': {
                        if: {
                            '$ne': ['$tournament.num', null]
                        },
                        then: {
                            num: '$tournament.num',
                            date: '$tournament.date'
                        },
                        else: {
                            date: '$tournament.date'
                        }
                    }
                }
                
            }
        }},
        { '$sort': {
            '_id': -1,
            'nums.num': 1,
            'nums.date': 1
        }}
    ]

    return db.aggregate([...pipeline]).toArray()
}

/** get list of players */
function fetchPlayers(db) {
    const pipeline = [
        {'$group': {
            _id: null,
            'p1': {'$addToSet': '$p1.name'},
            'p2': {'$addToSet': '$p2.name'} 
        }},
        {'$project': {
            'players': {'$setUnion': ['$p1', '$p2']}
        }}
    ]

    return db.aggregate([...pipeline]).toArray()
}

function fetchChannels(db) {
    const pipeline = [
        {'$match': { 'channel': {'$ne': null} }},
        {'$group': {
            _id: null,
            channels: {'$addToSet': '$channel'}
        }
    }]

    return db.aggregate([...pipeline]).toArray()
}

/** authorize & verify user
 * verifyIdToken not currently working in dev environment???
*/
api.get('/users', (req, res) => {
    //console.log(admin.auth())
    console.log('--> Verifying User <--')
    if (!req.headers.authorization && !dev) {
        console.log('Unauthorized')
        res.status(403).send('Unauthorized')
    }

    if (dev) {
        ref = MongoClient.connect(dbUrl, { useUnifiedTopology: true })
    } else {
        ref = admin.auth()
        .verifyIdToken(req.headers.authorization)
        .then(() => {
            return MongoClient.connect(dbUrl, { useUnifiedTopology: true })
        })
    }

    ref
    .then((client) => {
        console.log('Retrieving user info')

        return client.db('tfhr')
        .collection('users')
        .find(req.query)
        .toArray()
    })
    .then((user) => {
        console.log(user)
        return res.status(200).send(user)
    })
    .catch((error) => res.status(400).send(error.toString()))
})

/** save user info to user table in db */
api.put('/users', (req, res) => {
    if (!req.headers.authorization && !dev) {
        res.status(403).send('Unauthorized')
    }

    let user = req.body
    let ref = null

    if (dev) {
        ref = MongoClient.connect(dbUrl, { useUnifiedTopology: true })
    } else {
        ref = admin.auth()
        .verifyIdToken(req.headers.authorization)
        .then(() => {
            return MongoClient.connect(dbUrl, { useUnifiedTopology: true })
        })
    }

    ref.then((client) => { 
        console.log('Creating user')
        client.db('tfhr')
        .collection('users')
        .updateOne({ uid: user.uid }, { $set: { email: user.email } }, { upsert: true })

        return user
    })
    .then((user) => {
        return res.status(200).send(`${user.email} saved`)
    })
    .catch((error) => res.status(400).send(error.toString()))
})

/** retrieve youtube video info */
api.get('/youtube-data', (req, res) => {

    if (!req.headers.authorization && !dev) {
      res.status(403).send('Unauthorized')
    }

    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${req.query.v}&key=${youtubeKey}`
    
    let client = null

    if (dev) {
        client = axios.get(url)
    } else {
        client = admin.auth()
        .verifyIdToken(req.headers.authorization)
        .then(() => {
            console.log("ID Token Verified")
            return axios.get(url)
        })
    }

    return client.then((youtube) => {
        if (youtube.data.items.length > 0) {
            console.log("Successfully retrieved Youtube data")

            return res.status(200).send({
                id: req.query.v,
                title: youtube.data.items[0].snippet.title,
                date: youtube.data.items[0].snippet.publishedAt.split('T')[0],
                description: youtube.data.items[0].snippet.description,
                channel: {
                    id: youtube.data.items[0].snippet.channelId,
                    name: youtube.data.items[0].snippet.channelTitle
                }
            })
        } else {
            console.log("Failed to retrieve Youtube data")

            return res.status(400).send('Invalid video')
        }
    })
    .catch((error) => res.status(400).send(error.toString()))
})



exports.api = functions.https.onRequest(api)

/************
* FUNCTIONS *
************/

// format query object for filtering matches
function formatQuery(players, strict, unfiltered, tournament, type, hasFile, hasVideo) {
    let query = {}

    if (!strict && !unfiltered) {
        query = { $or: [{}, {}] }

        for (let i = 0; i < players.length; i++) {
            if (players[i].name) {
                query.$or[0][`p1.name`] = new RegExp(['^' + players[i].name], 'i')
                query.$or[1][`p2.name`] = new RegExp(['^' + players[i].name], 'i')
            }

            if (players[i].character) {
                query.$or[0][`p1.character`] = players[i].character
                query.$or[1][`p2.character`] = players[i].character
            }
        }
    } else if (strict && !unfiltered) {      
        for (let i = 0; i < players.length; i++) {
            if (players[i].name) {
                query[`p${i + 1}.name`] = new RegExp(['^' + players[i].name], 'i')
            }

            if (players[i].character) {
                query[`p${i + 1}.character`] = players[i].character
            }
        }
    }

    if (tournament) {
        query = {
            // allow partial matches for tournament names?
            'tournament.name': new RegExp(['^' + tournament.name], 'i'),
            ...query
        }

        if (tournament.num) {
            query = {
                'tournament.num': tournament.num,
                ...query
            }
        }
    
        if (tournament.date) {
            query = {
                'tournament.date': tournament.date,
                ...query
            }
        }
    }

    if (type) {
        query = {
            'type': type,
            ...query
        }
    }

    if (hasFile) {
        query = {
            file: {'$ne': null},
            ...query
        }
    }

    if (hasVideo) {
        query = {
            video: {'$ne': null},
            ...query
        }
    }

    return query
}