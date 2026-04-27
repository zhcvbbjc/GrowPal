const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createUploadMiddleware } = require('../utils/upload');

const exchangeFlowerController = require('../controllers/exchangeFlowerController/exchangeFlowerController');
const exchangeFlowerCommentController = require('../controllers/exchangeFlowerController/exchangeFlowerCommentController');
const exchangeFlowerLikeController = require('../controllers/exchangeFlowerController/exchangeFlowerLikeController');

// 创建支持多图上传的中间件
const uploadExchangeFlowerImages = createUploadMiddleware('exchange_flower_images', true).array('images', 10);

// 换花帖子 CRUD
router.post('/', authMiddleware, uploadExchangeFlowerImages, exchangeFlowerController.createExchangeFlower);
router.get('/', exchangeFlowerController.getAllExchangeFlowers);
router.get('/:id', exchangeFlowerController.getExchangeFlowerById);
router.delete('/:id', authMiddleware, exchangeFlowerController.deleteExchangeFlower);
router.get('/my/posts', authMiddleware, exchangeFlowerController.getUserExchangeFlowers);

// 更新换花状态
router.patch('/:id/status', authMiddleware, exchangeFlowerController.updateExchangeStatus);

// 评论
router.post('/:id/comments', authMiddleware, exchangeFlowerCommentController.createComment);
router.get('/:id/comments', exchangeFlowerCommentController.getComments);
router.delete('/:id/comments/:cid', authMiddleware, exchangeFlowerCommentController.deleteComment);

// 点赞
router.post('/:id/like', authMiddleware, exchangeFlowerLikeController.toggleLike);
router.get('/:id/likes', exchangeFlowerLikeController.getLikeCount);

module.exports = router;
