const pool = require('./db');

async function getUserProfile(userId) {
  const userRes = await pool.query('SELECT id, username, avatar_url, created_at FROM public.users WHERE id = $1', [userId]);
  if (userRes.rows.length === 0) return null;
  const user = userRes.rows[0];

  const statsRes = await pool.query(`
    SELECT 
      count(s.id) as total_pins,
      (SELECT count(r.id) FROM reactions r JOIN stories st ON r.story_id = st.id WHERE st.user_id = $1) as total_reactions_received
    FROM stories s WHERE s.user_id = $1
  `, [userId]);

  const topStoriesRes = await pool.query(`
    SELECT s.id, s.title, s.category,
      ST_X(s.location::geometry) AS lng,
      ST_Y(s.location::geometry) AS lat,
      (SELECT count(*) FROM reactions r WHERE r.story_id = s.id) as reaction_count
    FROM stories s
    WHERE s.user_id = $1
    ORDER BY reaction_count DESC
    LIMIT 20
  `, [userId]);

  return {
    ...user,
    stats: statsRes.rows[0],
    stories: topStoriesRes.rows
  };
}

async function updateUserProfile(userId, { username, avatar_url }) {
  const sql = `
    UPDATE public.users 
    SET username = $1, avatar_url = $2
    WHERE id = $3
    RETURNING id, username, avatar_url
  `;
  const { rows } = await pool.query(sql, [username, avatar_url, userId]);
  return rows[0];
}

module.exports = { getUserProfile, updateUserProfile };
