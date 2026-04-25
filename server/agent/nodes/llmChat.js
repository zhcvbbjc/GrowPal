const { chat: llmChat } = require('../../services/llmService');
const { buildSystemPrompt } = require('../prompts/system');

/**
 * 组装完整 messages，调用 DeepSeek 生成回复
 */
async function llmChatNode(state) {
    const { history, userMessage, locationInfo, weatherInfo, imageDescription } = state;

    const systemPrompt = buildSystemPrompt({ locationInfo, weatherInfo, imageDescription });

    const messages = [{ role: 'system', content: systemPrompt }];

    // 加入历史对话
    if (history && history.length > 0) {
        for (const m of history) {
            if (m.role === 'user' || m.role === 'assistant') {
                messages.push({ role: m.role, content: m.content });
            }
        }
    }

    // 加入当前用户消息（含图片描述时拼入）
    let currentUserContent = userMessage;
    if (imageDescription) {
        currentUserContent = `[图片分析结果：${imageDescription}]\n\n${userMessage}`;
    }
    messages.push({ role: 'user', content: currentUserContent });

    try {
        console.log(`[节点:llmChat] 调用 DeepSeek，消息数: ${messages.length}`);
        const reply = await llmChat(messages);
        console.log(`[节点:llmChat] 回复成功，长度: ${reply.length}`);
        return { ...state, reply };
    } catch (err) {
        console.error('[节点:llmChat] 调用失败:', err.message);
        return { ...state, reply: null, error: err };
    }
}

module.exports = llmChatNode;
