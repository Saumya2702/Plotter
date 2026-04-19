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

async function getCommentOwnerInfo(commentId) {
  const sql = `
    SELECT u.email, u.username
    FROM public.comments c
    JOIN public.users u ON c.user_id = u.id
    WHERE c.id = $1
  `;
  const { rows } = await pool.query(sql, [commentId]);
  return rows[0];
}

module.exports = { createComment, getCommentOwnerInfo };
