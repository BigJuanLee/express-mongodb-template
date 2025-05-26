const express = require('express')
const router = express.Router()
const { getCollection } = require('../utils/dbHelper')
const { ObjectId } = require('mongodb')

router.get('/logs', async (req, res) => {
    try {
        const bookCollection = await getCollection('t_database', 'menu')
        /*
            find(query,projection)
            query:
            精确值 { age: 25 }
            比较操作符 { age: { $gt: 18 } }
            $ne不等于 $gt大于 $gte大于等于 $lt小于 $lte小于等于
            逻辑操作符 {
                $or: [
                    { status: "pending" },
                    { status: "expired" }
                ]
            }
            $or满足任一条件 $not不满足指定条件 $nor不满足所有条件
            数组操作符 { roles: { $in: ["admin", "editor"] } }
            $in匹配数组中任意一个值 $nin不匹配数组中的任何值 $all匹配包含所有指定值的数组 $elemMatch匹配数组中满足条件的元素
            嵌套文档查询
            {
                items: {
                    $elemMatch: { productId: 123, quantity: { $gt: 2 } }
                }
            }
            projection:
            { name: 1, email: 1 }控制字段返回 1显示 0隐藏不能混用除了_id
        */
        // const query = {
        //     length: { $lt: 1000 }
        // }
        // const projection = { author: 0 }
        const projection = {}

        // const data = await bookCollection.find(query, projection).toArray()
        const {
            // searchKey = {},
            sortBy = "",
            page = 1,
            pageSize = 10
        } = req.query

        /*
            find方法返回cursor对象不能直接转换成json返回
            toArray()、forEach 或 next() 提取文档数据
            处理大数据用forEach或分页limit
            const data = await collect.find()
            const result = []
            await data.forEach(doc=>{
                result.push(doc)    
            })
            res.json(result)
        */
        const data = await bookCollection.find({}, projection).sort({ [sortBy]: 1 }).skip((page - 1) * pageSize).limit(Number(pageSize)).toArray()
        /*
            estimatedDocumentCount 统计集合文档数，不支持查询条件
            countDocuments 精确统计 匹配查询条件 的文档数量
        */
        const total = await bookCollection.estimatedDocumentCount();

        // const data = await bookCollection.distinct("name");
        /*
            bookCollection.distinct("author",query);
            返回文档某个字段所有唯一值
        */

        // const data = await bookCollection.createIndex({ length: 1 });

        res.json({
            total,
            page,
            pageSize,
            isLastPage: (total < page * pageSize),
            data
        })
    } catch (error) {
        console.log(error, 57);

        res.status(500).json({ error })
    }
})

router.post('/insertMenu', async (req, res) => {
    try {
        const menuCollection = await getCollection('t_database', 'menu')
        const { name, shape, } = req.body
        const result = await menuCollection.insertOne({ name, shape })
        res.json(result)
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.post('/insertManyMenu', async (req, res) => {
    try {
        const menuCollection = await getCollection('t_database', 'menu')
        const { docs } = req.body
        const result = await menuCollection.insertMany(docs)
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: error.errorResponse.message })
    }
})

router.post('/updateTruck', async (req, res) => {
    try {
        /*
            updateOne修改部分字段
            replaceOne整个文档除id都替换
            updateMany批量更新
            // 将字符串 id 转换为 ObjectId
            const objectIds = ids.map(id => new ObjectId(id));
            const result = await collection.updateMany(
                { _id: { $in: objectIds } }, // 查询条件
                { $set: updateData }          // 更新操作
            );

            $set ：将字段值替换为指定值

            $inc ：递增或递减字段值

            $rename ：重命名字段

            $unset ：删除字段

            $mul ：将字段值乘以指定数字
            query 查询条件 update更新操作必循包含更新符 options可选配置
            
        */
        const truckCollection = await getCollection('t_database', 'foodTrucks')
        const query = { name: 'Deli Llama' }
        const update = { $set: { name: 'Deli Llama', address: '3 Nassau St' } }
        const option = { upsert: true }//没有则插入，有则更新
        const result = await truckCollection.updateOne(query, update, option)
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: error.errorResponse.message })
    }
})

router.post('/deleteTruck', async (req, res) => {
    try {
        const truckCollection = await getCollection('t_database', 'foodTrucks')
        const { ids } = req.body
        const objectIds = ids.map(id => ObjectId.createFromHexString(id))
        const query = { _id: { $in: objectIds } }
        const update = { $set: { isShow: 0 } }
        const result = await truckCollection.updateMany(query, update)
        // const result = await truckCollection.deteleMany(query)
        res.json(result)
    } catch (error) {
        console.log(error);

        res.status(500).json({ message: error.errorResponse.message })
    }
})

module.exports = router