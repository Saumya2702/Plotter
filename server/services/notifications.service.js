const pool = require('./db');

async function getNotifications(userId) {
  const sql = `
    SELECT 
      n.*, 
      u.username as actor_name, 
      u.avatar_url as actor_avatar,
      s.title as story_title
    FROM notifications n
    JOIN public.users u ON n.actor_id = u.id
    LEFT JOIN stories s ON n.story_id = s.id
    WHERE n.user_id = $1
    ORDER BY n.created_at DESC
    LIMIT 50
  `;
  const { rows } = await pool.query(sql, [userId]);
  return rows;
}

async function createNotification({ userId, actorId, type, storyId, content }) {
  // Don't notify yourself
  if (userId === actorId) return null;

  const sql = `
    INSERT INTO notifications (user_id, actor_id, type, story_id, content)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const { rows } = await pool.query(sql, [userId, actorId, type, storyId, content]);
  return rows[0];
}

async function markAsRead(notificationId, userId) {
  const sql = `
    UPDATE notifications 
    SET is_read = TRUE 
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `;
  const { rows } = await pool.query(sql, [notificationId, userId]);
  return rows[0];
}

async function markAllAsRead(userId) {
  const sql = `
    UPDATE notifications 
    SET is_read = TRUE 
    WHERE user_id = $1
  `;
  await pool.query(sql, [userId]);
  return { success: true };
}

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead
};
