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
    /*let query = (
        req.query.players ?
        formatQuery(req.query.players, req.query.strict) :
        (req.query.id ? {'_id': mongo.ObjectId(req.query.id)} : {})
    )*/
    
    let players = req.query.players
    let unfiltered = true

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

    let query = formatQuery(players, req.query.strict, unfiltered)
    

    

    
    console.log(query)

    let skip = req.query.page > 0 ? (req.query.page - 1) * itemsPerPage : 0

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
                        type: '$type',
                    },
                    else: {
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
                    userId: '$userId',
                    file: '$file',
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
        //let db = client.db('tfhr').collection('matches').find(query)

        return Promise.all([
            //db,
            client
            .db('tfhr')
            .collection('matches')
            .aggregate([
                ...pipeline
            ])
            .toArray(),
            client
            .db('tfhr')
            .collection('matches')
            .aggregate([
                ...pipeline,
                { '$sort': {
                    uploaded: -1,
                }},
                { '$skip': skip },
                { '$limit': itemsPerPage }
            ])
            .toArray()
        ])
    })
    .then((results) => {
        return res.status(200).send({
            count: results[0].length,
            //matches: results[1],
            groups: results[1]})
    })
    .catch((error) => res.status(400).send(error.toString()))
})

/** upload matches to db */
api.put('/matches', (req, res) => {
    //let upload = req.body
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
        return Promise.all(
            [matches,
            MongoClient.connect(dbUrl, { useUnifiedTopology: true  })]
            )
    })
    .then((results) => {
        let matches = results[0]
        console.log('Connected.\nUploading match...')

        let db = results[1].db('tfhr')
        
        return Promise.all([
            db,
            db.collection('matches')
            .insertMany(matches),      
        ])
    })
    .then((results) => {
        let db = results[0]
        let matchIds = (Object.values(results[1].insertedIds)).map(id => id.toString())

        console.log('Matches uploaded:')

        for (id in matchIds) {
            console.log(matchIds[id])
        }

        for (i in players) {
            db.collection('players')
            .updateOne(
                { 'name': players[i] },
                { $setOnInsert: { 'name': players[i] }},
                { upsert: true }
            )
        }

        return matchIds
    })
    .then((ids) => { 
        return res.status(200).send({matchIds: ids})
    })
    .catch((error) => res.status(400).send(error.toString()))
})

/** get list of currently existing players in db */
api.get('/players', (req, res) => {
    MongoClient.connect(dbUrl, { useUnifiedTopology: true })
    .then((client) => {
        return client
        .db('tfhr')
        .collection('players')
        .distinct('name')
     })
     .then((result) => {
        console.log('Returning players list.')
        return res.status(200).send({ players: result })
    })
    .catch((error) => res.status(400).send(error.toString()))
})

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

    admin.auth()
    .verifyIdToken(req.headers.authorization)
    .then(() => {
        console.log('Connecting to client')
        return MongoClient.connect(dbUrl, { useUnifiedTopology: true })
    })
    .then((client) => {
        console.log('Retrieving user info')

        return client.db()
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

    admin.auth()
    .verifyIdToken(req.headers.authorization)
    .then(() => {
        return MongoClient.connect(dbUrl, { useUnifiedTopology: true })
    })
    .then((client) => { 
        client.db()
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
function formatQuery(players, strict, unfiltered) {
    let query = {}

    if (strict === 'false' && !unfiltered) {
        query = { $or: [] }

        for (let i = 0; i < players.length; i++) {
            if (players[i].name) {
                query.$or.push({
                    'p1.name': players[i].name
                })
                query.$or.push({
                    'p2.name': players[i].name
                })
            }

            if (players[i].character) {
                query.$or.push({
                    'p1.character': players[i].character
                })
                query.$or.push({
                    'p2.character': players[i].character
                })
            }
        }
    } else if (strict === 'true' && !unfiltered) {      
        for (let i = 0; i < players.length; i++) {
            if (players[i].name) {
                query[`p${i + 1}.name`] = players[i].name
            }

            if (players[i].character) {
                query[`p${i + 1}.character`] = players[i].character
            }
        }
    }

    return query
}