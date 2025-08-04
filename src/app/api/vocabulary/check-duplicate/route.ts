import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { vocabulary } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const word = searchParams.get('word');

    if (!word) {
      return NextResponse.json(
        { error: 'Word parameter is required' },
        { status: 400 }
      );
    }

    // Check for exact match (case-insensitive)
    const existingWord = await db
      .select({
        id: vocabulary.id,
        word: vocabulary.word,
        partOfSpeech: vocabulary.partOfSpeech,
        definition: vocabulary.definition
      })
      .from(vocabulary)
      .where(sql`LOWER(${vocabulary.word}) = LOWER(${word})`)
      .limit(1);

    const isDuplicate = existingWord.length > 0;

    return NextResponse.json({
      isDuplicate,
      existingWord: isDuplicate ? existingWord[0] : null
    });
  } catch (error) {
    console.error('Error checking for duplicate vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to check for duplicate vocabulary' },
      { status: 500 }
    );
  }
}
