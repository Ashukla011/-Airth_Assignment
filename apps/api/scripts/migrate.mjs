import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');

const directory = dirname(fileURLToPath(import.meta.url));
const sql = await readFile(
  join(directory, '../migrations/001_create_jobs.sql'),
  'utf8',
);
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === 'true' || process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
});

try {
  await pool.query(sql);
  console.log('Database migration completed');
} finally {
  await pool.end();
}
