const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const cors = require('cors')({ origin: true });
const api = express();
api.use(cors);

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017/';
/*const connectMongoDb = () => MongoClient.connect(url, (err, client) => {
    if (err) {
        console.log('failed to connect')
    } else {
        console.log('connection succeeded')
    }
})*/
const itemsPerPage = 5;

api.get('/matches', (req, res) => {
    let query = {}
    let page = req.query.page;
    let skip = page > 0 ? (page - 1) * itemsPerPage : 0;


    for (let i = 1; i <= 2; i++) {
        if (req.query['p' + i].name.length>0) {
            query['p' + i] = req.query['p' + i].name;
        }

        if (req.query['p' + i].character && req.query['p' + i].character.id !== '0') {
            query['p' + i + 'Chara'] = {
                name: req.query['p' + i].character.name,
                devName: req.query['p' + i].character.devName,
                id: parseInt(req.query['p' + i].character.id)
            }
        }
    }

    /* this is really ugly and slow because it waits for the first query
    to finish before it starts the second one
    please help me fix it */
    MongoClient.connect(url, (error, client) => {
        if (error) {
            console.log('Unable to connect', error);
        } else {
            console.log('Connected')
            console.log(query['p1Chara']);
            const db = client.db('tfhr')

            // first query gets count of all documents that match query
            db.collection('matches')
            .find(query)
            .sort({timestamp: -1})
            .toArray((error, result) => {
                if (error) throw error;
                let count = result.length;

                // second query gets the matches that will display based on pagination
                db.collection('matches')
                .find(query)
                .skip(skip)
                .limit(itemsPerPage)
                .toArray((error2, result2) => {
                        if (error2) throw error2;
                        let matches = result2;
                        return res.status(200).send({ matches: matches, count: count })
                    })
                }
            )
        }
    })

    /* old code that just fetched documents that match query
    MongoClient.connect(url, (error, client) => {
        if (error) {
            console.log('Unable to connect', error);
        } else {
            console.log('Connected')
            console.log(query['p1Chara']);
            const db = client.db('tfhr')

            db.collection('matches').find(query).sort({timestamp: -1})
            .toArray(
                (error, result) => {
                    if (error) throw error;
                    client.close();
                    return res.status(200).send({ matches: result, count: result.length })
                }
            )
        }
    })*/


});

/* for some reason this call hangs until it times out after
~60s? i don't know why */
api.put('/matches', (req) => {
    MongoClient.connect(url, (err, client) => {
        if (err) {
            console.log('Unable to connect', err);
        } else {
            console.log('Connected');
            const db = client.db('tfhr');
            db.collection('matches')
            .insertOne(req.body, (err, res) => {
                if (err) throw err;
                console.log('Success')
                client.close()
                return res.status(200).send();
            })
        }
    })
});

exports.api = functions.https.onRequest(api)