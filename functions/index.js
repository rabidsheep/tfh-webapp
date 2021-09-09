const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { configs } = require('./CloudConfig')
let dev = (process.env.FUNCTIONS_EMULATOR === 'true' ? true : false)
admin.initializeApp()

/** establish mongodb connection */
let dbUrl = (dev ? configs.dev.mongodb : configs.prod.mongodb)
const mongo = require('mongodb')
const MongoClient = mongo.MongoClient
let client = null

async function connectToDb() {
    await MongoClient.connect(dbUrl, function(err, db) {
        if (err) throw err

        console.log("Global: Connecting to MongoDB.")

        return client = db
    })
}

connectToDb()

/******************************/

const express = require('express')
const cors = require('cors')({ origin: true })
const axios = require('axios')
const api = express()
api.use(cors)

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
        let group = req.query.filters.group.title ? req.query.filters.group : null
        let strict = req.query.filters.strict === 'true'
        let hasFile = req.query.filters.hasFile === 'true'
        let hasVideo = req.query.filters.hasVideo === 'true'
        let unfiltered = !players.some((player) => player.name || player.character)
        skip = req.query.page > 0 ? (req.query.page - 1) * itemsPerPage : 0

        query = formatQuery(players, strict, unfiltered, group, hasFile, hasVideo)
    } else {
        query = { 'uploadId': req.query.uploadId }
    }

    const pipeline = [
        { '$match': query },
        { '$sort': { 'order': 1 } },
        { '$group': {
            _id: {
                uploadId: '$uploadId',
                group: '$group',
                uploadForm: '$uploadForm',
                video: '$video.id',
                channel: '$channel.id',
                uploadDate: { '$concat': ['$uploadDate', 'T', '$uploadTime'] },
                originalDate: {
                    '$cond': {
                        if: { '$eq': ['$type', 'Group' ] },
                        then: '$group.date',
                        else: '$fileInfo.date',
                    }
                }
            },
            matches: {
                '$push': {
                    _id: '$_id',
                    userId: '$userId',
                    p1: '$p1',
                    p2: '$p2',
                    uploadId: '$uploadId',
                    video: '$video',
                    channel: '$channel',
                    group: '$group',
                    fileInfo: '$fileInfo',
                    order: '$order',
                }
            },
        }},
    ]

    
    if (client) {
        var db = client.db('tfhr')
        console.log("api.get('/matches'): Connected @ %s", new Date().toLocaleString())
        console.log("api.get('/matches'): Filtering with query:\n", query)
    } else {
        console.log("api.get('/matches'): Failed")
        if (!client) console.log("api.get('/matches'): No MongoDb connection found")
        return res.status(400).send("api.get('/matches') failed")
    }
    
    return Promise.all([
        // for getting result count
        // need to use length instead of count -- if no matches then count will be undefined
        db
        .collection('matches')
        .aggregate([
            ...pipeline
        ])
        .toArray(),

        // for getting matches to display on current page
        db
        .collection('matches')
        .aggregate([
            ...pipeline,
            { '$sort': { '_id.uploadDate': -1 } },
            { '$skip': skip },
            { '$limit': itemsPerPage }
        ])
        .toArray(),
    ])
    .then((results) => {
        let count = results[0].length
        let groups = results[1]
        /*groups.forEach((group) =>
            console.log(group._id.group.title + ', ' + group._id.group.date + ' || Upload ID: ' + group._id.uploadId))*/
        console.log("api.get('/matches'): Returning " + count + " group(s).")
        
        return res.status(200).send({
            count: count,
            groups: groups
        })
    })
    .catch((error) => res.status(400).send(error.toString()))
})

/** upload matches to db */
api.put('/matches', (req, res) => {
    let uploadId = mongo.ObjectId().toString()

    let matches = req.body.matches.map((match) => {
        match.uploadId = uploadId
        
        return match
    })

    console.log(matches)
    
    
    
    if (client) {
        var db = client.db('tfhr')
        console.log("api.put('/matches'): Connected @", new Date().toLocaleString())
    } else {
        console.log("api.put('/matches'): Failed")
        if (!client) console.log("api.put('/matches'): No MongoDb connection found.")
        return res.status(400).send("api.put('/matches') failed")
    }


    return db.collection('matches')
    .insertMany(matches)
    .then((results) => {
        let matchIds = (Object.values(results.insertedIds)).map(id => id.toString())

        console.log("api.put('/matches'): Matches uploaded:")
        for (id in matchIds) console.log(matchIds[id])
        
        return res.status(200).send({matchIds: matchIds})
    })
    .catch((error) => res.status(400).send(error.toString()))
})

