import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { vocabulary } from '@/lib/schema';
import { sql, inArray, or, eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { words } = await request.json();
    
    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json({ error: 'Words array is required' }, { status: 400 });
    }

    // Clean and normalize words (remove extra spaces, convert to lowercase)
    const cleanWords = words
      .map(word => word.trim().toLowerCase())
      .filter(word => word.length > 0);

    if (cleanWords.length === 0) {
      return NextResponse.json({ vocabularyItems: [] });
    }

    // Search for vocabulary items that match any of the words
    const vocabularyItems = await db
      .select({
        id: vocabulary.id,
        word: vocabulary.word,
        partOfSpeech: vocabulary.partOfSpeech,
        definition: vocabulary.definition,
        exampleSentence: vocabulary.exampleSentence,
        phoneticTranscription: vocabulary.phoneticTranscription,
        imageUrl: vocabulary.imageUrl,
        videoUrl: vocabulary.videoUrl,
        tags: vocabulary.tags,
      })
      .from(vocabulary)
      .where(
        or(
          ...cleanWords.map(word => 
            sql`LOWER(${vocabulary.word}) = ${word.toLowerCase()}`
          )
        )
      );

    return NextResponse.json({ vocabularyItems });
  } catch (error) {
    console.error('Error searching vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to search vocabulary' },
      { status: 500 }
    );
  }
}
