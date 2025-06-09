//使用Express创建http服务器
const express = require('express');
const { mongoClient } = require('./src/utils/connect');
const path = require('path');
//自动添加一些重要的安全头
const helmet = require('helmet');

(async () => {


    const app = express()
    const client = await mongoClient
    const db = client.db()


    const MenuModel = require('./src/models/MenuModel')(db)
    const MenuService = require('./src/services/MenuService')(MenuModel)
    const MenuController = require('./src/controllers/MenuController')(MenuService)

    const uploadRouter = require(path.join(__dirname, 'src/router/upload'))
    // 解析 application/x-www-form-urlencoded
    app.use(express.urlencoded({ extended: true }));
    // 解析 application/json
    app.use(express.json());

    //将静态文件放到服务器上
    app.use('/pictures', express.static(path.join(__dirname, 'uploads')));
    app.use(helmet());

    //使用路由
    app.use('/upload', uploadRouter)
    app.use('/menu', require('./src/router/menu')(MenuController))

    app.listen(3000)




    //连接mongodb
    // const { mongoClient } = require('./src/utils/connect')
    // mongoClient.then(() => {
    //     app.listen(3000, () => {
    //         console.log('running in 3000');

    //     })
    // }).catch(err => {
    //     console.error('failed to connect to mongodb', err)
    //     process.exit(1)
    // })

    process.on('SIGINT', async () => {
        //关闭进程时断开连接
        const client = await mongoClient;
        await client.close();
        console.log("MongoDB connection closed");
        process.exit(0);
    });
})();