/** update match info using edit page */
api.put('/matches/update', (req, res) => {
    
    let matches = req.body.matches
    let deleted = req.body.deleted.map(id => mongo.ObjectId(id))

    
    if (client) {
        var db = client.db('tfhr')
        console.log("api.put('/matches/update'): Connected @", new Date().toLocaleString())
    } else {
        console.log("api.put('/matches/update'): Failed")
        if (!client) console.log("api.put('/matches/update'): No MongoDb connection found")
        return res.status(400).send("api.put('/matches/update') failed")
    }

    return db.collection('matches')
    .deleteMany({ _id: { $in: deleted } })
    .then(() => {
        for (i in matches) {
            db.collection('matches')
            .updateOne(
                { _id: mongo.ObjectId(matches[i]._id) },
                { $set: {
                    group: matches[i].group,
                    p1: matches[i].p1,
                    p2: matches[i].p2,
                    video: matches[i].video,
                    channel: matches[i].channel,
                    order: matches[i].order,
                    
                }},
            )
        }

        return null
    })
    .then(() => { 
        //client.close()
        console.log("api.put('/matches/update'): Matches updated")
        return res.status(200).send()
    })
    .catch((error) => res.status(400).send(error.toString()))
})

/** get list of groups */
api.get('/filter/content', (req, res) => {
    
    if (client) {
        var db = client.db('tfhr')
        console.log("api.put('/filter/content'): Connected @", new Date().toLocaleString())
    } else {
        console.log("api.get('/filter/content'): Failed")
        if (!client) console.log("api.get('/filter/content'): No MongoDb connection found.")
        return res.status(400).send("api.get('/filter/content') failed")
    }

    const groups = [
        {'$match': { 'group': { '$ne': null } }},
        {'$group': {
            _id: '$group.title',
            sub: {
                
                '$addToSet': {
                    '$cond': {
                        if: {
                            '$ne': ['$group.part', null]
                        },
                        then: {
                            part: '$group.part',
                            date: '$group.date'
                        },
                        else: {
                            date: '$group.date'
                        }
                    }
                }
                
            }
        }},
        { '$sort': {
            '_id': -1,
            'sub.part': -1,
            'sub.date': -1
        }}
    ]

    const players = [
        {'$group': {
            _id: null,
            'p1': {'$addToSet': '$p1.name'},
            'p2': {'$addToSet': '$p2.name'} 
        }},
        {'$project': {
            'players': {'$setUnion': ['$p1', '$p2']}
        }}
    ]
    
    const channels = [
        {'$match': { 'channel': {'$ne': null} }},
        {'$group': {
            _id: null,
            channels: {'$addToSet': '$channel'}
        }
    }]

    return Promise.all([
        db.collection('matches')
        .aggregate([...groups])
        .toArray(),

        db.collection('matches')
        .aggregate([...players])
        .toArray(),

        db.collection('matches')
        .aggregate([...channels])
        .toArray()
    ])
    .then((results) => {
        let groups = results[0]
        let players = results[1][0].players
        let channels = results[2][0].channels

        console.log("api.get('/filter/content'): Returning filter content.")

        return res.status(200).send({
            groups: groups,
            players: players,
            channels: channels,
        })
    })
    .catch((error) => res.status(400).send(error.toString()))
})


/** authorize & verify user
 * verifyIdToken not currently working in dev environment???
*/
api.get('/users', (req, res) => {

    console.log("api.get('users'): Verifying User")
    if (!req.headers.authorization && !dev) {
        console.log("api.get('users'): Unauthorized")
        res.status(403).send('Unauthorized')
    }

    
    if (client) {
        var db = client.db('tfhr')
        console.log("api.get('/users'): Connected @", new Date().toLocaleString())
    } else {
        console.log("api.get('/users'): Failed")
        if (!client) console.log("api.get('/users'): No MongoDb connection found.")
        return res.status(400).send("api.get('users') failed")
    }

    if (dev) {
        return db.collection('users')
        .find(req.query)
        .toArray()
        .then((user) => {
            console.log(user)
            //client.close()
            return res.status(200).send(user)
        })
        .catch((error) => res.status(400).send(error.toString()))
    } else {
        return admin.auth()
        .verifyIdToken(req.headers.authorization)
        .then(() => {
            return db.collection('users')
            .find(req.query)
            .toArray()
        })
        .then((user) => {
            console.log("api.get('/users'):\n", user)
            return res.status(200).send(user)
        })
        .catch((error) => res.status(400).send(error.toString()))
    }
})

