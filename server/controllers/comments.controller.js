const commentsService = require('../services/comments.service');
const storiesService = require('../services/stories.service');
const notificationsService = require('../services/notifications.service');

async function createComment(req, res, next) {
  try {
    const { storyId } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const storyIdInt = parseInt(storyId, 10);
    const comment = await commentsService.createComment({
      userId,
      storyId: storyIdInt,
      content: content.trim(),
      parentId: parentCommentId ? parseInt(parentCommentId, 10) : null
    });

    // ── Notifications (In-App) ──────────────────────────
    (async () => {
      try {
        const storyOwner = await storiesService.getStoryOwnerInfo(storyIdInt);
        
        // Notify Story Owner
        if (storyOwner && userId !== storyOwner.user_id) {
          await notificationsService.createNotification({
            userId: storyOwner.user_id,
            actorId: userId,
            type: 'comment',
            storyId: storyIdInt,
            content: content.trim().substring(0, 100)
          });
        }

        // Notify Parent Comment Author (if reply)
        if (parentCommentId) {
          const parentOwner = await commentsService.getCommentOwnerInfo(parseInt(parentCommentId, 10));
          if (parentOwner && userId !== parentOwner.user_id) {
             await notificationsService.createNotification({
               userId: parentOwner.user_id,
               actorId: userId,
               type: 'reply',
               storyId: storyIdInt,
               content: content.trim().substring(0, 100)
             });
          }
        }
      } catch (err) {
        console.warn('[Notification] Background processing failed:', err.message);
      }
    })();

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

module.exports = { createComment };
