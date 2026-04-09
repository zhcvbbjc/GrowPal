const Like = require('../../models/Like');

exports.toggleLike = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const targetType = 'post';

        const results = await Like.findByUserAndTarget(userId, postId, targetType);

        if (results.length > 0) {
            await Like.delete(results[0].id);
            res.json({ message: '已取消点赞', liked: false });
        } else {
            await Like.create({ user_id: userId, target_id: postId, target_type: targetType });
            res.json({ message: '点赞成功', liked: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '操作失败', error: err.message });
    }
};

exports.getLikeCount = async (req, res) => {
    try {
        const postId = req.params.id;
        const count = await Like.countByTarget(postId, 'post');
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '查询失败', error: err.message });
    }
};
