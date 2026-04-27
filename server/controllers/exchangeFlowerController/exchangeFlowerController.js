const ExchangeFlower = require('../../models/ExchangeFlower');
const fs = require('fs');
const path = require('path');
const { createUploadMiddleware } = require('../../utils/upload');

const serverRoot = path.join(__dirname, '../..');

function uploadsPhysical(imagePath) {
    if (!imagePath) return null;
    const rel = imagePath.replace(/^\//, '');
    return path.join(serverRoot, rel);
}

exports.createExchangeFlower = async (req, res) => {
    try {
        const { content, title, tags, exchange_status } = req.body;
        if (!content || !String(content).trim()) {
            return res.status(400).json({ message: '请填写内容' });
        }
        const user_id = req.user.id;
        
        // 处理多张图片
        let image_paths = [];
        if (req.files && req.files.length > 0) {
            image_paths = req.files.map(file => `/uploads/exchange_flower_images/${file.filename}`);
        }
        
        const image_path = image_paths.length > 0 ? image_paths.join(',') : null;
        const cover_image = image_paths.length > 0 ? image_paths[0] : null;

        const exchangeId = await ExchangeFlower.create({ 
            user_id, 
            content, 
            title, 
            tags, 
            exchange_status: exchange_status || 'pending',
            image_path,
            cover_image
        });

        res.status(201).json({ message: '发布成功', exchangeId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '发布失败', error: err.message });
    }
};

exports.getAllExchangeFlowers = async (req, res) => {
    try {
        const results = await ExchangeFlower.findAll();
        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '获取失败', error: err.message });
    }
};

exports.getExchangeFlowerById = async (req, res) => {
    try {
        const exchangeId = req.params.id;
        const results = await ExchangeFlower.findById(exchangeId);
        if (results.length === 0) {
            return res.status(404).json({ message: '换花帖子不存在' });
        }
        res.status(200).json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '服务器错误', error: err.message });
    }
};

exports.deleteExchangeFlower = async (req, res) => {
    try {
        const exchangeId = req.params.id;
        const currentUserId = req.user.id;

        const results = await ExchangeFlower.findById(exchangeId);
        if (results.length === 0) return res.status(404).json({ message: '换花帖子不存在' });

        const post = results[0];
        if (post.user_id !== currentUserId) {
            return res.status(403).json({ message: '权限不足，只能删除自己的帖子' });
        }

        await ExchangeFlower.delete(exchangeId);

        const fp = uploadsPhysical(post.image_path);
        if (fp) {
            fs.unlink(fp, (e) => {
                if (e) console.error('图片文件删除失败:', e);
            });
        }

        res.status(200).json({ message: '换花帖子已删除' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '删除失败', error: err.message });
    }
};

exports.getUserExchangeFlowers = async (req, res) => {
    try {
        const userId = req.user.id;
        const results = await ExchangeFlower.findByUserId(userId);
        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '获取失败', error: err.message });
    }
};

exports.updateExchangeStatus = async (req, res) => {
    try {
        const exchangeId = req.params.id;
        const { exchange_status } = req.body;
        const currentUserId = req.user.id;

        const results = await ExchangeFlower.findById(exchangeId);
        if (results.length === 0) return res.status(404).json({ message: '换花帖子不存在' });

        const post = results[0];
        if (post.user_id !== currentUserId) {
            return res.status(403).json({ message: '权限不足，只能修改自己帖子的状态' });
        }

        await ExchangeFlower.updateExchangeStatus(exchangeId, exchange_status);
        res.status(200).json({ message: '状态更新成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '更新失败', error: err.message });
    }
};
