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
    const { title, infor1, infor2, image1, video1, topicid } = body;

    await db.execute(sql`
      UPDATE content
      SET 
        "Title" = ${title},
        infor1 = ${infor1},
        infor2 = ${infor2},
        image1 = ${image1},
        video1 = ${video1},
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
      DELETE FROM content
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
        c.video1,
        c.date_created,
        c.topicid
      FROM content c
      WHERE c.id = ${id}
    `);

    if (contentResult.rows.length === 0) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const content = contentResult.rows[0];

    // Get questions associated with this content
    const questionsResult = await db.execute(sql`
      SELECT 
        q.id,
        q.topic,
        q."randomOrder",
        q."questionLevel",
        q."contentId",
        q."questionType",
        q."nbDung",
        q.video,
        q.picture,
        q."cauTraLoi1",
        q."cauTraLoi2", 
        q."cauTraLoi3",
        q."cauTraLoi4",
        q."correctChoice",
        q."writingChoice",
        q.time,
        q.explanation,
        q."questionOrder",
        q.translation,
        q.update,
        q."igLao",
        q.answer,
        q."showAnswer",
        q."studentSeen",
        q.type,
        q."questionText",
        q.points,
        q."mediaUrl",
        q."mediaType",
        q."mediaAlt",
        q."createdAt",
        q."updatedAt"
      FROM question q
      WHERE q."contentId" = ${id}
      ORDER BY q."questionOrder" ASC, q.id ASC
    `);

    const questions = questionsResult.rows.map(row => ({
      id: row.id,
      topic: row.topic,
      randomOrder: row.randomOrder,
      questionLevel: row.questionLevel,
      contentId: row.contentId,
      questionType: row.questionType,
      nbDung: row.nbDung,
      video: row.video,
      picture: row.picture,
      cauTraLoi1: row.cauTraLoi1,
      cauTraLoi2: row.cauTraLoi2,
      cauTraLoi3: row.cauTraLoi3,
      cauTraLoi4: row.cauTraLoi4,
      correctChoice: row.correctChoice,
      writingChoice: row.writingChoice,
      time: row.time,
      explanation: row.explanation,
      questionOrder: row.questionOrder,
      translation: row.translation,
      update: row.update,
      igLao: row.igLao,
      answer: row.answer,
      showAnswer: row.showAnswer,
      studentSeen: row.studentSeen,
      type: row.type,
      questionText: row.questionText,
      points: row.points || 10, // Default points if not set
      mediaUrl: row.mediaUrl,
      mediaType: row.mediaType,
      mediaAlt: row.mediaAlt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
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
