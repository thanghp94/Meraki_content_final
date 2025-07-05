import { db } from './src/lib/database';
import { sql } from 'drizzle-orm';

async function addContentColumns() {
  try {
    console.log('Adding new columns to content table...');
    
    // Add image2 column
    await db.execute(sql`
      ALTER TABLE content 
      ADD COLUMN IF NOT EXISTS image2 TEXT DEFAULT ''
    `);
    console.log('✅ Added image2 column');
    
    // Add video2 column
    await db.execute(sql`
      ALTER TABLE content 
      ADD COLUMN IF NOT EXISTS video2 TEXT DEFAULT ''
    `);
    console.log('✅ Added video2 column');
    
    // Add visible column
    await db.execute(sql`
      ALTER TABLE content 
      ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true
    `);
    console.log('✅ Added visible column');
    
    // Add order_index column
    await db.execute(sql`
      ALTER TABLE content 
      ADD COLUMN IF NOT EXISTS order_index INTEGER
    `);
    console.log('✅ Added order_index column');
    
    console.log('🎉 All columns added successfully!');
    
    // Test the updated API
    console.log('\nTesting updated API...');
    const result = await db.execute(sql`
      SELECT 
        id,
        "Title" as title,
        image1,
        image2,
        video1,
        video2,
        visible,
        order_index
      FROM content 
      LIMIT 1
    `);
    
    console.log('Sample content with new fields:', result.rows[0]);
    
  } catch (error) {
    console.error('Error adding columns:', error);
  }
}

addContentColumns();
