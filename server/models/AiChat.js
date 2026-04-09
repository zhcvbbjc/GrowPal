const pool = require('../config/database');

const AiChat = {
    createSession: async (userId, title = '新对话') => {
        const [r] = await pool.query(
            'INSERT INTO ai_sessions (user_id, title) VALUES (?, ?)',
            [userId, title]
        );
        return r.insertId;
    },

    listSessions: async (userId) => {
        const [rows] = await pool.query(
            `SELECT id, title, created_at, updated_at
             FROM ai_sessions
             WHERE user_id = ?
             ORDER BY updated_at DESC`,
            [userId]
        );
        return rows;
    },

    getSession: async (sessionId, userId) => {
        const [rows] = await pool.query(
            'SELECT * FROM ai_sessions WHERE id = ? AND user_id = ?',
            [sessionId, userId]
        );
        return rows[0] || null;
    },

    updateSessionTime: async (sessionId) => {
        await pool.query('UPDATE ai_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [sessionId]);
    },

    updateSessionTitle: async (sessionId, userId, title) => {
        await pool.query('UPDATE ai_sessions SET title = ? WHERE id = ? AND user_id = ?', [
            title,
            sessionId,
            userId
        ]);
    },

    deleteSession: async (sessionId, userId) => {
        const [r] = await pool.query('DELETE FROM ai_sessions WHERE id = ? AND user_id = ?', [
            sessionId,
            userId
        ]);
        return r.affectedRows > 0;
    },

    addMessage: async (sessionId, role, content) => {
        const [r] = await pool.query(
            'INSERT INTO ai_messages (session_id, role, content) VALUES (?, ?, ?)',
            [sessionId, role, content]
        );
        return r.insertId;
    },

    /** 按时间正序返回最近若干条（用于展示与对话上下文） */
    listMessages: async (sessionId, limit = 100) => {
        const [rows] = await pool.query(
            `SELECT id, role, content, created_at
             FROM (
                      SELECT id, role, content, created_at
                      FROM ai_messages
                      WHERE session_id = ?
                      ORDER BY id DESC
                      LIMIT ?
                  ) t
             ORDER BY id ASC`,
            [sessionId, limit]
        );
        return rows;
    },

    /** 全量正序（可选大窗口，用于简单拉取历史） */
    listAllMessagesChronological: async (sessionId, maxRows = 500) => {
        const [rows] = await pool.query(
            `SELECT id, role, content, created_at
             FROM ai_messages
             WHERE session_id = ?
             ORDER BY id ASC
             LIMIT ?`,
            [sessionId, maxRows]
        );
        return rows;
    }
};

module.exports = AiChat;
