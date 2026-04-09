const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const ctrl = require('../controllers/aiChatController/aiChatController');

router.post('/sessions', authMiddleware, ctrl.createSession);
router.get('/sessions', authMiddleware, ctrl.listSessions);
router.delete('/sessions/:sessionId', authMiddleware, ctrl.deleteSession);
router.get('/sessions/:sessionId/messages', authMiddleware, ctrl.getMessages);
router.post('/sessions/:sessionId/messages', authMiddleware, ctrl.sendMessage);

module.exports = router;
