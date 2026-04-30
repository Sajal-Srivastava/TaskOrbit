const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config();

const { pool } = require('../config/db');

const run = async () => {
  try {
    const sqlPath = path.resolve(__dirname, '../../db/init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('Database schema initialized.');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed.');
    console.error(error);
    process.exit(1);
  }
};

run();
