const express = require('express')
const router = express.Router()
const path = require('path');
//解析格式为form-data数据的第三方库
const multer = require('multer')
//配置multer储存引擎 目录和文件名(加上时间戳)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/'))
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname)
        cb(null, uniqueSuffix + ext)
    }
})
const UploadController = require('../controllers/UploadController')
const uploadController = new UploadController('uploads')
const upload = multer({ storage })


router.get('/getFilesList', uploadController.listFiles.bind(uploadController));
router.get('/getUploadFile', uploadController.downloadFile.bind(uploadController));
router.post('/singleFile', upload.single('file'), uploadController.handleSingleUpload.bind(uploadController));

module.exports = router