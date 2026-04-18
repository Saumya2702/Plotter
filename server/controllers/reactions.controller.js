const reactionsService = require('../services/reactions.service');

async function toggleReaction(req, res, next) {
  try {
    const { storyId } = req.params;
    const { type } = req.body;
    const userId = req.user.id;

    if (!type || !['like', 'haunt', 'legend'].includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    if (isNaN(parseInt(storyId, 10))) {
      return res.status(400).json({ error: 'Invalid story ID' });
    }

    const result = await reactionsService.toggleReaction(userId, storyId, type);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { toggleReaction };
