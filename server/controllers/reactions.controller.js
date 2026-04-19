const reactionsService = require('../services/reactions.service');
const storiesService = require('../services/stories.service');
const notificationsService = require('../services/notifications.service');

async function toggleReaction(req, res, next) {
  try {
    const { storyId } = req.params;
    const { type } = req.body;
    const userId = req.user.id;

    if (!type || !['like', 'haunt', 'legend'].includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    const storyIdInt = parseInt(storyId, 10);
    if (isNaN(storyIdInt)) {
      return res.status(400).json({ error: 'Invalid story ID' });
    }

    const result = await reactionsService.toggleReaction(userId, storyIdInt, type);

    // ── Notifications (In-App) ──────────────────────────
    if (result.status === 'added') {
      (async () => {
        try {
          const storyOwner = await storiesService.getStoryOwnerInfo(storyIdInt);
          if (storyOwner && userId !== storyOwner.user_id) {
            await notificationsService.createNotification({
              userId: storyOwner.user_id,
              actorId: userId,
              type: result.type, // 'like', 'haunt', 'legend'
              storyId: storyIdInt,
              content: null // Reactions don't have text content
            });
          }
        } catch (err) {
          console.warn('[Notification] Background reaction processing failed:', err.message);
        }
      })();
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { toggleReaction };
