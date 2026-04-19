const commentsService = require('../services/comments.service');

async function createComment(req, res, next) {
  try {
    const { storyId } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    if (isNaN(parseInt(storyId, 10))) {
      return res.status(400).json({ error: 'Invalid story ID' });
    }

    const comment = await commentsService.createComment({
      userId,
      storyId: parseInt(storyId, 10),
      content: content.trim(),
      parentId: parentCommentId ? parseInt(parentCommentId, 10) : null
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

module.exports = { createComment };
