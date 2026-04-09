const AiChat = require('../../models/AiChat');
const { chat: llmChat } = require('../../services/llmService');

const SYSTEM_PROMPT =
    process.env.LLM_SYSTEM_PROMPT ||
    '你是 GrowPal 应用里的智能助手，回答简洁、友好、准确，使用简体中文。';

exports.createSession = async (req, res) => {
    try {
        const title = (req.body.title && String(req.body.title).trim()) || '新对话';
        const sessionId = await AiChat.createSession(req.user.id, title.slice(0, 200));
        res.status(201).json({ sessionId, title });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: '创建会话失败', error: e.message });
    }
};

exports.listSessions = async (req, res) => {
    try {
        const rows = await AiChat.listSessions(req.user.id);
        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: '获取会话列表失败', error: e.message });
    }
};

exports.deleteSession = async (req, res) => {
    try {
        const ok = await AiChat.deleteSession(req.params.sessionId, req.user.id);
        if (!ok) return res.status(404).json({ message: '会话不存在' });
        res.json({ message: '已删除' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: '删除失败', error: e.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const session = await AiChat.getSession(req.params.sessionId, req.user.id);
        if (!session) return res.status(404).json({ message: '会话不存在' });

        const limit = Math.min(Number(req.query.limit) || 200, 500);
        const messages = await AiChat.listAllMessagesChronological(session.id, limit);
        res.json({ session, messages });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: '获取消息失败', error: e.message });
    }
};

/**
 * 发送用户消息并调用大模型回复
 * body: { content: string }
 */
exports.sendMessage = async (req, res) => {
    try {
        const content = req.body.content != null ? String(req.body.content).trim() : '';
        if (!content) {
            return res.status(400).json({ message: '消息内容不能为空' });
        }

        const session = await AiChat.getSession(req.params.sessionId, req.user.id);
        if (!session) return res.status(404).json({ message: '会话不存在' });

        await AiChat.addMessage(session.id, 'user', content);

        const history = await AiChat.listMessages(session.id, 40);
        const messagesForLlm = [{ role: 'system', content: SYSTEM_PROMPT }];
        for (const m of history) {
            if (m.role === 'user' || m.role === 'assistant') {
                messagesForLlm.push({ role: m.role, content: m.content });
            }
        }

        let reply;
        try {
            reply = await llmChat(messagesForLlm);
        } catch (err) {
            if (err.code === 'LLM_NO_KEY') {
                return res.status(503).json({
                    message: err.message
                });
            }
            console.error(err);
            return res.status(502).json({
                message: '大模型调用失败',
                detail: err.message
            });
        }

        const assistantMsgId = await AiChat.addMessage(session.id, 'assistant', reply);
        await AiChat.updateSessionTime(session.id);

        const firstUserLine = content.split('\n')[0].slice(0, 40);
        if (session.title === '新对话' && firstUserLine) {
            await AiChat.updateSessionTitle(session.id, req.user.id, firstUserLine);
        }

        res.json({
            reply,
            assistantMessageId: assistantMsgId
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: '发送失败', error: e.message });
    }
};
