const UserChat = require('../../models/UserChat');

exports.searchUsers = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (q.length < 1) {
            return res.status(400).json({ message: '请输入搜索关键词' });
        }
        const rows = await UserChat.searchUsers(q, req.user.id, 30);
        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: '搜索失败', error: e.message });
    }
};

exports.listConversations = async (req, res) => {
    try {
        const rows = await UserChat.listConversations(req.user.id);
        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: '获取会话列表失败', error: e.message });
    }
};

exports.openOrCreateConversation = async (req, res) => {
    try {
        const peerId = Number(req.body.peer_id);
        if (!peerId || Number.isNaN(peerId)) {
            return res.status(400).json({ message: '请指定对方用户 peer_id' });
        }
        const conversationId = await UserChat.findOrCreateConversation(req.user.id, peerId);
        res.status(201).json({ conversationId });
    } catch (e) {
        if (e.message === '不能与自己发起会话') {
            return res.status(400).json({ message: e.message });
        }
        console.error(e);
        res.status(500).json({ message: '创建会话失败', error: e.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const conv = await UserChat.getConversationForUser(req.params.conversationId, req.user.id);
        if (!conv) return res.status(404).json({ message: '会话不存在' });

        const limit = Math.min(Number(req.query.limit) || 50, 100);
        const beforeId = req.query.before ? Number(req.query.before) : null;
        const messages = await UserChat.listMessages(conv.id, limit, beforeId);
        await UserChat.markConversationRead(conv.id, req.user.id);

        res.json({
            conversation: conv,
            peer_id: conv.peer_id,
            messages
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: '获取消息失败', error: e.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const content = req.body.content != null ? String(req.body.content).trim() : '';
        if (!content) {
            return res.status(400).json({ message: '消息不能为空' });
        }

        const conv = await UserChat.getConversationForUser(req.params.conversationId, req.user.id);
        if (!conv) return res.status(404).json({ message: '会话不存在' });

        const messageId = await UserChat.addMessage(conv.id, req.user.id, content);
        res.status(201).json({ messageId, conversationId: conv.id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: '发送失败', error: e.message });
    }
};
