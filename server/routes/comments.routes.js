const express = require('express');
const router = express.Router({ mergeParams: true });
const commentsController = require('../controllers/comments.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.post('/', authenticateToken, commentsController.createComment);

module.exports = router;
