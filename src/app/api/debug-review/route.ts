import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { content, questions, vocabulary } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import { extractVocabularyWords } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    
    if (!contentId) {
      return NextResponse.json({ error: 'contentId parameter required' }, { status: 400 });
    }

    console.log('=== DEBUG REVIEW API START ===');
    console.log('Content ID:', contentId);

    // 1. Check if content exists and get its infor1 data
    const contentData = await db
      .select()
      .from(content)
      .where(eq(content.id, contentId))
      .limit(1);

    console.log('Content data found:', contentData.length);
    if (contentData.length > 0) {
      console.log('Content infor1:', contentData[0].infor1);
      console.log('Content title:', contentData[0].title);
    }

    // 2. Extract vocabulary words from infor1
    const infor1Text = contentData[0]?.infor1 || '';
    const extractedWords = extractVocabularyWords(infor1Text);
    console.log('Extracted vocabulary words:', extractedWords);

    // 3. Check if any vocabulary exists in the database for these words
    let vocabularyResults: any[] = [];
    if (extractedWords.length > 0) {
      const whereConditions = extractedWords.map(word => `LOWER(word) = '${word.replace(/'/g, "''")}'`).join(' OR ');
      
      const query = sql`
        SELECT word, definition, part_of_speech
        FROM meraki.vocabulary
        WHERE ${sql.raw(whereConditions)}
      `;
      
      const result = await db.execute(query);
      vocabularyResults = result.rows;
      console.log('Vocabulary found in database:', vocabularyResults.length);
      console.log('Vocabulary items:', vocabularyResults);
    }

    // 4. Check questions for this content ID
    const questionsData = await db
      .select()
      .from(questions)
      .where(eq(questions.contentid, contentId));

    console.log('Questions found:', questionsData.length);
    if (questionsData.length > 0) {
      console.log('Sample question:', {
        id: questionsData[0].id,
        type: questionsData[0].questionType,
        content: questionsData[0].noiDung?.substring(0, 100) + '...'
      });
    }

    // 5. Check total vocabulary count in database
    const totalVocabQuery = sql`SELECT COUNT(*) as count FROM meraki.vocabulary`;
    const totalVocabResult = await db.execute(totalVocabQuery);
    const totalVocabCount = totalVocabResult.rows[0]?.count || 0;
    console.log('Total vocabulary in database:', totalVocabCount);

    console.log('=== DEBUG REVIEW API END ===');

    return NextResponse.json({
      contentId,
      contentExists: contentData.length > 0,
      contentTitle: contentData[0]?.title || 'N/A',
      infor1Text,
      extractedWords,
      vocabularyFoundCount: vocabularyResults.length,
      vocabularyItems: vocabularyResults,
      questionsFoundCount: questionsData.length,
      totalVocabularyInDatabase: totalVocabCount,
      diagnosis: {
        hasContent: contentData.length > 0,
        hasInfor1: !!infor1Text,
        hasExtractedWords: extractedWords.length > 0,
        hasVocabularyMatches: vocabularyResults.length > 0,
        hasQuestions: questionsData.length > 0,
        possibleIssues: [
          ...(contentData.length === 0 ? ['Content not found'] : []),
          ...(!infor1Text ? ['No infor1 data in content'] : []),
          ...(extractedWords.length === 0 ? ['No vocabulary words extracted from infor1'] : []),
          ...(vocabularyResults.length === 0 && extractedWords.length > 0 ? ['Vocabulary words not found in database'] : []),
          ...(questionsData.length === 0 ? ['No questions found for content'] : []),
          ...(totalVocabCount === 0 ? ['Vocabulary table is empty'] : [])
        ]
      }
    });

  } catch (error) {
    console.error('Debug review API error:', error);
    return NextResponse.json(
      { error: 'Failed to debug review data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
