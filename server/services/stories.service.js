

const pool = require('./db');
const { cacheGet, cacheSet, cacheDel } = require('./redis');

const BBOX_CACHE_TTL = 60;

function roundCoord(n) {
  return parseFloat(n).toFixed(2);
}

function bboxKey(minLng, minLat, maxLng, maxLat) {
  return `bbox:${roundCoord(minLng)}_${roundCoord(minLat)}_${roundCoord(maxLng)}_${roundCoord(maxLat)}`;
}

async function getStoriesInBbox(minLng, minLat, maxLng, maxLat) {
  const key = bboxKey(minLng, minLat, maxLng, maxLat);
  const cached = await cacheGet(key);
  if (cached) return JSON.parse(cached);

  const sql = `
    SELECT
      s.id,
      s.title,
      s.category,
      s.created_at,
      ST_X(s.location::geometry) AS lng,
      ST_Y(s.location::geometry) AS lat,
      u.username,
      u.avatar_url,
      (SELECT COUNT(*) FROM reactions r WHERE r.story_id = s.id) AS reaction_count
    FROM stories s
    LEFT JOIN public.users u ON s.user_id = u.id
    WHERE ST_Within(
      s.location::geometry,
      ST_MakeEnvelope($1, $2, $3, $4, 4326)
    )
    AND s.parent_id IS NULL -- Only show top-level stories on the map
    ORDER BY s.created_at DESC
    LIMIT 300
  `;

  const { rows } = await pool.query(sql, [minLng, minLat, maxLng, maxLat]);
  await cacheSet(key, BBOX_CACHE_TTL, JSON.stringify(rows));
  return rows;
}

async function getStoryById(storyId, userId = null) {
  const storySql = `
    SELECT
      s.id, s.title, s.content, s.image_url, s.category, s.place_name, s.created_at, s.parent_id,
      ST_X(s.location::geometry) AS lng,
      ST_Y(s.location::geometry) AS lat,
      u.username, u.avatar_url,
      (SELECT count(*) FROM reactions r WHERE r.story_id = s.id AND type='like') as like_count,
      (SELECT count(*) FROM reactions r WHERE r.story_id = s.id AND type='haunt') as haunt_count,
      (SELECT count(*) FROM reactions r WHERE r.story_id = s.id AND type='legend') as legend_count,
      (SELECT count(*) FROM reactions r WHERE r.story_id = s.id AND type='like' AND user_id = $2::uuid) > 0 as user_has_like,
      (SELECT count(*) FROM reactions r WHERE r.story_id = s.id AND type='haunt' AND user_id = $2::uuid) > 0 as user_has_haunt,
      (SELECT count(*) FROM reactions r WHERE r.story_id = s.id AND type='legend' AND user_id = $2::uuid) > 0 as user_has_legend
    FROM stories s
    LEFT JOIN public.users u ON s.user_id = u.id
    WHERE s.id = $1
  `;

  const threadSql = `
    WITH RECURSIVE thread AS (
       SELECT s.id, s.parent_id, s.user_id, s.title, s.content, s.created_at, s.category, s.image_url, 1 as depth
       FROM stories s WHERE s.parent_id = $1
       UNION ALL
       SELECT s.id, s.parent_id, s.user_id, s.title, s.content, s.created_at, s.category, s.image_url, t.depth + 1
       FROM stories s
       INNER JOIN thread t ON s.parent_id = t.id
    )
    SELECT t.*, u.username, u.avatar_url 
    FROM thread t 
    LEFT JOIN public.users u ON t.user_id = u.id
    ORDER BY t.created_at ASC
  `;


  const commentsSql = `
    SELECT c.*, u.username, u.avatar_url 
    FROM public.comments c
    LEFT JOIN public.users u ON c.user_id = u.id
    WHERE c.story_id = $1
    ORDER BY c.created_at ASC
  `;

  const [storyResult, threadResult, commentsResult] = await Promise.all([
    pool.query(storySql, [storyId, userId]),
    pool.query(threadSql, [storyId]),
    pool.query(commentsSql, [storyId])
  ]);

  if (storyResult.rows.length === 0) return null;

  return {
    story: storyResult.rows[0],
    thread: threadResult.rows,
    comments: commentsResult.rows
  };
}

async function createStory({ userId, category, title, content, lat, lng, placeName, imageUrl, parentId }) {
  const sql = `
    INSERT INTO stories (user_id, category, title, content, location, place_name, image_url, parent_id)
    VALUES (
      $1, $2, $3, $4, 
      ST_SetSRID(ST_MakePoint($5, $6), 4326), 
      $7, $8, $9
    )
    RETURNING id, title, created_at
  `;

  const { rows } = await pool.query(sql, [
    userId, category || 'memory', title, content, lng, lat, placeName || null, imageUrl || null, parentId || null
  ]);

  await cacheDel('bbox:*');
  return rows[0];
}

async function getStoryOwnerInfo(storyId) {
  const sql = `
    SELECT u.email, u.username, s.title
    FROM stories s
    JOIN public.users u ON s.user_id = u.id
    WHERE s.id = $1
  `;
  const { rows } = await pool.query(sql, [storyId]);
  return rows[0];
}

module.exports = { getStoriesInBbox, getStoryById, createStory, getStoryOwnerInfo };
