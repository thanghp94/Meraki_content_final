import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Check what's actually in the database
    const result = await db.execute(sql`
      SELECT id, noi_dung, cau_tra_loi_1, cau_tra_loi_2, correct_choice, answer, contentid
      FROM meraki.question 
      WHERE contentid = '3404f277-207d-42ad-9577-af35e51b10c0'
      LIMIT 3
    `);
    
    return NextResponse.json({
      success: true,
      questions: result.rows
    });
    
  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Database check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
