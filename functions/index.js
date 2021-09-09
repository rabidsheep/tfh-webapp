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
//const connectMongoDb = () => MongoClient.connect(dbUrl, { useUnifiedTopology: true })
const youtubeKey = configs.youtube.key
const itemsPerPage = 5


var client = null
MongoClient.connect(dbUrl, function(err, db) {
    if (err) throw err
    
    return client = db
})

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
        let group = req.query.filters.group.title ? req.query.filters.group : null
        let hasFile = req.query.filters.hasFile === 'true' ? true : false
        let hasVideo = req.query.filters.hasVideo === 'true' ? true : false
        let unfiltered = true
        skip = req.query.page > 0 ? (req.query.page - 1) * itemsPerPage : 0


        for (let i = 0; i < 2; i++) {
            if (players[i].name) {
                unfiltered = false
                break
            }

            if (players[i].character) {
                unfiltered = false
                break
            }
        }

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
            { '$sort': { '_id.uploadDate': -1 } },
            { '$skip': skip },
            { '$limit': itemsPerPage }
        ])
        .toArray(),
    ])
    .then((results) => {
        let count = results[0].length
        let groups = results[1]
        console.log(groups)
        
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
    
    let db = client.db('tfhr')

    return db.collection('matches')
    .insertMany(matches)
    .then((results) => {
        let matchIds = (Object.values(results.insertedIds)).map(id => id.toString())

        console.log('Matches uploaded:')
        for (id in matchIds) console.log(matchIds[id])
        
        return res.status(200).send({matchIds: matchIds})
    })
    .catch((error) => res.status(400).send(error.toString()))
})

/** update match info using edit page */
api.put('/matches/update', (req, res) => {
    let matches = req.body.matches

    let deleted = req.body.deleted.map(id => mongo.ObjectId(id))

    console.log('Connected.\nUpdating matches...')

    let db = client.db('tfhr')

    db.collection('matches')
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
        return res.status(200).send()
    })
    .catch((error) => res.status(400).send(error.toString()))
})

/** get list of groups */
api.get('/filter/content', (req, res) => {

    let db = client.db('tfhr')

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

        console.log('Returning filter content.')

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
    //console.log(admin.auth())
    console.log('Verifying User')
    if (!req.headers.authorization && !dev) {
        console.log('Unauthorized')
        res.status(403).send('Unauthorized')
    }

    let db = client.db('tfhr')

    if (dev) {
        console.log('Retrieving user info')


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
            console.log(user)
            //client.close()
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
    let db = client.db('tfhr')

    if (dev) {
        console.log('Creating user')

        db
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
            console.log('Creating user')

            return db.collection('users')
            .updateOne(
                { uid: user.uid },
                { $set: { email: user.email } },
                { upsert: true }
            )
        })
        .then(() => {
            //client.close()

            return res.status(200).send(`${user.email} saved`)
        })
        .catch((error) => res.status(400).send(error.toString()))
    }
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
                date: formatDate(youtube.data.items[0].snippet.publishedAt.split('T')[0]),
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