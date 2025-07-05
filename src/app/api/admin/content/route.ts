import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT 
        c.id,
        c."Title" as title,
        c.infor1,
        c.infor2,
        c.image1,
        c.image2,
        c.video1,
        c.video2,
        c.topicid,
        c.date_created,
        c.visible,
        c.order_index,
        t.topic as topic_name,
        t.unit as topic_unit,
        COUNT(q.id) as question_count
      FROM content c
      LEFT JOIN topic t ON t.id = c.topicid
      LEFT JOIN question q ON q.contentid = c.id::text
      GROUP BY 
        c.id,
        c."Title",
        c.infor1,
        c.infor2,
        c.image1,
        c.image2,
        c.video1,
        c.video2,
        c.topicid,
        c.date_created,
        c.visible,
        c.order_index,
        t.topic,
        t.unit
      ORDER BY 
        COALESCE(c.order_index, 999999) ASC,
        c.date_created DESC NULLS LAST
    `);

    // Convert question_count to numbers to prevent string concatenation
    const processedRows = result.rows.map((row: any) => ({
      ...row,
      question_count: parseInt(row.question_count) || 0
    }));

    return NextResponse.json(processedRows);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, infor1, infor2, image1, image2, video1, video2, topicid, visible = true, order_index } = body;
    const id = uuidv4();

    await db.execute(sql`
      INSERT INTO content (id, "Title", infor1, infor2, image1, image2, video1, video2, topicid, date_created, visible, order_index)
      VALUES (${id}, ${title}, ${infor1}, ${infor2}, ${image1}, ${image2 || ''}, ${video1 || ''}, ${video2 || ''}, ${topicid}, NOW(), ${visible}, ${order_index})
    `);

    return NextResponse.json({ id, message: 'Content created successfully' });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
  }
}
