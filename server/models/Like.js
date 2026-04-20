const pool = require('../config/database');

const Like = {
    findByUserAndTarget: async (userId, targetId, targetType) => {
        const sql = 'SELECT * FROM likes WHERE user_id = ? AND target_id = ? AND target_type = ?';
        const [rows] = await pool.query(sql, [userId, targetId, targetType]);
        return rows;
    },

    create: async (data) => {
        const sql = 'INSERT INTO likes (user_id, target_id, target_type) VALUES (?, ?, ?)';
        const [result] = await pool.query(sql, [data.user_id, data.target_id, data.target_type]);
        return result.insertId;
    },

    delete: async (likeId) => {
        await pool.query('DELETE FROM likes WHERE like_id = ?', [likeId]);
    },

    countByTarget: async (targetId, targetType) => {
        const sql = 'SELECT COUNT(*) AS count FROM likes WHERE target_id = ? AND target_type = ?';
        const [rows] = await pool.query(sql, [targetId, targetType]);
        return rows[0]?.count ?? 0;
    }
};

module.exports = Like;
