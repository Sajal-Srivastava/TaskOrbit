const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Configure backend/.env before starting the server.');
}

const parsed = new URL(connectionString);

const poolConfig = {
  user: decodeURIComponent(parsed.username || ''),
  password: decodeURIComponent(parsed.password || ''),
  host: parsed.hostname,
  port: Number(parsed.port || 5432),
  database: parsed.pathname.replace(/^\//, ''),
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
};

const pool = new Pool(poolConfig);

const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query,
};
