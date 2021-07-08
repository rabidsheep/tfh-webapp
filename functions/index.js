const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const cors = require('cors')({ origin: true });
const api = express();
api.use(cors);

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017/';
const itemsPerPage = 1;

api.get('*/matches', (req, result) => {
        MongoClient.connect(url, (err, client) => {
            if (err) {
                console.log('Unable to connect', err);
            } else {
                console.log('Connected')
                const db = client.db('tfhr')

                db.collection('matches').find({})
                .toArray(
                    (err, res) => {
                        if (err) {
                            console.log(err)
                            return null;
                        } else if (res.length) {
                           return result.status(200).send({ matches: res, count: res.length })
                        }

                        client.close();
                        return null;
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
                req.body, (err, result) => {
                    if (err) {
                        console.log(err)
                        return null;
                    } else {
                        console.log(result);
                        console.log('Success')
                        return null;
                    }
            })
        }
    })
});

exports.api = functions.https.onRequest(api)