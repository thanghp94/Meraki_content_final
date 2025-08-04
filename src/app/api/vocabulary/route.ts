import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { vocabulary } from '@/lib/schema';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
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

    // Create new vocabulary item
    const newVocabularyItem = {
      id: uuidv4(),
      word: word.trim(),
      partOfSpeech: partOfSpeech.trim(),
      definition: definition.trim(),
      exampleSentence: exampleSentence?.trim() || null,
      phoneticTranscription: phoneticTranscription?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      videoUrl: videoUrl?.trim() || null,
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db
      .insert(vocabulary)
      .values(newVocabularyItem)
      .returning();

    return NextResponse.json({ 
      message: 'Vocabulary item created successfully',
      vocabularyItem: result[0]
    });
  } catch (error) {
    console.error('Error creating vocabulary item:', error);
    return NextResponse.json(
      { error: 'Failed to create vocabulary item' },
      { status: 500 }
    );
  }
}
