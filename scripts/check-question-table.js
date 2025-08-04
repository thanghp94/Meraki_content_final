const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkQuestionTable() {
  try {
    console.log('Checking question table structure...');
    
    // Check if table exists and get its structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'question'
      ORDER BY ordinal_position;
    `);
    
    console.log('Question table columns:');
    console.table(tableInfo.rows);
    
    // Get sample data
    const sampleData = await pool.query('SELECT * FROM question LIMIT 3;');
    console.log('\nSample question data:');
    console.table(sampleData.rows);
    
  } catch (error) {
    console.error('Error checking question table:', error);
  } finally {
    await pool.end();
  }
}

checkQuestionTable();
