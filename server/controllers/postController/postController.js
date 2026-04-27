const Post = require('../../models/Post');
const { summarizeArticle } = require('../../services/llmService');
const fs = require('fs');
const path = require('path');
const { createUploadMiddleware } = require('../../utils/upload');

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
        
        // 处理多张图片
        let image_paths = [];
        if (req.files && req.files.length > 0) {
            image_paths = req.files.map(file => `/uploads/post_images/${file.filename}`);
        }
        
        const image_path = image_paths.length > 0 ? image_paths.join(',') : null;
        const cover_image = image_paths.length > 0 ? image_paths[0] : null;

        const postId = await Post.create({ user_id, content, title, tags, image_path, cover_image });

        // 异步生成 AI 总结，不阻塞响应
        (async () => {
            try {
                console.log(`[AI 总结] 开始为文章 ${postId} 生成总结...`);
                const summary = await summarizeArticle(title, content);
                if (summary) {
                    await Post.updateAiSummary(postId, summary);
                    console.log(`[AI 总结] 文章 ${postId} 总结生成成功: "${summary.slice(0, 50)}..."`);
                } else {
                    console.log(`[AI 总结] 文章 ${postId} 总结生成为空，跳过更新`);
                }
            } catch (err) {
                console.error(`[AI 总结] 文章 ${postId} 总结生成失败:`, err.message);
            }
        })();

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

exports.getUserPosts = async (req, res) => {
    try {
        const userId = req.user.id;
        const results = await Post.findByUserId(userId);
        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '获取失败', error: err.message });
    }
};
