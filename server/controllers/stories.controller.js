

const storiesService = require('../services/stories.service');
const { sendNotificationEmail } = require('../services/email.service');

async function getStoriesInBbox(req, res, next) {
  try {
    const { bbox } = req.query;

    if (!bbox) return res.status(400).json({ error: 'bbox query parameter is required' });

    const parts = bbox.split(',').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) {
      return res.status(400).json({ error: 'bbox must be four comma-separated numbers: minLng,minLat,maxLng,maxLat' });
    }

    const [minLng, minLat, maxLng, maxLat] = parts;
    const stories = await storiesService.getStoriesInBbox(minLng, minLat, maxLng, maxLat);
    res.json({ stories, count: stories.length });
  } catch (err) {
    next(err);
  }
}

async function getStoryById(req, res, next) {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return res.status(400).json({ error: 'Invalid story ID' });

    const userId = req.user ? req.user.id : null;
    const result = await storiesService.getStoryById(id, userId);
    if (!result) return res.status(404).json({ error: 'Story not found' });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function createStory(req, res, next) {
  try {
    const { title, content, lat, lng, category, placeName, imageUrl, parentId } = req.body;
    const userId = req.user.id;
    const authorName = req.user.user_metadata?.username || 'Someone';

    if (!title || !content || isNaN(Number(lat)) || isNaN(Number(lng))) {
      return res.status(400).json({ error: 'Missing required map pin fields' });
    }

    const story = await storiesService.createStory({
      userId,
      category,
      title: title.trim(),
      content: content.trim(),
      lat: Number(lat),
      lng: Number(lng),
      placeName: placeName ? placeName.trim() : null,
      imageUrl: imageUrl || null,
      parentId: parentId ? parseInt(parentId, 10) : null
    });

    // ── Email Notifications (Threads) ───────────────────────────
    if (parentId) {
      (async () => {
        try {
          const parentStory = await storiesService.getStoryOwnerInfo(parseInt(parentId, 10));
          if (parentStory && parentStory.email && userId !== parentStory.user_id) {
             await sendNotificationEmail({
               to: parentStory.email,
               subject: `Someone continued your tale: "${parentStory.title}"`,
               title: 'New Chapter Added',
               body: `<strong>${authorName}</strong> just added a new chapter to your journey "${parentStory.title}".`,
               storyId: story.id // Link to the new story
             });
          }
        } catch (emailErr) {
          console.warn('[Email] Background thread notification failed:', emailErr.message);
        }
      })();
    }

    res.status(201).json({ story });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStoriesInBbox, getStoryById, createStory };
