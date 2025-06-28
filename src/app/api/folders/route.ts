import { NextRequest, NextResponse } from 'next/server';
import { getFoldersFromDatabase, addFolderToDatabase } from '@/lib/databaseService';

export async function GET() {
  try {
    const folders = await getFoldersFromDatabase();
    return NextResponse.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const folderId = await addFolderToDatabase(body);
    return NextResponse.json({ id: folderId });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
