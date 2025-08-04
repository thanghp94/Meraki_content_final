const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkContentTable() {
  try {
    console.log('Checking content table structure...');
    
    // Check if table exists and get its structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'content'
      ORDER BY ordinal_position;
    `);
    
    console.log('Content table columns:');
    console.table(tableInfo.rows);
    
    // Get sample data
    const sampleData = await pool.query('SELECT * FROM content LIMIT 5;');
    console.log('\nSample content data:');
    console.table(sampleData.rows);
    
  } catch (error) {
    console.error('Error checking content table:', error);
  } finally {
    await pool.end();
  }
}

checkContentTable();