/** save user info to user table in db */
api.put('/users', (req, res) => {
    if (!req.headers.authorization && !dev) {
        res.status(403).send('Unauthorized')
    }

    let user = req.body

    if (client) {
        var db = client.db('tfhr')
        console.log("api.put('/users'): Connected @", new Date().toLocaleString())
    } else {
        console.log("api.put('/users'): Failed")
        if (!client) console.log("api.put('/users'): No MongoDb connection found.")
        return res.status(400).send("api.put('users') failed")
    }


    if (dev) {
        return db
        .collection('users')
        .updateOne(
            { uid: user.uid },
            { $set: { email: user.email } },
            { upsert: true }
        )
        .then(() => res.status(200).send(`${user.email} saved`))
        .catch((error) => res.status(400).send(error.toString()))
    } else {
        return admin.auth()
        .verifyIdToken(req.headers.authorization)
        .then(() => {
            console.log("api.put('/users'): Creating user")

            return db.collection('users')
            .updateOne(
                { uid: user.uid },
                { $set: { email: user.email } },
                { upsert: true }
            )
        })
        .then(() => res.status(200).send(`${user.email} saved`))
        .catch((error) => res.status(400).send(error.toString()))
    }
})

/** retrieve youtube video info */
api.get('/youtube-data', (req, res) => {
    if (!req.headers.authorization && !dev) {
      res.status(403).send('Unauthorized')
    }

    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${req.query.v}&key=${youtubeKey}`
    
    let axiosClient = null

    if (dev) {
        axiosClient = axios.get(url)
    } else {
        axiosClient = admin.auth()
        .verifyIdToken(req.headers.authorization)
        .then(() => {
            console.log("api.get('/youtube-data'): ID Token Verified")
            return axios.get(url)
        })
    }

    return axiosClient.then((youtube) => {
        if (youtube.data.items.length > 0) {
            console.log("api.get('/youtube-data'): Successfully retrieved Youtube data")

            return res.status(200).send({
                id: req.query.v,
                title: youtube.data.items[0].snippet.title,
                date: formatDate(youtube.data.items[0].snippet.publishedAt.split('T')[0]),
                description: youtube.data.items[0].snippet.description,
                channel: {
                    id: youtube.data.items[0].snippet.channelId,
                    name: youtube.data.items[0].snippet.channelTitle
                }
            })
        } else {
            console.log("api.get('/youtube-data'): Failed to retrieve Youtube data")

            return res.status(400).send('Invalid video')
        }
    })
    .catch((error) => res.status(400).send(error.toString()))
})

exports.api = functions.https.onRequest(api)

/************
* FUNCTIONS *
************/

function formatDate(date) {
    if (!date) return null

    const [year, month, day] = date.split('-')
    return `${month}-${day}-${year}`
}

// format query object for filtering matches
function formatQuery(players, strict, unfiltered, group, hasFile, hasVideo) {
    let query = {}
    if (players[0].name) players[0].name = new RegExp([players[0].name.replace(/[-[\]{}()*+?.,\\^$|]/g, "\\$&")], 'i')
    if (players[1].name) players[1].name = new RegExp([players[1].name.replace(/[-[\]{}()*+?.,\\^$|]/g, "\\$&")], 'i')
    let p1 = players[0]
    let p2 = players[1]

    if (!strict && !unfiltered) {
        query = { $or: [{}, {}] }

        // need help trimming this down
        if (p1.name) {
            query.$or[0] = {
                'p1.name': p1.name,
                ...query.$or[0]
            }
            query.$or[1] = {
                'p2.name': p1.name,
                ...query.$or[1]
            }
        }

        if (p2.name) {
            query.$or[0] = {
                'p2.name': p2.name,
                ...query.$or[0]
            }
            query.$or[1] = {
                'p1.name': p2.name,
                ...query.$or[1]
            }
        }
        
        if (p1.character) {
            query.$or[0] = {
                'p1.character': p1.character,
                ...query.$or[0]
            }
            query.$or[1] = {
                'p2.character': p1.character,
                ...query.$or[1]
            }
        }

        if (p2.character) {
            query.$or[0] = {
                'p2.character': p2.character,
                ...query.$or[0]
            }
            query.$or[1] = {
                'p1.character': p2.character,
                ...query.$or[1]
            }
        }
    } else if (strict && !unfiltered) {      
        for (let i = 0; i < 2; i++) {
            if (players[i].name) {
                query[`p${i + 1}.name`] = players[i].name
            }

            if (players[i].character) {
                query[`p${i + 1}.character`] = players[i].character
            }
        }
    }

    if (group) {
        query = {
            // allow partial matches for group names?
            'group.title': new RegExp([group.title.replace(/[-[\]{}()*+?.,\\^$|]/g, "\\$&")], 'i'),
            ...query
        }

        if (group.part) {
            query = {
                'group.part': new RegExp([group.part.replace(/[-[\]{}()*+?.,\\^$|]/g, "\\$&")], 'i'),
                ...query
            }
        }
    
        if (group.date) {
            query = {
                'group.date': group.date,
                ...query
            }
        }
    }

    if (hasFile) {
        query = {
            fileInfo: {'$ne': null},
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