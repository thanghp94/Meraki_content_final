import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

export async function POST() {
  try {
    console.log('Adding program column to topic table...');
    
    // Add the program column
    await db.execute(sql`
      ALTER TABLE topic 
      ADD COLUMN IF NOT EXISTS program TEXT
    `);
    
    console.log('✅ Program column added successfully!');
    
    // Set default values for existing topics
    console.log('Setting default program values for existing topics...');
    
    await db.execute(sql`
      UPDATE topic 
      SET program = 'Grapeseed' 
      WHERE program IS NULL AND unit LIKE 'Unit %'
    `);
    
    await db.execute(sql`
      UPDATE topic 
      SET program = 'TATH' 
      WHERE program IS NULL AND unit LIKE 'Bài %'
    `);
    
    console.log('✅ Default program values set!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Program column added successfully and default values set!' 
    });
    
  } catch (error) {
    console.error('❌ Error adding program column:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add program column',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
