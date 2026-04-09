const pool = require('../config/database');

const Question = {
    create: async (data) => {
        const sql = 'INSERT INTO questions (user_id, title, content, image_path) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(sql, [
            data.user_id,
            data.title,
            data.content,
            data.image_path || null
        ]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = `
            SELECT q.*, u.username, u.avatar
            FROM questions q
                     LEFT JOIN users u ON q.user_id = u.user_id
            ORDER BY q.created_at DESC`;
        const [rows] = await pool.query(sql);
        return rows;
    },

    findById: async (id) => {
        const sql = `
            SELECT q.*, u.username, u.avatar
            FROM questions q
                     LEFT JOIN users u ON q.user_id = u.user_id
            WHERE q.id = ?`;
        const [rows] = await pool.query(sql, [id]);
        return rows;
    },

    delete: async (id) => {
        const sql = 'DELETE FROM questions WHERE id = ?';
        await pool.query(sql, [id]);
    }
};

module.exports = Question;
