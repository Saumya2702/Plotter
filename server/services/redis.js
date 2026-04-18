
const Redis = require('ioredis');

let client;
let isRedisDisabled = false;
let hasLoggedError = false;


function getRedisClient() {
  if (client) return client;

  client = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),

    retryStrategy(times) {
      if (times >= 2) {
        isRedisDisabled = true;
        return null;
      }
      return 500;
    },
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  client.on('connect', () => {
    console.log('[Redis] Connected');
    isRedisDisabled = false;
    hasLoggedError = false;
  });

  client.on('error', (err) => {
    if (!hasLoggedError) {
      console.warn('[Redis] Offline. Background caching disabled (app will still work via Postgres).');
      hasLoggedError = true;
    }
  });


  client.connect().catch(() => { });

  return client;
}


async function cacheGet(key) {
  if (isRedisDisabled) return null;
  try {
    const redis = getRedisClient();
    return await redis.get(key);
  } catch (err) {
    return null;
  }
}


async function cacheSet(key, ttlSeconds, value) {
  if (isRedisDisabled) return;
  try {
    const redis = getRedisClient();
    await redis.setex(key, ttlSeconds, value);
  } catch (err) { }
}


async function cacheDel(pattern) {
  if (isRedisDisabled) return;
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch (err) { }
}

module.exports = { getRedisClient, cacheGet, cacheSet, cacheDel };
