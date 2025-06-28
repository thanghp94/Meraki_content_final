import { NextRequest, NextResponse } from 'next/server';
import { getQuestionsForGameFromDatabase, addQuestionToGameInDatabase, addMultipleQuestionsToGameInDatabase } from '@/lib/databaseService';

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const questions = await getQuestionsForGameFromDatabase(params.gameId);
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const body = await request.json();
    
    // Handle multiple questions
    if (Array.isArray(body)) {
      await addMultipleQuestionsToGameInDatabase(params.gameId, body);
      return NextResponse.json({ success: true });
    }
    
    // Handle single question
    const questionId = await addQuestionToGameInDatabase(params.gameId, body);
    return NextResponse.json({ id: questionId });
  } catch (error) {
    console.error('Error adding question(s):', error);
    return NextResponse.json({ error: 'Failed to add question(s)' }, { status: 500 });
  }
}
