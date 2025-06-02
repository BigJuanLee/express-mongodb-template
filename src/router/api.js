const express = require('express')
const router = express.Router()
const { getCollection } = require('../utils/dbHelper')
const { mongoClient } = require('../utils/connect')
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
            sortBy,
            page = 1,
            pageSize = 10
        } = req.query
        const cleanSortBy = (typeof sortBy === 'string' ? sortBy.trim() : '');
        const sortOption = cleanSortBy ? { [cleanSortBy]: 1 } : {};
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
        const data = await bookCollection.find({}, projection).sort(sortOption).skip((page - 1) * pageSize).limit(Number(pageSize)).toArray()
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

        const result = await menuCollection.insertOne({
            name,
            shape
        })
        res.json(result)
    } catch (error) {
        console.log(error);

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
        console.log(error);
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

router.post('/transferAccount', async (req, res) => {
    const client = await mongoClient
    const session = client.startSession()
    try {
        const result = await session.withTransaction(async () => {
            const accounts = await getCollection('t_database', 'accounts')
            await accounts.updateOne(
                { _id: "A" },
                { $inc: { balance: -100 } },
                { session }
            );
            await accounts.updateOne(
                { _id: "B" },
                { $inc: { balance: 100 } },
                { session }
            );
            return { message: "转账成功" };
        })
        res.send({
            success: true,
            message: "事务提交成功",
            data: result // 包含回调返回的数据
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "转账失败",
            error: error.message
        });
        console.log(error);

    } finally {
        session.endSession()
    }

    // try {
    //     session.startTransaction();
    //     const accounts = client.db("bank").collection("accounts");
    //     await accounts.updateOne(
    //         { _id: "A" },
    //         { $inc: { balance: -100 } },
    //         { session }
    //     );
    //     await accounts.updateOne(
    //         { _id: "B" },
    //         { $inc: { balance: 100 } },
    //         { session }
    //     );
    //     await session.commitTransaction(); //提交事务
    // } catch (error) {
    //     await session.abortTransaction(); //回滚事务
    //     throw error; 
    // } finally {
    //     session.endSession();
    // }

})
//过滤的子集，查询最年轻的三个工程师按年龄从小到大排序
router.get('/getYoungestEngineer', async (req, res) => {
    try {
        const personCollection = await getCollection('t_database', 'persons')
        const pipeline = [
            { $match: { "vocation": "ENGINEER" } },
            { $sort: { "dateofbirth": -1 } },
            { $limit: 3 },
            { $unset: ["_id", "address"] }
        ]
        const result = await personCollection.aggregate(pipeline).toArray()//和find返回的是游标对象
        console.log(result);

        res.json(result)
    } catch (error) {
        console.log(error);
        throw error
    }

})

//群组和总计，查询给定客户的所有订单的详细信息，按客户的电子邮件地址分组
router.get('/getOrderSummary', async (req, res) => {
    try {
        const orderCollection = await getCollection('t_database', 'orders')
        const pipeline = [
            {
                $addFields: {
                    parsedDate: { $dateFromString: { dateString: "$orderdate", timezone: "UTC", onError: null } }
                }
            },
            {
                $match: {
                    parsedDate: {
                        $gte: new Date("2020-01-01T00:00:00Z"),
                        $lt: new Date("2021-01-01T00:00:00Z"),
                    }
                }
            },
            {
                $sort: {
                    orderdate: 1
                }
            },
            {
                $group: {
                    _id: "$customer_id",
                    first_purchase_date: { $first: "$orderdate" },
                    total_value: { $sum: "$value" },
                    total_orders: { $sum: 1 },
                    orders: {
                        $push: {
                            orderdate: "$orderdate",
                            value: "$value"
                        }
                    }
                }
            },
            {
                $sort: {
                    first_purchase_date: 1
                }
            },
            {
                $set: { customer_id: "$_id" }
            },
            { $unset: ["_id"] }
        ]
        const result = await orderCollection.aggregate(pipeline).toArray()
        res.json(result)
    } catch (error) {
        throw error
    }
})

//解包数组和分组，查询成本超过 15 美元的产品订单的总值和数量的详细信息
router.get('/getOrderSummary2', async (req, res) => {
    try {
        const orderCollection = await getCollection('t_database', 'order2')
        const pipeline = [
            { $unwind: { path: "$products" } },
            {
                $match: {
                    "products.price": {
                        $gt: 15
                    }
                }
            },
            {
                $group: {
                    _id: "$products.prod_id",
                    product: { $first: "$products.name" },
                    total_value: { $sum: "$products.price" },
                    quantity: { $sum: 1 },

                }
            },
            {
                $set: { product_id: "$_id" }
            },
            { $unset: ["_id"] }
        ]
        const result = await orderCollection.aggregate(pipeline).toArray()
        res.json(result)
    } catch (error) {
        throw error
    }
})

//连表查询单个字段
router.get('/getOrderSummary3', async (req, res) => {
    try {
        const orderCollection = await getCollection('t_database', 'order3')
        // const productionCollection = await getCollection('t_database', 'product')

        const pipeline = [
            {
                $match: {
                    orderdate: {
                        $gte: new Date("2020-01-01T00:00:00Z"),
                        $lt: new Date("2021-01-01T00:00:00Z"),
                    }
                }
            },
            {
                $lookup: {
                    from: 'product', //要连接的集合
                    localField: 'product_id', //输入文档的字段
                    foreignField: 'id', //被连接集合中的字段
                    as: 'product_mapping' //输出的数组字段名
                }
            },
            {
                $set: {
                    product_mapping: { $first: '$product_mapping' }
                }
            },
            {
                $set: {
                    product_name: "$product_mapping.name",
                    product_category: "$product_mapping.category",
                },
            },
            { $unset: ["_id", "product_id", "product_mapping"] }
        ]
        const result = await orderCollection.aggregate(pipeline).toArray()
        res.json(result)
    } catch (error) {
        throw error
    }
})

//连表查询多个字段
router.get('/getOrderSummary4', async (req, res) => {
    try {
        // const orderCollection = await getCollection('t_database', 'order4')
        const productionCollection = await getCollection('t_database', 'product2')

        const embedded_pl = [
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: ["$product_name", "$$prdname"] },
                            { $eq: ["$product_variation", "$$prdvartn"] }
                        ]//匹配条件同时满足order4.product_name == product2.prdname order4.product_variation == product2.prdvartn
                    }
                },

            },
            {
                $match: {
                    orderdate: {
                        $gte: new Date("2020-01-01T00:00:00Z"),
                        $lt: new Date("2021-01-01T00:00:00Z"),
                    },
                }
            },
            {
                $unset: ["_id", "product_name", "product_variation"]
            }
        ]
        const pipeline = [
            {
                $lookup: {
                    from: "order4",//连接order4
                    let: {
                        prdname: "$name",
                        prdvartn: "$variation"
                    },//product2.name 换成prdname, product2.variation换成prdvartn
                    pipeline: embedded_pl,
                    as: "orders"
                }
            },
            {
                $match: {
                    orders: { $ne: [] }
                }
            },
            {
                $unset: ["_id", "description"],
            }
        ]
        const result = await productionCollection.aggregate(pipeline).toArray()
        res.json(result)
    } catch (error) {
        throw error
    }
})
module.exports = router