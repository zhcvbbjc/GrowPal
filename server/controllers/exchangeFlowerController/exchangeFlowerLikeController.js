const Like = require('../../models/Like');
const pool = require('../../config/database');

exports.toggleLike = async (req, res) => {
    try {
        const exchangeId = req.params.id;
        const userId = req.user.id;

        const existing = await Like.findByUserAndTarget(userId, exchangeId, 'exchange_flower');

        if (existing.length > 0) {
            // 删除点赞
            await pool.query('DELETE FROM likes WHERE user_id = ? AND target_id = ? AND target_type = ?', 
                [userId, exchangeId, 'exchange_flower']);
            res.status(200).json({ message: '已取消点赞', liked: false });
        } else {
            await Like.create({ user_id: userId, target_id: exchangeId, target_type: 'exchange_flower' });
            res.status(200).json({ message: '点赞成功', liked: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '操作失败', error: err.message });
    }
};

exports.getLikeCount = async (req, res) => {
    try {
        const exchangeId = req.params.id;
        const count = await Like.countByTarget(exchangeId, 'exchange_flower');
        res.status(200).json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '获取失败', error: err.message });
    }
};
