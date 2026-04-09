const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const ctrl = require('../controllers/userChatController/userChatController');

router.get('/users/search', authMiddleware, ctrl.searchUsers);
router.get('/conversations', authMiddleware, ctrl.listConversations);
router.post('/conversations', authMiddleware, ctrl.openOrCreateConversation);
router.get('/conversations/:conversationId/messages', authMiddleware, ctrl.getMessages);
router.post('/conversations/:conversationId/messages', authMiddleware, ctrl.sendMessage);

module.exports = router;
