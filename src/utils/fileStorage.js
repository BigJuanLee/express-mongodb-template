// config/fileStorage.js
const path = require('path');
const fs = require('fs-extra');

const UPLOAD_DIR = path.join(__dirname, '../uploads'); // 项目根目录下的uploads

// 确保上传目录存在
const ensureUploadDir = async () => {
    try {
        await fs.ensureDir(UPLOAD_DIR);
        console.log(`Upload directory verified: ${UPLOAD_DIR}`);
    } catch (err) {
        console.error('Cannot create upload directory:', err);
        throw err;
    }
};

module.exports = {
    UPLOAD_DIR,
    ensureUploadDir
};