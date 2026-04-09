const pool = require('../config/database');

function normalizePair(userIdA, userIdB) {
    const a = Number(userIdA);
    const b = Number(userIdB);
    return a < b ? [a, b] : [b, a];
}

const UserChat = {
    findOrCreateConversation: async (userId, peerId) => {
        if (Number(userId) === Number(peerId)) {
            throw new Error('不能与自己发起会话');
        }
        const [low, high] = normalizePair(userId, peerId);
        const [existing] = await pool.query(
            'SELECT id FROM user_conversations WHERE user_low = ? AND user_high = ?',
            [low, high]
        );
        if (existing.length) return existing[0].id;

        const [r] = await pool.query(
            'INSERT INTO user_conversations (user_low, user_high) VALUES (?, ?)',
            [low, high]
        );
        return r.insertId;
    },

    listConversations: async (userId) => {
        const [rows] = await pool.query(
            `SELECT c.id,
                    c.updated_at,
                    CASE WHEN c.user_low = ? THEN c.user_high ELSE c.user_low END AS peer_id,
                    u.username AS peer_username,
                    u.avatar AS peer_avatar,
                    (SELECT content
                     FROM user_messages m
                     WHERE m.conversation_id = c.id
                     ORDER BY m.id DESC
                     LIMIT 1) AS last_message,
                    (SELECT COUNT(*)
                     FROM user_messages m
                     WHERE m.conversation_id = c.id
                       AND m.sender_id != ?
                       AND m.is_read = 0) AS unread_count
             FROM user_conversations c
                      JOIN users u ON u.user_id = (CASE WHEN c.user_low = ? THEN c.user_high ELSE c.user_low END)
             WHERE c.user_low = ? OR c.user_high = ?
             ORDER BY c.updated_at DESC`,
            [userId, userId, userId, userId, userId]
        );
        return rows;
    },

    getConversationForUser: async (conversationId, userId) => {
        const [rows] = await pool.query(
            `SELECT c.*,
                    CASE WHEN c.user_low = ? THEN c.user_high ELSE c.user_low END AS peer_id
             FROM user_conversations c
             WHERE c.id = ?
               AND (c.user_low = ? OR c.user_high = ?)`,
            [userId, conversationId, userId, userId]
        );
        return rows[0] || null;
    },

    addMessage: async (conversationId, senderId, content) => {
        const [r] = await pool.query(
            'INSERT INTO user_messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
            [conversationId, senderId, content]
        );
        await pool.query('UPDATE user_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
            conversationId
        ]);
        return r.insertId;
    },

    listMessages: async (conversationId, limit = 50, beforeId = null) => {
        let sql = `
            SELECT m.id, m.sender_id, m.content, m.is_read, m.created_at, u.username, u.avatar
            FROM user_messages m
                     LEFT JOIN users u ON m.sender_id = u.user_id
            WHERE m.conversation_id = ?`;
        const params = [conversationId];
        if (beforeId) {
            sql += ' AND m.id < ?';
            params.push(beforeId);
        }
        sql += ' ORDER BY m.id DESC LIMIT ?';
        params.push(limit);
        const [rows] = await pool.query(sql, params);
        return rows.reverse();
    },

    markConversationRead: async (conversationId, readerId) => {
        await pool.query(
            `UPDATE user_messages
             SET is_read = 1
             WHERE conversation_id = ?
               AND sender_id != ?
               AND is_read = 0`,
            [conversationId, readerId]
        );
    },

    searchUsers: async (query, currentUserId, limit = 20) => {
        const q = `%${query}%`;
        const [rows] = await pool.query(
            `SELECT user_id, username, avatar, phone
             FROM users
             WHERE user_id != ?
               AND (username LIKE ? OR phone LIKE ?)
             ORDER BY username ASC
             LIMIT ?`,
            [currentUserId, q, q, limit]
        );
        return rows;
    }
};

module.exports = UserChat;
