const pool = require('../config/database');

const AiChat = {
    /**
     * 创建会话
     * @param {number} userId - 用户ID
     * @param {string} title - 会话标题
     * @returns {Promise<number>} sessionId
     */
    createSession: async (userId, title = '新对话') => {
        const [r] = await pool.query(
            'INSERT INTO ai_sessions (user_id, title) VALUES (?, ?)',
            [userId, title]
        );
        return r.insertId;
    },

    /**
     * 列出用户的所有会话
     */
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

    /**
     * 获取单个会话
     */
    getSession: async (sessionId, userId) => {
        const [rows] = await pool.query(
            'SELECT * FROM ai_sessions WHERE id = ? AND user_id = ?',
            [sessionId, userId]
        );
        return rows[0] || null;
    },

    /**
     * 更新会话时间戳
     */
    updateSessionTime: async (sessionId) => {
        await pool.query('UPDATE ai_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [sessionId]);
    },

    /**
     * 更新会话标题
     */
    updateSessionTitle: async (sessionId, userId, title) => {
        await pool.query('UPDATE ai_sessions SET title = ? WHERE id = ? AND user_id = ?', [
            title,
            sessionId,
            userId
        ]);
    },

    /**
     * 删除会话
     */
    deleteSession: async (sessionId, userId) => {
        const [r] = await pool.query('DELETE FROM ai_sessions WHERE id = ? AND user_id = ?', [
            sessionId,
            userId
        ]);
        return r.affectedRows > 0;
    },

    /**
     * 添加消息到 ai_chats 表
     * @param {number} sessionId - 会话ID
     * @param {string} role - 角色 (user/assistant)
     * @param {string} content - 消息内容
     * @param {number} userId - 用户ID
     * @param {string} modelName - 模型名称（可选）
     * @returns {Promise<number>} chat_id
     */
    addMessage: async (sessionId, role, content, userId, modelName = null) => {
        const [r] = await pool.query(
            'INSERT INTO ai_chats (session_id, user_id, role, message, model_name, status) VALUES (?, ?, ?, ?, ?, ?)',
            [sessionId, userId, role, content, modelName || 'deepseek-chat', 'completed']
        );
        return r.insertId;
    },

    /**
     * 按时间正序返回最近若干条消息（用于展示与对话上下文）
     */
    listMessages: async (sessionId, limit = 100) => {
        const [rows] = await pool.query(
            `SELECT chat_id as id, role, message as content, model_name, token_count, status, created_at
             FROM (
                      SELECT chat_id, role, message, model_name, token_count, status, created_at
                      FROM ai_chats
                      WHERE session_id = ?
                      ORDER BY chat_id DESC
                      LIMIT ?
                  ) t
             ORDER BY chat_id ASC`,
            [sessionId, limit]
        );
        return rows;
    },

    /**
     * 全量正序（可选大窗口，用于简单拉取历史）
     */
    listAllMessagesChronological: async (sessionId, maxRows = 500) => {
        const [rows] = await pool.query(
            `SELECT chat_id as id, role, message as content, model_name, token_count, status, created_at
             FROM ai_chats
             WHERE session_id = ?
             ORDER BY chat_id ASC
             LIMIT ?`,
            [sessionId, maxRows]
        );
        return rows;
    }
};

module.exports = AiChat;
