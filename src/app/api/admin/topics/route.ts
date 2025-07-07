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
    const { topic, short_summary, unit, image, showstudent, program, parentid } = body;

    const id = `topic-${Date.now()}`;

    await db.execute(sql`
      INSERT INTO meraki.topic (id, topic, short_summary, unit, image, parentid, showstudent, program)
      VALUES (${id}, ${topic}, ${short_summary || ''}, ${unit}, ${image || ''}, ${parentid || null}, ${showstudent || false}, ${program || ''})
    `);

    return NextResponse.json({ id, message: 'Topic created successfully' });
  } catch (error) {
    console.error('Error creating topic:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Failed to create topic',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
