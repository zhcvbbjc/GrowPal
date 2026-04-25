const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/authController/authController');
const avatarUpload = require('../utils/avatarUpload');

router.post('/send-code', authController.sendCode);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.me);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/avatar', authMiddleware, avatarUpload.single('avatar'), authController.updateAvatar);

module.exports = router;
