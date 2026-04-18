const pool = require('./db');

async function createComment({ userId, storyId, content }) {
  const sql = `
    INSERT INTO public.comments (user_id, story_id, content)
    VALUES ($1, $2, $3)
    RETURNING id, content, created_at
  `;
  const { rows } = await pool.query(sql, [userId, storyId, content]);
  return rows[0];
}

module.exports = { createComment };
