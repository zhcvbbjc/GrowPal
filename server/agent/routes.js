const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createUploadMiddleware } = require('../utils/upload');
const { runAgent } = require('./index');

// 创建AI聊天图片上传中间件
const uploadAiChatImages = createUploadMiddleware('ai_chat_images', true).array('images', 5);

// 发送消息（支持图片上传）
router.post(
    '/message',
    authMiddleware,
    uploadAiChatImages,
    async (req, res) => {
        try {
            const content = req.body.content != null ? String(req.body.content).trim() : '';
            if (!content) {
                return res.status(400).json({ message: '消息内容不能为空' });
            }

            const sessionId = req.body.sessionId || null;

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

            const result = await runAgent({
                userId: req.user.id,
                sessionId,
                userMessage: content,
                userIp,
                images
            });

            if (result.error) {
                const err = result.error;
                if (err.code === 'LLM_NO_KEY') {
                    return res.status(503).json({ message: '未配置大模型 API 密钥' });
                }
                if (err.code === 'LLM_HTTP') {
                    return res.status(502).json({ message: '大模型服务暂时不可用，请稍后重试' });
                }
                return res.status(502).json({ message: '大模型调用失败', detail: err.message });
            }

            res.json({
                reply: result.reply,
                sessionId: result.sessionId || result.dbSessionId,
                imageDescription: result.imageDescription,
                assistantMsgId: result.assistantMsgId
            });
        } catch (e) {
            console.error('[智能体路由] 请求处理失败:', e);
            res.status(500).json({ message: '服务器内部错误' });
        }
    }
);

module.exports = router;
