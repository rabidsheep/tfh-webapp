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
/** you need to set up .runtimeconfig.json to use functions.config()
 * from root folder:
 * 1. cd functions
 * 2. firebase functions:config:get > .runtimeconfig.json
 * 3. add respective keys to .runtimeconfig.json
 */

var url = null

if (process.env.FUNCTIONS_EMULATOR === 'true') {
    url = configs.dev.mongodb
} else {
    url = configs.prod.mongodb
}

//var url = "mongodb+srv://admin:QLOGVgYtVHxhEGnt@cluster0.uez1g.mongodb.net/tfhr?retryWrites=true&w=majority"

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

    MongoClient.connect(url, { useUnifiedTopology: true }, (error, client) => {
        if (error) {
            console.log('Unable to connect: ', error)
        } else {
            console.log('Connected @ %s', (new Date()).toLocaleString())
            console.log('Filtering with query:\n', query)
            const db = client.db('tfhr').collection('matches').find(query)

            /* get count of all documents that match query
            this will take into account if someone has uploaded a new
            match */
            db
            .count((error, count) => {
                if (error) throw error
                console.log('Found ' + count + ' results.')

                /* get the matches that will display
                based on current page position */
                db
                .sort({uploadDate: -1, uploadTime: -1})
                .skip(skip)
                .limit(itemsPerPage)
                .toArray((error, matches) => {
                        if (error) throw error
                        console.log('Matches retrieved.')
                        return res.status(200).send({ matches: matches, count: count })
                    })
                }
            )
        }
    })
})

/** upload matches to db */
api.put('/matches', (req, res) => {
    let match = req.body
    let players = [match.players[0].name, match.players[1].name]

    MongoClient.connect(url, { useUnifiedTopology: true }, (error, client) => {
        if (error) {
            console.log('Unable to connect: ', error)
        } else {
            console.log('Connected.\nUploading match...')
            let timestamp = ((new Date()).toISOString()).split('T')
            let db = client.db('tfhr')

            if (error) throw error

            db
            .collection('matches')
            .insertOne({
                uploadDate: timestamp[0],
                uploadTime: timestamp[1],
                ...match}, (error, result) => {
                if (error) throw error
                
                // adds new entries to player collection
                for (i in players) {
                    console.log('Checking player list for', players[i])

                    db
                    .collection('players')
                    .updateOne(
                        { 'name': players[i] },
                        { $setOnInsert: { 'name': players[i] }},
                        { upsert: true }
                    )
                }

                console.log('Match uploaded.\nID: ', result.insertedId)
                return res.status(200).send({ docId: result.insertedId })
            })
        }
    })

})

/** get list of currently existing players in db */
api.get('/players', (req, res) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, (error, client) => {
        if (error) {
            console.log('Unable to connect: ', error)
        } else {
            console.log('Connected.\nRetrieving players...')

            client
            .db('tfhr')
            .collection('players')
            .distinct('name', (error, result) => {
                if (error) throw error
                console.log('Returning players list.')
                return res.status(200).send({ players: result })
            })
        }
    })
})

/** authorize & verify user
 * verifyIdToken not currently working in dev environment???
*/
api.get('/users', (req, res) => {
    //console.log(admin.auth())
    if (!req.headers.authorization) {
        res.status(403).send('Unauthorized')
    }
    admin.auth().verifyIdToken(req.headers.authorization)
    .then((token) => {
        console.log(token)
        return null
    })
    .catch((error) => {
        console.log(error)
    })

})

/** save user info to user table in db */
/*api.put('/users', (req, res) => {
    // call to save user info to user table
})*/

/** retrieve youtube video info */
api.get('/youtube-data', (req, res) => {
    /*this breaks the function
    need to implement id verification first
    if (!req.headers.authorization) {
      res.status(403).send('Unauthorized')
    }*/

    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${req.query.v}&key=${youtubeKey}`
    
    return axios.get(url)
    .then((youtube, error) => {

        if (error) throw error


            if (youtube.data.items.length > 0) {
                res.status(200).json({
                    id: req.query.v[0],
                    title: youtube.data.items[0].snippet.title,
                    date: youtube.data.items[0].snippet.publishedAt.split('T')[0],
                    description: youtube.data.items[0].snippet.description,
                    channel: {
                    id: youtube.data.items[0].snippet.channelId,
                    name: youtube.data.items[0].snippet.channelTitle
                    }
                })
            } else {
                res.status(400).send(error)
            }

        return res
    })
    .catch((error) => res.status(400).send(error.toString()))

/*admin.auth().verifyIdToken(request.headers.authorization).then(() => {
    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${request.query.v}&key=${youtubeKey}`
    return axios.get(url)
      .then((youtube) => {
        if (youtube.data.items.length > 0) {
          response.status(200).json({
            id: request.query.v,
            title: youtube.data.items[0].snippet.title,
            date: youtube.data.items[0].snippet.publishedAt.split('T')[0],
            description: youtube.data.items[0].snippet.description,
            channel: {
              id: youtube.data.items[0].snippet.channelId,
              name: youtube.data.items[0].snippet.channelTitle
            }
          })
        } else {
          response.status(400).send('Invalid video')
        }
      })
      .catch((error) => response.status(400).send(error.toString()))
  }).catch((error) => response.status(400).send(error.toString()))*/
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