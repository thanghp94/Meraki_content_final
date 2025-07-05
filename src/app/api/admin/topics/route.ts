import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { topics } from '@/lib/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT id, topic, short_summary, unit, image, parentid, showstudent, visible, order_index, program
      FROM meraki.topic
      ORDER BY 
        unit,
        COALESCE(order_index, 999999) ASC,
        topic
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, short_summary, unit, image, showstudent, visible = true, order_index, program } = body;

    const id = `topic-${Date.now()}`;

    await db.execute(sql`
      INSERT INTO meraki.topic (id, topic, short_summary, unit, image, showstudent, visible, order_index, program)
      VALUES (${id}, ${topic}, ${short_summary}, ${unit}, ${image}, ${showstudent}, ${visible}, ${order_index}, ${program})
    `);

    return NextResponse.json({ id, message: 'Topic created successfully' });
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}
