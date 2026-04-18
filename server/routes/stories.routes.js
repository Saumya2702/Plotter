const express = require('express');
const router = express.Router();
const storiesController = require('../controllers/stories.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');

router.get('/', storiesController.getStoriesInBbox);
router.get('/:id', optionalAuth, storiesController.getStoryById);
router.post('/', authenticateToken, storiesController.createStory);

module.exports = router;
