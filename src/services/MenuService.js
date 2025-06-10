//服务层，处理业务数据
module.exports = (menuModel) => {
    return {
        getMenus: async queryParams => {
            return menuModel.findAll(queryParams)
        },
        addMenuItem: async (name, shape) => {
            return menuModel.addMenuItem(name, shape)
        },
        addMenuItems: async docs => {
            return menuModel.addMenuItems(docs)
        }
    }
}