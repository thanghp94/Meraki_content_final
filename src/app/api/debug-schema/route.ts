import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Check what columns exist in the topic table
    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'topic'
      ORDER BY ordinal_position
    `);

    return NextResponse.json({ 
      success: true, 
      columns: result.rows 
    });
  } catch (error) {
    console.error('Error checking schema:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
