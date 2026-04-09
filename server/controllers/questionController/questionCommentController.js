const Comment = require('../../models/Comment');

exports.createComment = async (req, res) => {
    try {
        const { content, parent_id } = req.body;
        if (!content || !String(content).trim()) {
            return res.status(400).json({ message: '请填写评论内容' });
        }
        const user_id = req.user.id;
        const target_id = req.params.id;
        const target_type = 'question';

        const commentId = await Comment.create({
            user_id,
            content,
            target_id,
            target_type,
            parent_id
        });
        res.status(201).json({ message: '评论成功', commentId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '评论失败', error: err.message });
    }
};

exports.getComments = async (req, res) => {
    try {
        const qId = req.params.id;
        const results = await Comment.findByTarget(qId, 'question');
        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '获取评论失败', error: err.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const currentUserId = req.user.id;

        const rows = await Comment.findById(commentId);
        if (rows.length === 0) return res.status(404).json({ message: '评论不存在' });

        if (rows[0].user_id !== currentUserId) {
            return res.status(403).json({ message: '权限不足' });
        }

        await Comment.delete(commentId);
        res.status(200).json({ message: '评论已删除' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '删除失败', error: err.message });
    }
};
