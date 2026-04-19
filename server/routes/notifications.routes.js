const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', notificationsController.getNotifications);
router.post('/mark-all-read', notificationsController.markAllAsRead);
router.post('/:id/read', notificationsController.markAsRead);

module.exports = router;
