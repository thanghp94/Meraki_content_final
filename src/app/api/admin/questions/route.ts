import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT 
        q.id,
        q.chuong_trinh,
        q.questionlevel,
        q.contentid,
        q.question_type,
        q.noi_dung,
        q.video,
        q.picture,
        q.cau_tra_loi_1,
        q.cau_tra_loi_2,
        q.cau_tra_loi_3,
        q.cau_tra_loi_4,
        q.correct_choice,
        q.time,
        q.explanation,
        q.answer,
        q.tg_tao,
        c."Title" as content_title
      FROM meraki.question q
      LEFT JOIN meraki.content c ON q.contentid = c.id::text
      ORDER BY q.tg_tao DESC NULLS LAST
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      chuong_trinh,
      questionlevel,
      contentid,
      question_type,
      noi_dung,
      video,
      picture,
      cau_tra_loi_1,
      cau_tra_loi_2,
      cau_tra_loi_3,
      cau_tra_loi_4,
      correct_choice,
      time,
      explanation,
      answer
    } = body;

    const id = uuidv4();

    await db.execute(sql`
      INSERT INTO meraki.question (
        id,
        chuong_trinh,
        questionlevel,
        contentid,
        question_type,
        noi_dung,
        video,
        picture,
        cau_tra_loi_1,
        cau_tra_loi_2,
        cau_tra_loi_3,
        cau_tra_loi_4,
        correct_choice,
        time,
        explanation,
        answer,
        tg_tao
      )
      VALUES (
        ${id},
        ${chuong_trinh || ''},
        ${questionlevel || ''},
        ${contentid},
        ${question_type || 'multiple_choice'},
        ${noi_dung || ''},
        ${video || ''},
        ${picture || ''},
        ${cau_tra_loi_1 || ''},
        ${cau_tra_loi_2 || ''},
        ${cau_tra_loi_3 || ''},
        ${cau_tra_loi_4 || ''},
        ${correct_choice || ''},
        ${time || '30'},
        ${explanation || ''},
        ${answer || ''},
        NOW()
      )
    `);

    return NextResponse.json({ id, message: 'Question created successfully' });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
