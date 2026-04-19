const pool = require('./db');

async function createComment({ userId, storyId, content, parentId }) {
  const sql = `
    INSERT INTO public.comments (user_id, story_id, content, parent_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, content, created_at, parent_id
  `;
  const { rows } = await pool.query(sql, [userId, storyId, content, parentId || null]);
  return rows[0];
}

module.exports = { createComment };
