const pool = require('../config/database');

const ExchangeFlower = {
    create: async (data) => {
        const sql = 'INSERT INTO exchange_flowers (user_id, title, content, exchange_status, tags, cover_image, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(sql, [
            data.user_id,
            data.title || null,
            data.content,
            data.exchange_status || 'pending',
            data.tags || null,
            data.cover_image || null,
            data.image_path || null
        ]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = `
            SELECT e.*, u.username, u.avatar,
                   (SELECT COUNT(*) FROM likes WHERE target_type = 'exchange_flower' AND target_id = e.exchange_id) as like_count,
                   (SELECT COUNT(*) FROM comments WHERE target_type = 'exchange_flower' AND target_id = e.exchange_id) as comment_count
            FROM exchange_flowers e
                     LEFT JOIN users u ON e.user_id = u.user_id
            ORDER BY e.created_at DESC`;
        const [rows] = await pool.query(sql);
        return rows;
    },

    findById: async (id) => {
        const sql = `
            SELECT e.*, u.username, u.avatar,
                   (SELECT COUNT(*) FROM likes WHERE target_type = 'exchange_flower' AND target_id = e.exchange_id) as like_count,
                   (SELECT COUNT(*) FROM comments WHERE target_type = 'exchange_flower' AND target_id = e.exchange_id) as comment_count
            FROM exchange_flowers e
                     LEFT JOIN users u ON e.user_id = u.user_id
            WHERE e.exchange_id = ?`;
        const [rows] = await pool.query(sql, [id]);
        return rows;
    },

    delete: async (id) => {
        const sql = 'DELETE FROM exchange_flowers WHERE exchange_id = ?';
        await pool.query(sql, [id]);
    },

    updateExchangeStatus: async (id, status) => {
        const sql = 'UPDATE exchange_flowers SET exchange_status = ? WHERE exchange_id = ?';
        await pool.query(sql, [status, id]);
    },

    findByUserId: async (userId) => {
        const sql = `
            SELECT e.*, u.username, u.avatar,
                   (SELECT COUNT(*) FROM likes WHERE target_type = 'exchange_flower' AND target_id = e.exchange_id) as like_count,
                   (SELECT COUNT(*) FROM comments WHERE target_type = 'exchange_flower' AND target_id = e.exchange_id) as comment_count
            FROM exchange_flowers e
                     LEFT JOIN users u ON e.user_id = u.user_id
            WHERE e.user_id = ?
            ORDER BY e.created_at DESC`;
        const [rows] = await pool.query(sql, [userId]);
        return rows;
    }
};

module.exports = ExchangeFlower;
