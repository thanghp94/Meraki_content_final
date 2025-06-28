import { NextRequest, NextResponse } from 'next/server';
import { getGamesFromDatabase, addGameToDatabase } from '@/lib/databaseService';

export async function GET() {
  try {
    const games = await getGamesFromDatabase();
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const gameId = await addGameToDatabase(body);
    return NextResponse.json({ id: gameId });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
