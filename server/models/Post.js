const pool = require('../config/database');

const Post = {
    create: async (data) => {
        const sql = 'INSERT INTO posts (user_id, title, content, tags, image_path) VALUES (?, ?, ?, ?, ?)';
        const [result] = await pool.query(sql, [
            data.user_id, 
            data.title || null, 
            data.content, 
            data.tags || null, 
            data.image_path || null
        ]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = `
            SELECT p.*, u.username, u.avatar
            FROM posts p
                     LEFT JOIN users u ON p.user_id = u.user_id
            ORDER BY p.created_at DESC`;
        const [rows] = await pool.query(sql);
        return rows;
    },

    findById: async (id) => {
        const sql = `
            SELECT p.*, u.username, u.avatar
            FROM posts p
                     LEFT JOIN users u ON p.user_id = u.user_id
            WHERE p.post_id = ?`;
        const [rows] = await pool.query(sql, [id]);
        return rows;
    },

    delete: async (id) => {
        const sql = 'DELETE FROM posts WHERE post_id = ?';
        await pool.query(sql, [id]);
    }
};

module.exports = Post;
