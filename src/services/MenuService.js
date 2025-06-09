//服务层，处理业务数据
module.exports = (userModel) => {
    return {
        getMenus: async queryParams => {
            return userModel.findAll(queryParams)
        },
        addMenuItem: async (name, shape) => {
            return userModel.addMenuItem(name, shape)
        },
        addMenuItems: async docs => {
            return userModel.addMenuItems(docs)
        }
    }
}