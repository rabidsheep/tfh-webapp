const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { devMode, youtubeKey } = require('./CloudConfig');
const express = require('express');
const cors = require('cors')({ origin: true });

const ObjectId = require('mongodb').ObjectId;
const axios = require('axios');
const api = express();
api.use(cors);

const mongoDb = require('./db');
const itemsPerPage = 5;

admin.initializeApp();

/************
* API CALLS *
************/

/** retrieve match count and filter results */
api.get('/matches', (req, res) => {
    let query = {};
    let skip = 0;

    if (req.query.filters) {
        let players = req.query.filters.players;
        let group = req.query.filters.group.title ? req.query.filters.group : null;
        let strict = req.query.filters.strict === 'true';
        let hasFile = req.query.filters.hasFile === 'true';
        let hasVideo = req.query.filters.hasVideo === 'true';
        let unfiltered = !players.some((player) => player.name || player.character);
        skip = req.query.page > 0 ? (req.query.page - 1) * itemsPerPage : 0;

        query = formatQuery(players, strict, unfiltered, group, hasFile, hasVideo);
    } else {
        query = { 'uploadId': req.query.uploadId };
    }
    const countAggregate = [
        { $group: { '_id': '$uploadId' } },
        { $count: 'count'}
    ]

    const groupAggregate = [
        { $sort: { order: 1 } },
        { $group: {
            '_id': {
                'uploadId': '$uploadId',
                'group': '$group',
                'uploadForm': '$uploadForm',
                'video': '$video.id',
                'channel': '$channel.id',
                'uploadDate': { $concat: ['$uploadDate', 'T', '$uploadTime'] },
                'originalDate': {
                    $cond: {
                        if: { $eq: [ '$type', 'Group' ] },
                        then: '$group.date',
                        else: '$fileInfo.date',
                    }
                }
            },
            'matches': {
                $push: {
                    '_id': '$_id',
                    'userId': '$userId',
                    'p1': '$p1',
                    'p2': '$p2',
                    'uploadId': '$uploadId',
                    'video': '$video',
                    'channel': '$channel',
                    'group': '$group',
                    'fileInfo': '$fileInfo',
                    'order': '$order',
                }
            },
        }},
        { $sort: { '_id.uploadDate': -1 } },
        { $skip: skip },
        { $limit: itemsPerPage }
    ];

    const facet = [
        { $match: query },
        { $facet: { countAggregate, groupAggregate } }
    ];

    return mongoDb()
    .then((client) =>
        client.db('tfhr')
        .collection('matches')
        .aggregate(facet)
        .toArray()
    )
    .then((results) => {
        console.log(results[0])
        let count = results[0].countAggregate[0] ? results[0].countAggregate[0].count : 0;
        let groups = results[0].groupAggregate;
        console.log("api.get('/matches'): Returning " + count + " group(s).");
        
        return res.status(200).send({count, groups});
    })
    .catch((error) => res.status(400).send(error.toString()));
})

/** upload matches to client.db('tfhr') */
api.put('/matches', (req, res) => {
    let uploadId = ObjectId().toString();
    let matches = req.body.matches;

    matches.forEach((match) => match.uploadId = uploadId);

    return mongoDb()
    .then((client) => 
        client.db('tfhr')
        .collection('matches')
        .insertMany(matches)
    )
    .then((results) => {
        let matchIds = Object.values(results.insertedIds).map(id => id.toString());

        console.log("api.put('/matches'): Matches uploaded:");
        matchIds.forEach((id) => console.log(id))

        return res.status(200).send({matchIds});
    })
    .catch((error) => res.status(400).send(error.toString()));
})

api.get('/edit', (req, res) => {
    let query = { 'uploadId': req.query.uploadId };

    const editAggregate = [
        { $match: query },
        { $sort: { order: 1 } },
        { $group: {
            '_id': '$uploadId',
            'info': {
                $first: {
                    'group': '$group',
                    'uploadForm': '$uploadForm',
                    'video': {
                        'id': '$video.id',
                        'title': '$video.title',
                    },
                    'channel': '$channel',
                }
            },
            'matches': {
                $push: {
                    '_id': '$_id',
                    'userId': '$userId',
                    'p1': '$p1',
                    'p2': '$p2',
                    'video': '$video',
                    'channel': '$channel',
                    'group': '$group',
                    'fileInfo': '$fileInfo',
                    'order': '$order',
                }
            },
        }},
    ]

    return mongoDb()
    .then((client) =>
        client.db('tfhr')
        .collection('matches')
        .aggregate(editAggregate)
        .toArray()
    )
    .then((results) => {
        console.log(results[0])
        let group = results[0]
        console.log("api.get('/edit'): Returning group ID", query.uploadId);
        
        return res.status(200).send(group);
    })
    .catch((error) => res.status(400).send(error.toString()));
})

