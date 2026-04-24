const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/authController/authController');
const upload = require('../utils/upload');

router.post('/send-code', authController.sendCode);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.me);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/avatar', authMiddleware, upload.single('avatar'), authController.updateAvatar);

module.exports = router;
