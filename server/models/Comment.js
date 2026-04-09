const pool = require('../config/database');

const Comment = {
    create: async (data) => {
        const sql =
            'INSERT INTO comments (user_id, content, target_id, target_type, parent_id) VALUES (?, ?, ?, ?, ?)';
        const [result] = await pool.query(sql, [
            data.user_id,
            data.content,
            data.target_id,
            data.target_type,
            data.parent_id || null
        ]);
        return result.insertId;
    },

    findByTarget: async (targetId, targetType) => {
        const sql = `
            SELECT c.*, u.username, u.avatar
            FROM comments c
                     LEFT JOIN users u ON c.user_id = u.user_id
            WHERE c.target_id = ?
              AND c.target_type = ?
              AND c.parent_id IS NULL
            ORDER BY c.created_at DESC`;
        const [rows] = await pool.query(sql, [targetId, targetType]);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM comments WHERE id = ?', [id]);
        return rows;
    },

    delete: async (id) => {
        await pool.query('DELETE FROM comments WHERE id = ?', [id]);
    }
};

module.exports = Comment;
