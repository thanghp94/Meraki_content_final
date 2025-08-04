import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { vocabulary } from '@/lib/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get a few sample vocabulary items to check the image URLs
    const sampleItems = await db
      .select({
        id: vocabulary.id,
        word: vocabulary.word,
        imageUrl: vocabulary.imageUrl,
        videoUrl: vocabulary.videoUrl,
      })
      .from(vocabulary)
      .limit(10);

    return NextResponse.json({ 
      count: sampleItems.length,
      sampleItems,
      // Also check if there are any items with image URLs
      itemsWithImages: sampleItems.filter(item => item.imageUrl && item.imageUrl.trim() !== '').length
    });
  } catch (error) {
    console.error('Error fetching vocabulary debug info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary debug info' },
      { status: 500 }
    );
  }
}
