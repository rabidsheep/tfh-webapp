
const { mongodb } = require('./CloudConfig');
const MongoClient = require('mongodb').MongoClient;
var client;

module.exports = async () => {
    if (client) {
        // return client if connection is established
        console.log("Already connected to MongoDB");
      } else try {
        console.log("No MongoDB connection found; connecting");
        client = await MongoClient.connect(mongodb.uri, mongodb.options);
      } catch(error) {
        throw error;
      }
      
      return client;
}