const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取用户信息
router.get('/:id', async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT user_id, username, bio, avatar, role, created_at FROM users WHERE user_id = ? AND is_active = 1',
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: '用户不存在' });
        }

        res.json({ success: true, user: users[0] });
    } catch (error) {
        console.error('[用户] 获取用户信息失败:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 获取用户的帖子
router.get('/:id/posts', async (req, res) => {
    try {
        const [posts] = await db.query(
            `SELECT p.post_id, p.user_id, p.title, p.content, p.cover_image, p.tags, p.created_at,
                    u.username, u.avatar
             FROM posts p
             LEFT JOIN users u ON p.user_id = u.user_id
             WHERE p.user_id = ? AND p.status = 'published'
             ORDER BY p.created_at DESC`,
            [req.params.id]
        );

        res.json(posts);
    } catch (error) {
        console.error('[用户] 获取用户帖子失败:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// 获取用户的问题
router.get('/:id/questions', async (req, res) => {
    try {
        const [questions] = await db.query(
            `SELECT q.question_id, q.user_id, q.title, q.content, q.tags, q.created_at,
                    u.username, u.avatar
             FROM questions q
             LEFT JOIN users u ON q.user_id = u.user_id
             WHERE q.user_id = ?
             ORDER BY q.created_at DESC`,
            [req.params.id]
        );

        res.json(questions);
    } catch (error) {
        console.error('[用户] 获取用户问题失败:', error.message);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
