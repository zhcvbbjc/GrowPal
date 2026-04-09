const pool = require('../config/database');

const User = {
    findByUsername: async (username) => {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    },

    findByPhone: async (phone) => {
        const [rows] = await pool.query('SELECT * FROM users WHERE phone = ?', [phone]);
        return rows[0];
    },

    create: async (userData) => {
        const { username, password_hash, phone } = userData;
        const [result] = await pool.query(
            'INSERT INTO users (username, password_hash, phone) VALUES (?, ?, ?)',
            [username, password_hash, phone]
        );
        return result.insertId;
    }
};

module.exports = User;
