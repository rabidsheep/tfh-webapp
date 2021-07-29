const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

const express = require('express')
const cors = require('cors')({ origin: true })
const api = express()
api.use(cors)

const MongoClient = require('mongodb').MongoClient
const { response } = require('express')
const url = 'mongodb://127.0.0.1:27017/'
const itemsPerPage = 5

/************
* API CALLS *
************/

// retrieve match count and filter results
api.get('/matches', (req, res) => {
    let query = {
        'players.0.name': null,
        'players.0.character.name': null,
        'players.1.name': null,
        'players.1.character.name': null
    }
    let skip = req.query.page > 0 ? (req.query.page - 1) * itemsPerPage : 0
    console.log(req.query)
    if (req.query.filters) {
        query = formatQuery(query, req.query.filters)
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
                .sort({timestamp: -1})
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

// upload matches
api.put('/matches', (req, res) => {
    let players = [req.body.players[0].name, req.body.players[1].name]

    MongoClient.connect(url, { useUnifiedTopology: true }, (error, client) => {
        if (error) {
            console.log('Unable to connect: ', error)
        } else {
            console.log('Connected.\nUploading match...')
            let db = client.db('tfhr')

            db
            .collection('matches')
            .insertOne(req.body, (error, result) => {
                if (error) throw error
                
                // adds new entries to player collection
                for (i in players) {
                    console.log('Updating player list...')

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
            }
            )
        }



    })
})

api.get('/users', (req, res) => {

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

api.put('/users', (req, res) => {

    console.log('putting')
})

/*api.put('/files', (req, res) => {
    const uploads = req.body.uploads
    for (let i = 0; i < uploads.length; i++) {
        var data = uploads[i].uploadData
        
        storageName = `${data.uploaderId}_`
        + `${data.players[0].character.name}_vs_${data.players[1].character.name}_`
        + `${Date.now().toString()}.tfhr`
        uploads[i].uploadData.storageName = storageName
        console.log('Storage Name:', storageName)

        const storageRef = admin.storage()
        .ref(`${uploads[i].fileData.name}`)
        .put(uploads[i].fileData)
        
        storageRef
        .on(`state_changed`,
            error => {
                console.log(error.message)
            },
            () => {
                storageRef.snapshot.ref
                .getDownloadURL((url, error) => {
                    if (error) throw error
                    uploads[i].uploadData.fileUrl = url
                    this
                    .$matches
                    .save(uploads[i].uploadData, (error) => {
                        if (error) throw error
                        console.log('Match saved')
                    })
            })
            .catch((error) => {
                response.status(400).send(error.toString())
            })
        })
    }

    return res.status((200))
})*/

exports.api = functions.https.onRequest(api)

/************
* FUNCTIONS *
************/

// format query object for filtering matches
function formatQuery(query, filters) {
    console.log(filters)
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