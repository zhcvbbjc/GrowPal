const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createUploadMiddleware } = require('../utils/upload');

const questionController = require('../controllers/questionController/questionController');
const questionCommentController = require('../controllers/questionController/questionCommentController');
const questionLikeController = require('../controllers/questionController/questionLikeController');

// 创建支持多图上传的中间件
const uploadQuestionImages = createUploadMiddleware('question_images', true).array('images', 10);

router.post('/', authMiddleware, uploadQuestionImages, questionController.createQuestion);
router.get('/', questionController.getAllQuestions);
router.get('/:id', questionController.getQuestionById);
router.delete('/:id', authMiddleware, questionController.deleteQuestion);
router.get('/my/questions', authMiddleware, questionController.getUserQuestions);

router.post('/:id/comments', authMiddleware, questionCommentController.createComment);
router.get('/:id/comments', questionCommentController.getComments);
router.delete('/:id/comments/:cid', authMiddleware, questionCommentController.deleteComment);

router.post('/:id/like', authMiddleware, questionLikeController.toggleLike);
router.get('/:id/likes', questionLikeController.getLikeCount);

module.exports = router;
