const AiChat = require('../../models/AiChat');
const pool = require('../../config/database');

/**
 * 保存用户消息、AI 回复、图片记录到数据库
 */
async function saveMemory(state) {
    const { dbSessionId, userId, userMessage, reply, images, sessionId } = state;

    try {
        // 如果没有 dbSessionId，说明是新会话，需要创建
        let sessionDbId = dbSessionId;
        if (!sessionDbId) {
            sessionDbId = await AiChat.createSession(userId, '新对话');
        }

        const modelName = process.env.LLM_MODEL || 'deepseek-chat';

        // 保存用户消息
        const userMsgId = await AiChat.addMessage(
            sessionDbId,
            'user',
            userMessage,
            userId,
            modelName
        );

        // 保存图片记录到 ai_chat_images
        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                await pool.query(
                    'INSERT INTO ai_chat_images (chat_id, image_url, image_type, sort_order) VALUES (?, ?, ?, ?)',
                    [userMsgId, images[i].url, 'input', i]
                );
            }
        }

        // 保存 AI 回复
        let assistantMsgId = null;
        if (reply) {
            assistantMsgId = await AiChat.addMessage(
                sessionDbId,
                'assistant',
                reply,
                userId,
                modelName
            );
        }

        // 更新会话时间
        await AiChat.updateSessionTime(sessionDbId);

        return {
            ...state,
            dbSessionId: sessionDbId,
            userMsgId,
            assistantMsgId,
            sessionId: sessionId || String(sessionDbId)
        };
    } catch (err) {
        console.error('[节点:saveMemory] 保存失败:', err.message);
        return { ...state, error: err };
    }
}

module.exports = saveMemory;
