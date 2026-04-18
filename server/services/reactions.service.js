const pool = require('./db');

async function toggleReaction(userId, storyId, type) {

  const checkRes = await pool.query(
    'SELECT id FROM reactions WHERE user_id = $1 AND story_id = $2 AND type = $3',
    [userId, storyId, type]
  );

  if (checkRes.rows.length > 0) {

    await pool.query('DELETE FROM reactions WHERE id = $1', [checkRes.rows[0].id]);
    return { status: 'removed', type };
  } else {

    await pool.query(
      'INSERT INTO reactions (user_id, story_id, type) VALUES ($1, $2, $3)',
      [userId, storyId, type]
    );
    return { status: 'added', type };
  }
}

module.exports = { toggleReaction };
