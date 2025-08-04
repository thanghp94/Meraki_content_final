import { db } from './src/lib/database';
import { sql } from 'drizzle-orm';

async function addProgramColumn() {
  try {
    console.log('Adding program column to meraki.topic table...');
    
    // Add the program column
    await db.execute(sql`
      ALTER TABLE meraki.topic 
      ADD COLUMN IF NOT EXISTS program TEXT
    `);
    
    console.log('✅ Program column added successfully!');
    
    // Optionally, you can set default values for existing topics
    console.log('Setting default program values for existing topics...');
    
    await db.execute(sql`
      UPDATE meraki.topic 
      SET program = 'Grapeseed' 
      WHERE program IS NULL AND unit LIKE 'Unit %'
    `);
    
    await db.execute(sql`
      UPDATE meraki.topic 
      SET program = 'TATH' 
      WHERE program IS NULL AND unit LIKE 'Bài %'
    `);
    
    console.log('✅ Default program values set!');
    
  } catch (error) {
    console.error('❌ Error adding program column:', error);
  } finally {
    process.exit(0);
  }
}

addProgramColumn();
