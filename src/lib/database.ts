import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Set the search path to use meraki schema
pool.on('connect', (client) => {
  client.query('SET search_path TO meraki, public');
});

export const db = drizzle(pool, { schema });

export default db;
