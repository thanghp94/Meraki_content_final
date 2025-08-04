import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { vocabulary } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      word,
      partOfSpeech,
      definition,
      exampleSentence,
      phoneticTranscription,
      imageUrl,
      videoUrl,
      tags
    } = body;

    // Validate required fields
    if (!word || !partOfSpeech || !definition) {
      return NextResponse.json(
        { error: 'Word, part of speech, and definition are required' },
        { status: 400 }
      );
    }

    // Update vocabulary item
    const updatedData = {
      word: word.trim(),
      partOfSpeech: partOfSpeech.trim(),
      definition: definition.trim(),
      exampleSentence: exampleSentence?.trim() || null,
      phoneticTranscription: phoneticTranscription?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      videoUrl: videoUrl?.trim() || null,
      tags: tags || [],
      updatedAt: new Date()
    };

    const result = await db
      .update(vocabulary)
      .set(updatedData)
      .where(eq(vocabulary.id, params.id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Vocabulary item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Vocabulary item updated successfully',
      vocabularyItem: result[0]
    });
  } catch (error) {
    console.error('Error updating vocabulary item:', error);
    return NextResponse.json(
      { error: 'Failed to update vocabulary item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await db
      .delete(vocabulary)
      .where(eq(vocabulary.id, params.id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Vocabulary item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Vocabulary item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vocabulary item:', error);
    return NextResponse.json(
      { error: 'Failed to delete vocabulary item' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await db
      .select()
      .from(vocabulary)
      .where(eq(vocabulary.id, params.id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Vocabulary item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ vocabularyItem: result[0] });
  } catch (error) {
    console.error('Error fetching vocabulary item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary item' },
      { status: 500 }
    );
  }
}
