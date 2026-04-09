const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const upload = require('../utils/upload');

const questionController = require('../controllers/questionController/questionController');
const questionCommentController = require('../controllers/questionController/questionCommentController');
const questionLikeController = require('../controllers/questionController/questionLikeController');

router.post('/', authMiddleware, upload.single('image'), questionController.createQuestion);
router.get('/', questionController.getAllQuestions);
router.get('/:id', questionController.getQuestionById);
router.delete('/:id', authMiddleware, questionController.deleteQuestion);

router.post('/:id/comments', authMiddleware, questionCommentController.createComment);
router.get('/:id/comments', questionCommentController.getComments);
router.delete('/:id/comments/:cid', authMiddleware, questionCommentController.deleteComment);

router.post('/:id/like', authMiddleware, questionLikeController.toggleLike);
router.get('/:id/likes', questionLikeController.getLikeCount);

module.exports = router;
