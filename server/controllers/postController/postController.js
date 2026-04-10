const Post = require('../../models/Post');
const fs = require('fs');
const path = require('path');

const serverRoot = path.join(__dirname, '../..');

function uploadsPhysical(imagePath) {
    if (!imagePath) return null;
    const rel = imagePath.replace(/^\//, '');
    return path.join(serverRoot, rel);
}

exports.createPost = async (req, res) => {
    try {
        const { content, title, tags } = req.body;
        if (!content || !String(content).trim()) {
            return res.status(400).json({ message: '请填写内容' });
        }
        const user_id = req.user.id;
        const image_path = req.file ? `/uploads/${req.file.filename}` : null;

        const postId = await Post.create({ user_id, content, title, tags, image_path });
        res.status(201).json({ message: '发布成功', postId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '发布失败', error: err.message });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const results = await Post.findAll();
        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '获取失败', error: err.message });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const postId = req.params.id;
        const results = await Post.findById(postId);
        if (results.length === 0) {
            return res.status(404).json({ message: '文章不存在' });
        }
        res.status(200).json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '服务器错误', error: err.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const currentUserId = req.user.id;

        const results = await Post.findById(postId);
        if (results.length === 0) return res.status(404).json({ message: '文章不存在' });

        const post = results[0];
        if (post.user_id !== currentUserId) {
            return res.status(403).json({ message: '权限不足，只能删除自己的文章' });
        }

        await Post.delete(postId);

        const fp = uploadsPhysical(post.image_path);
        if (fp) {
            fs.unlink(fp, (e) => {
                if (e) console.error('图片文件删除失败:', e);
            });
        }

        res.status(200).json({ message: '文章已删除' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '删除失败', error: err.message });
    }
};
