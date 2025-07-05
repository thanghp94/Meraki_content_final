import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await db.execute(sql`
      UPDATE question
      SET 
        chuong_trinh = ${chuong_trinh},
        questionlevel = ${questionlevel},
        contentid = ${contentid},
        question_type = ${question_type},
        noi_dung = ${noi_dung},
        video = ${video},
        picture = ${picture},
        cau_tra_loi_1 = ${cau_tra_loi_1},
        cau_tra_loi_2 = ${cau_tra_loi_2},
        cau_tra_loi_3 = ${cau_tra_loi_3},
        cau_tra_loi_4 = ${cau_tra_loi_4},
        correct_choice = ${correct_choice},
        time = ${time},
        explanation = ${explanation},
        answer = ${answer}
      WHERE id = ${params.id}
    `);

    return NextResponse.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.execute(sql`
      DELETE FROM question
      WHERE id = ${params.id}
    `);

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await db.execute(sql`
      SELECT 
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
      FROM question
      WHERE id = ${params.id}
    `);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
  }
}
