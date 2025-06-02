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


// async function getNextSequence(collectionName = 'books') {
//     const counters = await getCollection("t_database", "counters");
//     // 原子操作：查找并递增 ID
//     const result = await counters.findOneAndUpdate(
//         { _id: collectionName },
//         { $inc: { seq: 1 } },  // 递增 seq 字段
//         { returnDocument: "after", upsert: true } // 不存在则创建
//     );
//     return result.seq; // 返回递增后的 ID
// }

module.exports = { getDB, getCollection, }