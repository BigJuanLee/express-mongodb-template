//使用Express创建http服务器
const express = require('express');
const { connect, getClient } = require('./src/utils/connect');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
(async () => {
    const app = express()
    const db = await connect('t_database')

    // 解析 application/x-www-form-urlencoded
    app.use(express.urlencoded({ extended: true }));
    // 解析 application/json
    app.use(express.json());
    //将静态文件放到服务器上
    app.use('/pictures', express.static(path.join(__dirname, 'uploads')));
    //自动添加一些重要的安全头
    app.use(helmet());
    //解决跨域
    app.use(cors())
    //使用路由
    const uploadRouter = require('./src/router/upload')
    app.use('/upload', uploadRouter)

    const MenuModel = require('./src/models/MenuModel')(db)
    const MenuService = require('./src/services/MenuService')(MenuModel)
    const MenuController = require('./src/controllers/MenuController')(MenuService)
    app.use('/menu', require('./src/router/menu')(MenuController))

    app.listen(3000)

    process.on('SIGINT', async () => {
        try {
            //关闭进程时断开连接
            const client = getClient();
            if (client) {
                await client.close();
                console.log("MongoDB connection closed");
            }
            process.exit(0);
        } catch (err) {
            console.error("Error during shutdown:", err);
            process.exit(1);
        }
    });
})();




