const fs = require('fs-extra');
const path = require('path');

class UploadController {
    constructor() {
        this.uploadDir = path.join(__dirname, '../uploads');
    }

    async listFiles(req, res) {
        try {
            const files = await fs.readdir(this.uploadDir);
            res.json({ files });
        } catch (err) {
            res.status(500).json({ error: '读取文件列表失败' });
        }
    }

    async downloadFile(req, res) {
        const { filename } = req.query;
        if (!filename) {
            return res.status(400).json({ error: '缺少文件名' });
        }

        const filePath = path.join(this.uploadDir, filename);

        try {
            await fs.access(filePath, fs.constants.F_OK);

            const ext = path.extname(filename).toLowerCase();
            const contentType = this.getContentType(ext);
            res.setHeader('Content-Type', contentType);

            const readStream = fs.createReadStream(filePath);
            readStream.pipe(res);

            readStream.on('error', (err) => {
                res.status(500).json({ error: `文件传输失败: ${err.message}` });
            });
        } catch (err) {
            res.status(404).json({ error: `文件不存在: ${filename}` });
        }
    }

    handleSingleUpload(req, res) {
        if (!req.file) {
            return res.status(400).json({ error: '未上传文件' });
        }

        // 这里可以添加业务逻辑，例如：
        // - 文件信息入库
        // - 触发图片处理
        // - 返回更结构化的响应

        res.json({
            success: true,
            filename: req.file.filename,
            originalname: req.file.originalname
        });
    }

    getContentType(ext) {
        const types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml'
        };
        return types[ext] || 'application/octet-stream';
    }
}

module.exports = UploadController;