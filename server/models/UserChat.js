const pool = require('../config/database');

const UserChat = {
    /**
     * 查找或创建会话
     */
    findOrCreateConversation: async (userId, peerId) => {
        if (Number(userId) === Number(peerId)) {
            throw new Error('不能与自己发起会话');
        }

        // 查找现有会话
        const [existing] = await pool.query(
            `SELECT DISTINCT session_id
             FROM user_chats
             WHERE (sender_id = ? AND receiver_id = ?)
                OR (sender_id = ? AND receiver_id = ?)
             LIMIT 1`,
            [userId, peerId, peerId, userId]
        );

        if (existing.length > 0) {
            return existing[0].session_id;
        }

        // 创建新会话 ID
        const session_id = `conv_${Date.now()}_${userId}_${peerId}`;
        return session_id;
    },

    /**
     * 列出用户的会话列表
     */
    listConversations: async (userId) => {
        const [rows] = await pool.query(
            `SELECT
                uc.session_id as id,
                MAX(uc.updated_at) as updated_at,
                CASE WHEN uc.sender_id = ? THEN uc.receiver_id ELSE uc.sender_id END AS peer_id,
                u.username AS peer_username,
                u.avatar AS peer_avatar,
                (SELECT content
                 FROM user_chats m
                 WHERE m.session_id = uc.session_id
                 ORDER BY m.message_id DESC
                 LIMIT 1) AS last_message,
                (SELECT COUNT(*)
                 FROM user_chats m
                 WHERE m.session_id = uc.session_id
                   AND m.sender_id != ?
                   AND m.is_read = 0) AS unread_count
             FROM user_chats uc
             JOIN users u ON u.user_id = (CASE WHEN uc.sender_id = ? THEN uc.receiver_id ELSE uc.sender_id END)
             WHERE uc.sender_id = ? OR uc.receiver_id = ?
             GROUP BY uc.session_id, peer_id, peer_username, peer_avatar
             ORDER BY updated_at DESC`,
            [userId, userId, userId, userId, userId]
        );
        return rows;
    },

    /**
     * 获取单个会话信息
     */
    getConversationForUser: async (sessionId, userId) => {
        const [rows] = await pool.query(
            `SELECT
                uc.session_id as id,
                CASE WHEN uc.sender_id = ? THEN uc.receiver_id ELSE uc.sender_id END AS peer_id
             FROM user_chats uc
             WHERE uc.session_id = ?
               AND (uc.sender_id = ? OR uc.receiver_id = ?)
             LIMIT 1`,
            [userId, sessionId, userId, userId]
        );
        return rows[0] || null;
    },

    /**
     * 添加消息
     */
    addMessage: async (sessionId, senderId, content, image_url = null) => {
        // 获取 receiver_id
        const [convRows] = await pool.query(
            `SELECT sender_id, receiver_id FROM user_chats WHERE session_id = ? LIMIT 1`,
            [sessionId]
        );

        let receiverId;
        if (convRows.length > 0) {
            receiverId = convRows[0].sender_id === senderId ? convRows[0].receiver_id : convRows[0].sender_id;
        } else {
            throw new Error('会话不存在');
        }

        const [r] = await pool.query(
            'INSERT INTO user_chats (session_id, sender_id, receiver_id, role, content, image_url, is_read) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [sessionId, senderId, receiverId, 'user', content, image_url, 0]
        );

        await pool.query('UPDATE user_chats SET updated_at = CURRENT_TIMESTAMP WHERE session_id = ?', [sessionId]);
        return r.insertId;
    },

    /**
     * 列出会话消息
     */
    listMessages: async (sessionId, limit = 50, beforeId = null) => {
        let sql = `
            SELECT
                m.message_id as id,
                m.sender_id,
                m.content,
                m.image_url,
                m.is_read,
                m.created_at,
                u.username,
                u.avatar
            FROM user_chats m
            LEFT JOIN users u ON m.sender_id = u.user_id
            WHERE m.session_id = ?`;
        const params = [sessionId];

        if (beforeId) {
            sql += ' AND m.message_id < ?';
            params.push(beforeId);
        }

        sql += ' ORDER BY m.message_id DESC LIMIT ?';
        params.push(limit);

        const [rows] = await pool.query(sql, params);
        return rows.reverse();
    },

    /**
     * 标记会话为已读
     */
    markConversationRead: async (sessionId, userId) => {
        await pool.query(
            `UPDATE user_chats
             SET is_read = 1
             WHERE session_id = ?
               AND sender_id != ?
               AND is_read = 0`,
            [sessionId, userId]
        );
    },

    /**
     * 搜索用户
     */
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
