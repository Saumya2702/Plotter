require('dotenv').config();
const pool = require('../server/services/db');
const fs = require('fs');
const path = require('path');

async function migrate() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../db/migrations/005_user_emails.sql'), 'utf8');
    await pool.query(sql);
    console.log('Migration successful: email column added and trigger updated');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
