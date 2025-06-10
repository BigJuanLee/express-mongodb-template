const express = require('express')
const router = express.Router()

module.exports = (menuController) => {
    router.get('/logs', menuController.getMenus);
    router.get('/insertMenu', menuController.addMenuItem);
    router.get('/insertManyMenu', menuController.addMenuItems);
    return router
}