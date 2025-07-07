import { NextRequest, NextResponse } from 'next/server';
import { getContentFromDatabase } from '@/lib/databaseService';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    
    if (!contentId) {
      return NextResponse.json({ error: 'contentId required' }, { status: 400 });
    }
    
    // Get all content
    const allContent = await getContentFromDatabase();
    const selectedContent = allContent.find(c => c.id === contentId);
    
    if (!selectedContent) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }
    
    // Debug the raw SQL result
    const rawResult = await db.execute(sql`
      SELECT id, noi_dung, cau_tra_loi_1, cau_tra_loi_2, correct_choice, answer, contentid
      FROM question
      WHERE contentid = ${contentId}
      LIMIT 1
    `);

    // Debug the content structure
    console.log('Selected content:', JSON.stringify(selectedContent, null, 2));
    console.log('First question:', JSON.stringify(selectedContent.questions?.[0], null, 2));
    console.log('Raw SQL result:', JSON.stringify(rawResult.rows[0], null, 2));
    
    return NextResponse.json({
      contentId,
      contentName: selectedContent.name,
      questionCount: selectedContent.questionCount,
      actualQuestions: selectedContent.questions?.length || 0,
      firstQuestion: selectedContent.questions?.[0] || null,
      allQuestions: selectedContent.questions || [],
      rawSqlResult: rawResult.rows[0]
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
