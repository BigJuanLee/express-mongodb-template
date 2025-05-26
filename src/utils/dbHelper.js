const { mongoClient } = require('./connect')

async function getDB(dbName = 'local') {
    const client = await mongoClient
    return client.db(dbName)
}

async function getCollection(dbName, collectionName) {
    const db = await getDB(dbName)
    // db.collection(collectionName).createIndex({ 'length': 1 }) //创建索引
    return db.collection(collectionName)
}

module.exports = { getDB, getCollection }