/** update match info using edit page */
api.put('/edit', (req, res) => {
    console.log(req.body)
    let matches = req.body.matches;
    let deleted = req.body.deleted.map(id => ObjectId(id));

    return mongoDb()
    .then((client) =>
        Promise.all([
            // update matches
            matches.forEach((match) => {
                console.log(match)
                    let data = [
                        { _id: ObjectId(match._id) },
                        { $set: {
                            p1: match.p1,
                            p2: match.p2,
                            video: match.video,
                            channel: match.channel,
                            group: match.group,
                            fileInfo: match.fileInfo,
                            order: match.order
                        } }
                    ]

                    client.db('tfhr')
                    .collection('matches')
                    .updateOne(...data)
                }
            ),
            
            // delete matches if any were removed
            client.db('tfhr')
            .collection('matches')
            .deleteMany({ _id: { $in: deleted } })
        ])
    )
    .then(() => {
        console.log("api.put('/edit'): Matches updated");
        return res.status(200).send();
    })
    .catch((error) => res.status(400).send(error.toString()));
})

/** get list of groups */
api.get('/filter/content', (req, res) => {
    const groups = [
        { $match: { 'group': { $ne: null } } },
        { $group: {
            '_id': '$group.title',
            'sub': {
                $addToSet: {
                    $cond: {
                        if: { $ne: ['$group.part', null] },
                        then: {
                            'part': '$group.part',
                            'date': '$group.date'
                        },
                        else: { 'date': '$group.date' }
                    }
                }
                
            }
        } },
        { $sort: {
            '_id': -1,
            'sub.part': -1,
            'sub.date': -1
        } }
    ];

    const players = [
        { $group: {
            '_id': null,
            'p1': { $addToSet: '$p1.name' },
            'p2': { $addToSet: '$p2.name' } 
        } },
        { $project: {
            'players': { $setUnion: ['$p1', '$p2'] }
        } }
    ];
    
    const channels = [
        { $match: { 'channel': {$ne: null} } },
        { $group: {
            '_id': '$channel.id',
            'name': { $first: '$channel.name' },
            'videos': { $addToSet: {
                id: '$video.id',
                title: '$video.title'
            } }
        } }
    ];

    const facet = [{ $facet: { groups, players, channels } }];

    return mongoDb()
    .then((client) =>
        client.db('tfhr')
        .collection('matches')
        .aggregate(facet)
        .toArray()
    )
    .then((results) => {
        console.log(results[0])
        let groups = results[0].groups;
        let players = results[0].players[0].players;
        let channels = results[0].channels;

        console.log("api.get('/filter/content'): Returning filter content.");

        return res.status(200).send({groups, players, channels});
    })
    .catch((error) => res.status(400).send(error.toString()));
})


/** authorize & verify user
 * verifyIdToken not currently working in dev environment???
*/
api.get('/users', (req, res) => {
    if (!req.headers.authorization && !devMode) {
        console.log("api.get('/users'): Unauthorized");
        res.status(403).send('Unauthorized');
    }

    console.log("api.get('users'): Verifying User");

    let getUserRef;

    if (devMode) {
        getUserRef = mongoDb()
    } else {
        getUserRef = admin.auth()
        .verifyIdToken(req.headers.authorization)
        .then(() => mongoDb())
    }

    return getUserRef.then((client) =>
        client.db('tfhr')
        .collection('users')
        .find(req.query)
        .toArray()
    )
    .then((user) => {
        console.log("api.get('/users'):\n", user)
        return res.status(200).send(user)
    })
    .catch((error) => res.status(400).send(error.toString()))
})

/** save user info to user table in client.db('tfhr') */
api.put('/users', (req, res) => {
    if (!req.headers.authorization && !devMode) {
        console.log("api.put('/users'): Unauthorized");
        res.status(403).send('Unauthorized')
    }

    let user = req.body;
    let createUserRef;

    if (devMode) {
        createUserRef = mongoDb();
    } else {
        createUserRef = admin.auth()
        .verifyIdToken(req.headers.authorization)
        .then(() => mongoDb());
    }
    
    return createUserRef.then((client) => {
        console.log("api.put('/users'): Creating user");

        return client.db('tfhr')
        .collection('users')
        .updateOne(
            { uid: user.uid },
            { $set: { email: user.email } },
            { upsert: true }
        );
    })
    .then(() => res.status(200).send(`${user.email} saved`))
    .catch((error) => res.status(400).send(error.toString()));

})

