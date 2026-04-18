const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const reactionsController = require('../controllers/reactions.controller');

router.post('/:storyId', authenticateToken, reactionsController.toggleReaction);

module.exports = router;
