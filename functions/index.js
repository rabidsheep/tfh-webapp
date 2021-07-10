const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const cors = require('cors')({ origin: true });
const api = express();
api.use(cors);

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017/';
const itemsPerPage = 5;

/************
* API CALLS *
************/

// retrieve match count and filter results
api.get('/matches', (req, res) => {
    let query = {}
    let skip = req.query.page > 0 ? (req.query.page - 1) * itemsPerPage : 0;

    query = formatQuery(query, req.query.playerInfo);

    MongoClient.connect(url, { useUnifiedTopology: true }, (error, client) => {
        if (error) {
            console.log('Unable to connect: ', error);
        } else {
            console.log('Connected @ %s', (new Date()).toLocaleString())
            console.log('Filtering with query:\n', query);
            const db = client.db('tfhr').collection('matches').find(query);

            /* get count of all documents that match query
            this will take into account if someone has uploaded a new
            match */
            db
            .count((error, count) => {
                if (error) throw error;
                console.log('Found ' + count + ' results.')

                /* get the matches that will display
                based on current page position */
                db
                .sort({timestamp: -1})
                .skip(skip)
                .limit(itemsPerPage)
                .toArray((error, matches) => {
                        if (error) throw error;
                        console.log('Matches retrieved.');
                        client.close();
                        return res.status(200).send({ matches: matches, count: count })
                    })
                }
            )
        }
    })
});

// upload matches
api.put('/matches', (req, res) => {
    MongoClient.connect(url, (error, client) => {
        if (error) {
            console.log('Unable to connect: ', error);
        } else {
            console.log('Connected.\nUploading match...');

            client
            .db('tfhr')
            .collection('matches')
            .insertOne(req.body, (error, result) => {
                if (error) throw error;
                console.log('Match uploaded.\nID: ', result.insertedId);
                client.close();
                return res.status((200)).send({ docId: result.insertedId });
            })
        }
    })
});

exports.api = functions.https.onRequest(api);

/************
* FUNCTIONS *
************/

// format query object for filtering matches
function formatQuery(query, filter) {

    for (let i = 1; i <= 2; i++) {
        // player name fields will not exist if name is null or empty string
        if (filter['p' + i].name.length > 0) {
            query['p' + i] = filter['p' + i].name;
        }

        // character fields in query will not exist if character ID = 0 (any character)
        if (filter['p' + i].character.id !== '0') {
            query['p' + i + 'Chara'] = {
                name: filter['p' + i].character.name,
                devName: filter['p' + i].character.devName,
                id: parseInt(filter['p' + i].character.id)
            }
        }
    }

    return query;
}