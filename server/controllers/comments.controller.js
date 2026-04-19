const commentsService = require('../services/comments.service');
const storiesService = require('../services/stories.service');
const { sendNotificationEmail } = require('../services/email.service');

async function createComment(req, res, next) {
  try {
    const { storyId } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = req.user.id;
    const commenterName = req.user.user_metadata?.username || 'Someone';

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

    // ── Email Notifications ─────────────────────────────────────
    // Use an async immediate function so we don't block the response
    (async () => {
      try {
        const storyOwner = await storiesService.getStoryOwnerInfo(storyIdInt);
        
        // Notify Story Owner
        if (storyOwner && storyOwner.email && userId !== storyOwner.user_id) {
          await sendNotificationEmail({
            to: storyOwner.email,
            subject: `New reflection on "${storyOwner.title}"`,
            title: 'New Reflection',
            body: `<strong>${commenterName}</strong> shared a new whisper on your story "${storyOwner.title}".`,
            storyId: storyIdInt
          });
        }

        // Notify Parent Comment Author (if reply)
        if (parentCommentId) {
          const parentOwner = await commentsService.getCommentOwnerInfo(parseInt(parentCommentId, 10));
          if (parentOwner && parentOwner.email && userId !== parentOwner.user_id) {
             await sendNotificationEmail({
               to: parentOwner.email,
               subject: `New reply to your whisper on "${storyOwner.title}"`,
               title: 'New Reply',
               body: `<strong>${commenterName}</strong> replied to your whisper on the story "${storyOwner.title}".`,
               storyId: storyIdInt
             });
          }
        }
      } catch (emailErr) {
        console.warn('[Email] Background notification failed:', emailErr.message);
      }
    })();

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

module.exports = { createComment };
