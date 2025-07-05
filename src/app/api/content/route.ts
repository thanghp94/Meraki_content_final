import { NextResponse } from 'next/server';
import { getContentFromDatabase } from '@/lib/databaseService';

export async function GET() {
  try {
    const content = await getContentFromDatabase();
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}