/** retrieve youtube video info */
api.get('/youtube-data', (req, res) => {
    if (!req.headers.authorization && !devMode) {
        console.log("api.put('/youtube-data'): Unauthorized");
        res.status(403).send('Unauthorized');
    }

    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${req.query.id}&key=${youtubeKey}`
    
    let axiosRef;

    if (devMode) {
        axiosRef = axios.get(url);
    } else {
        axiosRef = admin.auth()
        .verifyIdToken(req.headers.authorization)
        .then(() => {
            console.log("api.get('/youtube-data'): ID Token Verified")
            return axios.get(url)
        });
    }

    return axiosRef.then((youtube) => {
        if (youtube.data.items.length > 0) {
            console.log("api.get('/youtube-data'): Successfully retrieved Youtube data");
            let data = youtube.data.items[0].snippet;
            let video = {
                id: req.query.id,
                title: data.title,
                date: formatDate(data.publishedAt.split('T')[0]),
                description: data.description,
            }
            let channel = {
                id: data.channelId,
                name: data.channelTitle
            }

            return res.status(200).send({video, channel});
        } else {
            console.log("api.get('/youtube-data'): Failed to retrieve Youtube data");

            return res.status(400).send('Invalid video');
        }
    })
    .catch((error) => res.status(400).send(error.toString()));
})

exports.api = functions.https.onRequest(api)

/************
* FUNCTIONS *
************/

function formatDate(date) {
    if (!date) return null;

    const [year, month, day] = date.split('-');
    return `${month}-${day}-${year}`;
}

// format query object for filtering matches
function formatQuery(players, strict, unfiltered, group, hasFile, hasVideo) {
    let query = {};
    if (players[0].name)
        players[0].name = new RegExp([players[0].name.replace(/[-[\]{}()*+?.,\\^$|]/g, "\\$&")], 'i');
    if (players[1].name)
        players[1].name = new RegExp([players[1].name.replace(/[-[\]{}()*+?.,\\^$|]/g, "\\$&")], 'i');
    let p1 = players[0];
    let p2 = players[1];

    if (!strict && !unfiltered) {
        query = { $or: [{}, {}] };

        // need help trimming this down
        if (players[0].name) {
            query.$or[0] = {
                'p1.name': players[0].name,
                ...query.$or[0]
            };

            query.$or[1] = {
                'p2.name': players[0].name,
                ...query.$or[1]
            };
        }

        if (players[1].name) {
            query.$or[0] = {
                'p2.name': players[1].name,
                ...query.$or[0]
            };

            query.$or[1] = {
                'p1.name': players[1].name,
                ...query.$or[1]
            };
        }
        
        if (players[0].character) {
            query.$or[0] = {
                'p1.character': players[0].character,
                ...query.$or[0]
            };

            query.$or[1] = {
                'p2.character': players[0].character,
                ...query.$or[1]
            };
        }

        if (players[1].character) {
            query.$or[0] = {
                'p2.character': players[1].character,
                ...query.$or[0]
            };

            query.$or[1] = {
                'p1.character': players[1].character,
                ...query.$or[1]
            };
        }
    } else if (strict && !unfiltered) {      
        for (let i = 0; i < 2; i++) {
            if (players[i].name)
                query[`p${i + 1}.name`] = players[i].name;

            if (players[i].character)
                query[`p${i + 1}.character`] = players[i].character;
        }
    }

    if (group) {
        query = {
            // allow partial matches for group names?
            'group.title': new RegExp([group.title.replace(/[-[\]{}()*+?.,\\^$|]/g, "\\$&")], 'i'),
            ...query
        };

        if (group.part) {
            query = {
                'group.part': new RegExp([group.part.replace(/[-[\]{}()*+?.,\\^$|]/g, "\\$&")], 'i'),
                ...query
            };
        }
    
        if (group.date) {
            query = {
                'group.date': group.date,
                ...query
            };
        }
    }

    if (hasFile) {
        query = {
            fileInfo: {$ne: null},
            ...query
        };
    }

    if (hasVideo) {
        query = {
            video: {$ne: null},
            ...query
        };
    }

    return query;
}