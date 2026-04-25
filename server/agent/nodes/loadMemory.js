const AiChat = require('../../models/AiChat');

/**
 * 从数据库加载当前 session 的对话历史
 */
async function loadMemory(state) {
    const { sessionId } = state;
    if (!sessionId) {
        return { ...state, history: [] };
    }

    try {
        const session = await AiChat.getSession(sessionId, state.userId);
        if (!session) {
            return { ...state, history: [], dbSessionId: null };
        }

        const messages = await AiChat.listMessages(session.id, 40);
        const history = messages.map(m => ({
            role: m.role,
            content: m.content
        }));

        return { ...state, history, dbSessionId: session.id };
    } catch (err) {
        console.error('[节点:loadMemory] 加载历史失败:', err.message);
        return { ...state, history: [], dbSessionId: null };
    }
}

module.exports = loadMemory;
