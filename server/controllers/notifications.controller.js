const notificationsService = require('../services/notifications.service');

async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const notifications = await notificationsService.getNotifications(userId);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await notificationsService.markAsRead(id, userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.id;
    await notificationsService.markAllAsRead(userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
