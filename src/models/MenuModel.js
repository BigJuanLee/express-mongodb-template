//模型层，直接操作数据库
module.exports = (db) => {
    const collection = db.collection('menu')
    return {
        findAll: async (queryParams) => {
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
            } = queryParams
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
            const data = await collection.find({}, projection).sort(sortOption).skip((page - 1) * pageSize).limit(Number(pageSize)).toArray()
            /*
                estimatedDocumentCount 统计集合文档数，不支持查询条件
                countDocuments 精确统计 匹配查询条件 的文档数量
            */
            const total = await collection.estimatedDocumentCount();

            // const data = await bookCollection.distinct("name");
            /*
                bookCollection.distinct("author",query);
                返回文档某个字段所有唯一值
            */

            // const data = await bookCollection.createIndex({ length: 1 });

            // res.json({
            //     total,
            //     page,
            //     pageSize,
            //     isLastPage: (total < page * pageSize),
            //     data
            // })
            return {
                total,
                page,
                pageSize,
                isLastPage: (total < page * pageSize),
                data
            }
        },

        addOne: async (name, shape) => {
            return collection.insertOne({
                name,
                shape
            })
        },
        addMany: async (docs) => {
            await collection.insertMany(docs)
        }
    }
}