import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { vocabulary } from '@/lib/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const vocabularyItems = await db
      .select()
      .from(vocabulary)
      .orderBy(desc(vocabulary.createdAt));

    return NextResponse.json({ vocabularyItems });
  } catch (error) {
    console.error('Error fetching all vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary items' },
      { status: 500 }
    );
  }
}
