import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await Promise.resolve(params);
  
  try {
    const body = await request.json();
    const { title, infor1, infor2, image1, image2, video1, video2, topicid } = body;

    await db.execute(sql`
      UPDATE meraki.content
      SET 
        "Title" = ${title},
        infor1 = ${infor1},
        infor2 = ${infor2},
        image1 = ${image1},
        image2 = ${image2 || ''},
        video1 = ${video1},
        video2 = ${video2 || ''},
        topicid = ${topicid}
      WHERE id = ${id}
    `);

    return NextResponse.json({ message: 'Content updated successfully' });
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await Promise.resolve(params);
  
  try {
    await db.execute(sql`
      DELETE FROM meraki.content
      WHERE id = ${id}
    `);

    return NextResponse.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await Promise.resolve(params);
  
  try {
    // Get content details
    const contentResult = await db.execute(sql`
      SELECT 
        c.id,
        c."Title" as title,
        c.infor1,
        c.infor2,
        c.image1,
        c.image2,
        c.video1,
        c.video2,
        c.date_created,
        c.topicid,
        c.visible,
        c.order_index
      FROM meraki.content c
      WHERE c.id = ${id}
    `);

    if (contentResult.rows.length === 0) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const content = contentResult.rows[0];

    // Get questions associated with this content using correct column names from meraki schema
    const questionsResult = await db.execute(sql`
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
        q.tg_tao
      FROM meraki.question q
      WHERE q.contentid = ${id}
      ORDER BY q.tg_tao ASC, q.id ASC
    `);

    const questions = questionsResult.rows.map(row => ({
      id: row.id as string,
      chuong_trinh: row.chuong_trinh as string,
      questionlevel: row.questionlevel as string,
      contentid: row.contentid as string,
      question_type: (row.question_type as string) || 'text',
      noi_dung: (row.noi_dung as string) || '',
      video: row.video as string,
      picture: row.picture as string,
      cau_tra_loi_1: row.cau_tra_loi_1 as string,
      cau_tra_loi_2: row.cau_tra_loi_2 as string,
      cau_tra_loi_3: row.cau_tra_loi_3 as string,
      cau_tra_loi_4: row.cau_tra_loi_4 as string,
      correct_choice: row.correct_choice as string,
      time: parseInt(row.time as string) || 30,
      explanation: row.explanation as string,
      answer: row.answer as string,
      tg_tao: row.tg_tao as string,
      visible: true,
      order_index: 0
    }));

    return NextResponse.json({
      ...content,
      questions: questions
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}
