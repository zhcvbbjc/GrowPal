const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createUploadMiddleware } = require('../utils/upload');

const postController = require('../controllers/postController/postController');
const postCommentController = require('../controllers/postController/postCommentController');
const postLikeController = require('../controllers/postController/postLikeController');

// 创建支持多图上传的中间件
const uploadPostImages = createUploadMiddleware('post_images', true).array('images', 10);

router.post('/', authMiddleware, uploadPostImages, postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.delete('/:id', authMiddleware, postController.deletePost);
router.get('/my/posts', authMiddleware, postController.getUserPosts);

router.post('/:id/comments', authMiddleware, postCommentController.createComment);
router.get('/:id/comments', postCommentController.getComments);
router.delete('/:id/comments/:cid', authMiddleware, postCommentController.deleteComment);

router.post('/:id/like', authMiddleware, postLikeController.toggleLike);
router.get('/:id/likes', postLikeController.getLikeCount);

module.exports = router;
