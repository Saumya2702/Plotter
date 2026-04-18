const express = require('express');
const router = express.Router();
const exploreService = require('../services/explore.service');

router.get('/', async (req, res, next) => {
  try {
    const { q, category, lat, lng } = req.query;
    
    const results = await exploreService.searchStories({
      q: q ? String(q) : null,
      category: category ? String(category) : null,
      nearLng: lng ? Number(lng) : null,
      nearLat: lat ? Number(lat) : null
    });

    res.json(results);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
