import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { questions } from '@/lib/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Get distinct contentIds and their question counts
    const result = await db.execute<{
      content_id: string;
      question_count: number;
      first_created: Date;
      last_created: Date;
      types: string;
    }>(sql`
      SELECT 
        contentid as content_id,
        COUNT(*) as question_count,
        MIN(tg_tao::timestamp) as first_created,
        MAX(tg_tao::timestamp) as last_created,
        STRING_AGG(DISTINCT chuong_trinh, ', ') as types
      FROM question 
      WHERE contentid IS NOT NULL AND contentid != ''
      GROUP BY contentid 
      ORDER BY MIN(tg_tao::timestamp) DESC NULLS LAST
    `);

    return NextResponse.json({
      totalContentCount: result.rows.length,
      contents: result.rows
    });
  } catch (error) {
    console.error('Error in debug content endpoint:', error);
    return NextResponse.json({ error: 'Failed to fetch content debug info' }, { status: 500 });
  }
}
