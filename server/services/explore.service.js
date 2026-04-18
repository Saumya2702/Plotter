const pool = require('./db');

async function searchStories({ q, category, nearLng, nearLat }) {
  let query = `
    SELECT
      s.id, s.title, s.content, s.category, s.created_at,
      ST_X(s.location::geometry) AS lng,
      ST_Y(s.location::geometry) AS lat,
      u.username, u.avatar_url,
      (SELECT count(*) FROM reactions r WHERE r.story_id = s.id) as reaction_count
    FROM stories s
    LEFT JOIN public.users u ON s.user_id = u.id
    WHERE s.parent_id IS NULL
  `;
  const params = [];
  let paramIdx = 1;

  if (q) {
    query += ` AND s.text_search_vector @@ plainto_tsquery('english', $${paramIdx})`;
    params.push(q);
    paramIdx++;
  }

  if (category) {
    query += ` AND s.category = $${paramIdx}`;
    params.push(category);
    paramIdx++;
  }

  if (nearLng && nearLat) {
    // Distance query within roughly 50km
    query += ` AND ST_DWithin(s.location, ST_SetSRID(ST_MakePoint($${paramIdx}, $${paramIdx+1}), 4326), 50000)`;
    params.push(nearLng, nearLat);
    paramIdx += 2;
  }

  query += ` ORDER BY reaction_count DESC LIMIT 50`;

  const { rows } = await pool.query(query, params);
  return rows;
}

module.exports = { searchStories };
