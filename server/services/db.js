

const { Pool } = require('pg');

const config = {

  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

if (process.env.DATABASE_URL) {
  config.connectionString = process.env.DATABASE_URL;
  config.ssl = { rejectUnauthorized: false };
} else {
  config.host = process.env.DB_HOST || 'localhost';
  config.port = parseInt(process.env.DB_PORT || '5432', 10);
  config.database = process.env.DB_NAME || 'plotter';
  config.user = process.env.DB_USER || 'postgres';
  config.password = process.env.DB_PASSWORD || '';
}

const pool = new Pool(config);

pool.connect((err, client, release) => {
  if (err) {
    console.error('[DB] Failed to connect to PostgreSQL:', err.message);
    return;
  }
  console.log('[DB] Connected to PostgreSQL');
  release();
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

module.exports = pool;
