const pool = require('../config/database');

const Question = {
    create: async (data) => {
        const sql = 'INSERT INTO questions (user_id, title, content, tags, image_path) VALUES (?, ?, ?, ?, ?)';
        const [result] = await pool.query(sql, [
            data.user_id,
            data.title,
            data.content,
            data.tags || null,
            data.image_path || null
        ]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = `
            SELECT q.*, u.username, u.avatar,
                   (SELECT COUNT(*) FROM likes WHERE target_type = 'question' AND target_id = q.question_id) as like_count,
                   (SELECT COUNT(*) FROM comments WHERE target_type = 'question' AND target_id = q.question_id) as comment_count
            FROM questions q
                     LEFT JOIN users u ON q.user_id = u.user_id
            ORDER BY q.created_at DESC`;
        const [rows] = await pool.query(sql);
        return rows;
    },

    findById: async (id) => {
        const sql = `
            SELECT q.*, u.username, u.avatar,
                   (SELECT COUNT(*) FROM likes WHERE target_type = 'question' AND target_id = q.question_id) as like_count,
                   (SELECT COUNT(*) FROM comments WHERE target_type = 'question' AND target_id = q.question_id) as comment_count
            FROM questions q
                     LEFT JOIN users u ON q.user_id = u.user_id
            WHERE q.question_id = ?`;
        const [rows] = await pool.query(sql, [id]);
        return rows;
    },

    delete: async (id) => {
        const sql = 'DELETE FROM questions WHERE question_id = ?';
        await pool.query(sql, [id]);
    },

    updateAiAnswer: async (id, answer) => {
        const sql = 'UPDATE questions SET ai_answer = ? WHERE question_id = ?';
        await pool.query(sql, [answer, id]);
    },

    findByUserId: async (userId) => {
        const sql = `
            SELECT q.*, u.username, u.avatar,
                   (SELECT COUNT(*) FROM likes WHERE target_type = 'question' AND target_id = q.question_id) as like_count,
                   (SELECT COUNT(*) FROM comments WHERE target_type = 'question' AND target_id = q.question_id) as comment_count
            FROM questions q
                     LEFT JOIN users u ON q.user_id = u.user_id
            WHERE q.user_id = ?
            ORDER BY q.created_at DESC`;
        const [rows] = await pool.query(sql, [userId]);
        return rows;
    }
};

module.exports = Question;
