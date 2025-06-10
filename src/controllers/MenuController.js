//控制层，接收参数传给服务层
module.exports = (menuService) => {
    return {
        getMenus: async (req, res) => {
            try {
                const { searchKey, sortBy, page, pageSize } = req.query
                const menu = await menuService.getMenus({ searchKey, sortBy, page, pageSize })
                res.json(menu)
            } catch (err) {
                res.status(500).json({ error: err.message })
            }
        },
        addMenuItem: async (req, res) => {
            try {
                const { name, shape } = req.body
                const menu = await menuService.addMenuItem(name, shape)
                res.json(menu)
            } catch (err) {
                res.status(500).json({ error: err.message })
            }
        },

        addMenuItems: async (req, res) => {
            try {
                const { docs } = req.body
                const menu = await menuService.addMenuItems(docs)
                res.json(menu)
            } catch (err) {
                res.status(500).json({ error: err.message })
            }
        }
    }
}