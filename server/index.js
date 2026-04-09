const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadsDir));

app.get('/', (req, res) => {
    res.json({
        name: 'GrowPal API',
        ok: true,
        routes: ['/api/auth', '/api/posts', '/api/questions', '/api/aichat', '/api/userchat']
    });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/questions', require('./routes/question'));
app.use('/api/aichat', require('./routes/aichat'));
app.use('/api/userchat', require('./routes/userchat'));

app.use((req, res) => {
    res.status(404).json({ message: '接口不存在' });
});

// 统一错误处理（含 Multer）
app.use((err, req, res, next) => {
    if (err && err.message === '只允许上传图片文件') {
        return res.status(400).json({ message: err.message });
    }
    if (err && err.name === 'MulterError') {
        return res.status(400).json({ message: err.message || '文件上传失败' });
    }
    console.error(err);
    res.status(500).json({ message: '服务器内部错误' });
});

app.listen(PORT, () => {
    console.log(`✅ GrowPal 后端: http://localhost:${PORT}`);
});
