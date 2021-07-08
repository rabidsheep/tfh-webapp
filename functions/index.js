const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const cors = require('cors')({ origin: true });
const api = express();
api.use(cors);

const MongoClient = require('mongodb').MongoClient;
const { query } = require('express');
const url = 'mongodb://127.0.0.1:27017/';
const connectMongoDb = () => MongoClient.connect(url, (err, client) => {
    if (err) {
        console.log('failed to connect')
    } else {
        console.log('connection succeeded')
    }
})
const itemsPerPage = 1;

api.get('*/matches', (req, result) => {
    MongoClient.connect(url, (err, client) => {
        let query = {}


            for (const index in [0,1]) {
                var i = parseInt(index) + 1;
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
        if (err) {
            console.log('Unable to connect', err);
        } else {
            console.log('Connected')
            console.log(query['p1Chara']);
            const db = client.db('tfhr')

            db.collection('matches').find(query).sort({timestamp: -1})
            .toArray(
                (err, res) => {
                    if (err) throw err;
                    client.close();
                    return result.status(200).send({ matches: res, count: res.length })
                }
            )
        }
    })
});


api.put('*/matches', (req) => {
    MongoClient.connect(url, (err, client) => {
        if (err) {
            console.log('Unable to connect', err);
        } else {
            console.log('Connected');
            const db = client.db('tfhr');
            db.collection('matches')
            .insertOne(
                req.body, (err) => {
                    /*if (err) {
                        console.log(err)
                        return null;
                    } else {
                        console.log('Success')
                        return null;
                    }*/

                    if (err) throw err;
                    console.log('Success')
                    client.close()
                    return null;
            })
        }
    })
});
exports.api = functions.https.onRequest(api)