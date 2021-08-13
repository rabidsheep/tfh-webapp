const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { configs } = require('./configs')
admin.initializeApp()

const express = require('express')
const cors = require('cors')({ origin: true })
const mongo = require('mongodb')
const MongoClient = mongo.MongoClient


const axios = require('axios')
const api = express()
api.use(cors)

var dev = null

if (process.env.FUNCTIONS_EMULATOR === 'true') {
    dev = true
} else {
    dev = false
}

let url = (dev ? configs.dev.mongodb : configs.prod.mongodb)

const youtubeKey = configs.youtube.key
const itemsPerPage = 5


/************
* API CALLS *
************/

/** retrieve match count and filter results */
api.get('/matches', (req, res) => {
    let query = {
        'players.0.name': null,
        'players.0.character.name': null,
        'players.1.name': null,
        'players.1.character.name': null
    }

    let skip = req.query.page > 0 ? (req.query.page - 1) * itemsPerPage : 0

    if (req.query.players) {
        query = formatQuery(query, req.query.players)
    }

    if (req.query.id) {
        query['_id'] = mongo.ObjectId(req.query.id)
    }

    MongoClient.connect(url, { useUnifiedTopology: true })
    .then((client) => {
        console.log('Connected @ %s', (new Date()).toLocaleString())
        console.log('Filtering with query:\n', query)
        let db = client.db('tfhr').collection('matches').find(query)

        return Promise.all([db, db.count()])
    })
    .then((results) => {
        let db = results[0]
        let count = results[1]
        console.log('Found ' + count + ' results.')

        return Promise.all([
            count,
            db.sort({uploadDate: -1, uploadTime: -1})
            .skip(skip)
            .limit(itemsPerPage)
            .toArray()
        ])
    })
    .then((results) => {
        return res.status(200).send({count: results[0], matches: results[1]})
    })
    .catch((error) => res.status(400).send(error.toString()))
})

/** upload matches to db */
api.put('/matches', (req, res) => {
    let match = req.body
    let players = [match.players[0].name, match.players[1].name]

    MongoClient.connect(url, { useUnifiedTopology: true })
    .then((client) => {
        console.log('Connected.\nUploading match...')
        let timestamp = ((new Date()).toISOString()).split('T')
        let db = client.db('tfhr')

        return Promise.all([
            db,
            db.collection('matches')
            .insertOne({
                uploadDate: timestamp[0],
                uploadTime: timestamp[1],
                ...match
            })
        ])
    })
    .then((results) => {
        let db = results[0]
        let matchId = results[1].insertedId

        // adds new entries to player collection
        for (i in players) {
            console.log('Checking player list for', players[i])

            db.collection('players')
            .updateOne(
                { 'name': players[i] },
                { $setOnInsert: { 'name': players[i] }},
                { upsert: true }
            )
        }

        console.log('Match uploaded.\nID: ', matchId)
        return res.status(200).send({ docId: matchId })
    })
    .catch((error) => res.status(400).send(error.toString()))
})

/** get list of currently existing players in db */
api.get('/players', (req, res) => {
    MongoClient.connect(url, { useUnifiedTopology: true })
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
        return MongoClient.connect(url, { useUnifiedTopology: true })
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
        return MongoClient.connect(url, { useUnifiedTopology: true })
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
function formatQuery(query, filters) {
    for (let i = 0; i < filters.length; i++) {
        if (filters[i].name && filters[i].name.length > 0) {
            query[`players.${i}.name`] = filters[i].name
        }

        if (filters[i].character && filters[i].character.id !== '0') {
            query[`players.${i}.character.name`] = filters[i].character.name
        }
    }

    return query
}