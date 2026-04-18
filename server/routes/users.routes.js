const express = require('express');
const router = express.Router();
const usersService = require('../services/users.service');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await usersService.getUserProfile(id);
    
    if (!profile) return res.status(404).json({ error: 'User not found' });
    
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.id !== id) {
       return res.status(403).json({ error: 'You can only edit your own profile' });
    }
    
    const { username, avatar_url } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    const updated = await usersService.updateUserProfile(id, { username, avatar_url });
    res.json(updated);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Username already taken' });
    next(err);
  }
});

module.exports = router;
