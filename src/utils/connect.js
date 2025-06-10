const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017?replicaSet=rs0'; // 本地连接示例 ?replicaSet=rs0
let client;//全局共享连接实例
let db;
async function connect(database_name) {
  if (!client) {
    client = new MongoClient(uri, {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000
    })
    await client.connect()
    console.log('Connected to MongoDB!');
    db = client.db(database_name)
  }
  return db
}

function getClient() {
  if (!client) throw new Error("MongoDB client not initialized");
  return client
}

module.exports = { connect, getClient, getDB: () => db }
