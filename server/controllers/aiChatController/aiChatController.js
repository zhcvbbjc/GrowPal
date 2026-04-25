const AiChat = require('../../models/AiChat');
const { runAgent } = require('../../agent/index');

const SYSTEM_PROMPT =
    process.env.LLM_SYSTEM_PROMPT ||
    '你是 GrowPal 应用里的智能农业助手。你精通作物种植、土壤管理、病虫害防治等农业知识。回答简洁、友好、准确，使用简体中文。';

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
 * 发送用户消息并调用智能体回复（支持图片上传）
 * body: { content: string }
 * files: images (可选，最多5张)
 */
exports.sendMessage = async (req, res) => {
    try {
        const content = req.body.content != null ? String(req.body.content).trim() : '';
        if (!content) {
            return res.status(400).json({ message: '消息内容不能为空' });
        }

        const session = await AiChat.getSession(req.params.sessionId, req.user.id);
        if (!session) return res.status(404).json({ message: '会话不存在' });

        // 处理上传的图片
        const images = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                images.push({
                    filePath: file.path,
                    url: `/uploads/ai_chat_images/${file.filename}`
                });
            }
        }

        // 获取用户 IP
        const userIp = req.ip || req.connection?.remoteAddress || '';

        // 调用智能体
        const result = await runAgent({
            userId: req.user.id,
            sessionId: session.id,
            userMessage: content,
            userIp,
            images
        });

        if (result.error) {
            const err = result.error;
            if (err.code === 'LLM_NO_KEY') {
                return res.status(503).json({
                    message: '未配置大模型 API 密钥，请联系管理员配置 LLM_API_KEY 环境变量'
                });
            }
            if (err.code === 'LLM_HTTP') {
                return res.status(502).json({
                    message: '大模型服务暂时不可用，请稍后重试',
                    detail: err.message,
                    status: err.status
                });
            }
            return res.status(502).json({
                message: '大模型调用失败',
                detail: err.message
            });
        }

        // 新对话生成标题
        if (session.title === '新对话' && content) {
            try {
                const { generateTitle } = require('../../services/llmService');
                const generatedTitle = await generateTitle(content);
                await AiChat.updateSessionTitle(session.id, req.user.id, generatedTitle);
            } catch (titleErr) {
                console.error('[AI] 标题生成失败，使用默认标题:', titleErr.message);
                const fallbackTitle = content.split('\n')[0].slice(0, 40) || '新对话';
                await AiChat.updateSessionTitle(session.id, req.user.id, fallbackTitle);
            }
        }

        res.json({
            reply: result.reply,
            assistantMessageId: result.assistantMsgId,
            imageDescription: result.imageDescription
        });
    } catch (e) {
        console.error('[AI] 发送消息失败:', e);
        res.status(500).json({ message: '发送失败，请稍后重试', error: e.message });
    }
};
