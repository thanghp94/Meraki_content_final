import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllQuestionsFromDatabase,
  addQuestionToCentralDatabase,
  linkQuestionToGame,
  unlinkQuestionFromGame
} from '@/lib/databaseService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'WSC' | 'TAHN' | 'Grapeseed' | null;
    
    const questions = await getAllQuestionsFromDatabase(type || undefined);
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { action, ...questionData } = data;

    if (action === 'create') {
      // Create a new question in the central repository
      const questionId = await addQuestionToCentralDatabase(questionData);
      return NextResponse.json({ success: true, questionId });
    } else if (action === 'link') {
      // Link an existing question to a game
      const { gameId, questionId, orderInGame } = data;
      await linkQuestionToGame(gameId, questionId, orderInGame);
      return NextResponse.json({ success: true });
    } else if (action === 'unlink') {
      // Unlink a question from a game
      const { gameId, questionId } = data;
      await unlinkQuestionFromGame(gameId, questionId);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing question request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
