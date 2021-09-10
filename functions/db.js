
const { configs } = require('./CloudConfig')
let dev = process.env.FUNCTIONS_EMULATOR === 'true'
let url = (dev ? configs.dev.mongodb : configs.prod.mongodb)
const MongoClient = require('mongodb').MongoClient
var client

module.exports = async () => {
    if (client) {
        // return client if connection is established
        console.log("Already connected to MongoDB")
      } else try {
        console.log("No MongoDB connection found; connecting")
        client = await MongoClient.connect(url, {useNewUrlParser: true})
      } catch(error) {
        throw error
      }
      
      return client
}