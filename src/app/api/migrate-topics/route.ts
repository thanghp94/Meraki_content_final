import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

export async function POST() {
  try {
    console.log('Adding new columns to topic table...');
    
    // Add visible column (default to true to match existing showstudent behavior)
    await db.execute(sql`
      ALTER TABLE meraki.topic 
      ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true
    `);
    console.log('✅ Added visible column to topic table');
    
    // Add order_index column
    await db.execute(sql`
      ALTER TABLE meraki.topic 
      ADD COLUMN IF NOT EXISTS order_index INTEGER
    `);
    console.log('✅ Added order_index column to topic table');
    
    console.log('🎉 All topic columns added successfully!');
    
    // Test the updated API
    console.log('\nTesting updated topic API...');
    const result = await db.execute(sql`
      SELECT 
        id,
        topic,
        short_summary,
        unit,
        image,
        parentid,
        showstudent,
        visible,
        order_index
      FROM meraki.topic 
      LIMIT 1
    `);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Topic migration completed successfully',
      sample: result.rows[0] 
    });
    
  } catch (error) {
    console.error('Error adding topic columns:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Topic migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
