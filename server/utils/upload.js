const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');

// 确保 uploads 目录存在
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, uuidv4() + ext);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('只允许上传图片文件'), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
});

// AI 聊天图片专用上传中间件
const aiChatImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const aiChatImageDir = path.join(__dirname, '../uploads/ai_chat_images');
        // 确保目录存在
        if (!fs.existsSync(aiChatImageDir)) {
            fs.mkdirSync(aiChatImageDir, { recursive: true });
        }
        cb(null, aiChatImageDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, uuidv4() + ext);
    }
});

const aiChatImageUpload = multer({
    storage: aiChatImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
});

module.exports = upload;
module.exports.aiChatImageUpload = aiChatImageUpload;
