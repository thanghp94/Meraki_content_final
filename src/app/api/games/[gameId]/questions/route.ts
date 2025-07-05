import { NextRequest, NextResponse } from 'next/server';
import { 
  getQuestionsForGameFromDatabase, 
  addMultipleQuestionsToGameInDatabase,
  addQuestionToGameInDatabase
} from '@/lib/databaseService';

export async function GET(request: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;

  if (!gameId) {
    return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
  }

  try {
    const questions = await getQuestionsForGameFromDatabase(gameId);
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;

  if (!gameId) {
    return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
  }

  try {
    const data = await request.json();

    // Check if this is a request to import questions from content
    if (data.contentId) {
      // Import all questions from the specified content
      const { getQuestionsForContent } = await import('@/lib/databaseService');
      const contentQuestions = await getQuestionsForContent(data.contentId);
      
      if (contentQuestions.length === 0) {
        return NextResponse.json({ error: 'No questions found for this content' }, { status: 400 });
      }

      await addMultipleQuestionsToGameInDatabase(gameId, contentQuestions);
      return NextResponse.json({ 
        success: true, 
        count: contentQuestions.length,
        message: `Imported ${contentQuestions.length} questions from content`
      });
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return NextResponse.json({ error: 'Empty questions array' }, { status: 400 });
      }
      await addMultipleQuestionsToGameInDatabase(gameId, data);
      return NextResponse.json({ success: true, count: data.length });
    } else {
      // Single question
      await addQuestionToGameInDatabase(gameId, data);
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Error importing or adding question:', error);
    return NextResponse.json({ error: 'Failed to add question(s)' }, { status: 500 });
  }
}
