import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { words } = body;

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json({ vocabularyItems: [] });
    }

    // Clean and prepare words for search
    const cleanWords = words
      .map(word => word.trim().toLowerCase())
      .filter(word => word.length > 0);

    if (cleanWords.length === 0) {
      return NextResponse.json({ vocabularyItems: [] });
    }

    // Create SQL query to search for vocabulary items
    // Using ILIKE for case-insensitive search with individual OR conditions
    const whereConditions = cleanWords.map(word => `LOWER(word) = '${word.replace(/'/g, "''")}'`).join(' OR ');
    
    const query = sql`
      SELECT 
        id,
        word,
        part_of_speech,
        definition,
        example_sentence,
        phonetic_transcription,
        image_url,
        video_url,
        tags,
        created_at,
        updated_at
      FROM meraki.vocabulary
      WHERE ${sql.raw(whereConditions)}
      ORDER BY word ASC
    `;

    const result = await db.execute(query);
    
    console.log('Vocabulary search - cleanWords:', cleanWords);
    console.log('Vocabulary search - result count:', result.rows.length);
    
    // Transform the results to match the expected interface
    const vocabularyItems = result.rows.map((row: any) => ({
      id: row.id,
      word: row.word,
      partOfSpeech: row.part_of_speech,
      definition: row.definition,
      exampleSentence: row.example_sentence,
      phoneticTranscription: row.phonetic_transcription,
      imageUrl: row.image_url,
      videoUrl: row.video_url,
      tags: row.tags ? (Array.isArray(row.tags) ? row.tags : [row.tags]) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return NextResponse.json({ vocabularyItems });
  } catch (error) {
    console.error('Error searching vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to search vocabulary', vocabularyItems: [] },
      { status: 500 }
    );
  }
}
