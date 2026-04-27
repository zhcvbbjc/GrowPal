const Comment = require('../../models/Comment');

exports.createComment = async (req, res) => {
    try {
        const exchangeId = req.params.id;
        const { content, parent_id } = req.body;
        const userId = req.user.id;

        if (!content || !String(content).trim()) {
            return res.status(400).json({ message: '请填写评论内容' });
        }

        await Comment.create({
            user_id: userId,
            target_type: 'exchange_flower',
            target_id: exchangeId,
            content,
            parent_id: parent_id || null
        });

        res.status(201).json({ message: '评论成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '评论失败', error: err.message });
    }
};

exports.getComments = async (req, res) => {
    try {
        const exchangeId = req.params.id;
        const results = await Comment.findByTarget('exchange_flower', exchangeId);
        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '获取评论失败', error: err.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.cid;
        const currentUserId = req.user.id;

        const results = await Comment.findById(commentId);
        if (results.length === 0) return res.status(404).json({ message: '评论不存在' });

        const comment = results[0];
        if (comment.user_id !== currentUserId) {
            return res.status(403).json({ message: '权限不足，只能删除自己的评论' });
        }

        await Comment.delete(commentId);
        res.status(200).json({ message: '评论已删除' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '删除失败', error: err.message });
    }
};
