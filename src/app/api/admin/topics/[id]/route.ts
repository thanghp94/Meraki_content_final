import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { topic, short_summary, unit, image, parentid, showstudent, program } = body;

    await db.execute(sql`
      UPDATE meraki.topic
      SET 
        topic = ${topic},
        short_summary = ${short_summary},
        unit = ${unit},
        image = ${image},
        parentid = ${parentid},
        showstudent = ${showstudent},
        program = ${program}
      WHERE id = ${id}
    `);

    return NextResponse.json({ message: 'Topic updated successfully' });
  } catch (error) {
    console.error('Error updating topic:', error);
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.execute(sql`
      DELETE FROM meraki.topic
      WHERE id = ${id}
    `);

    return NextResponse.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.execute(sql`
      SELECT id, topic, short_summary, unit, image, parentid, showstudent, visible, order_index, program
      FROM meraki.topic
      WHERE id = ${id}
    `);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json({ error: 'Failed to fetch topic' }, { status: 500 });
  }
}
