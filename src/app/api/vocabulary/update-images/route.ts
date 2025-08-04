import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { vocabulary } from '@/lib/schema';
import { eq, count, isNotNull } from 'drizzle-orm';

interface ImageResult {
  type: 'giphy' | 'google';
  url: string;
  thumbnail: string;
  title: string;
}

// Function to search for images using the existing search-images API
async function searchImagesForWord(word: string): Promise<string | null> {
  try {
    // Use Google Images only for young children (more appropriate than GIPHY)
    const response = await fetch(
      `http://localhost:9002/api/search-images?q=${encodeURIComponent(word)}&source=google`
    );
    
    if (!response.ok) {
      console.error(`Failed to search images for "${word}": ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Return the first Google image result (most relevant)
    if (data.results && data.results.length > 0) {
      const googleResults = data.results.filter((result: ImageResult) => result.type === 'google');
      if (googleResults.length > 0) {
        return googleResults[0].url;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error searching images for "${word}":`, error);
    return null;
  }
}

// Add delay to avoid hitting API rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  try {
    const { batchSize = 10, delayMs = 1000 } = await request.json();
    
    console.log('Starting vocabulary image update process...');
    
    // Fetch ALL vocabulary words (replacing all images, not just empty ones)
    const vocabularyWords = await db
      .select({
        id: vocabulary.id,
        word: vocabulary.word,
        imageUrl: vocabulary.imageUrl,
      })
      .from(vocabulary)
      .orderBy(vocabulary.word);
    
    console.log(`Found ${vocabularyWords.length} vocabulary words to process`);
    
    const results = {
      total: vocabularyWords.length,
      processed: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[],
    };
    
    // Process in batches to avoid overwhelming the APIs
    for (let i = 0; i < vocabularyWords.length; i += batchSize) {
      const batch = vocabularyWords.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vocabularyWords.length / batchSize)}`);
      
      for (const vocabItem of batch) {
        try {
          console.log(`Searching image for: "${vocabItem.word}"`);
          
          // Search for image
          const imageUrl = await searchImagesForWord(vocabItem.word);
          
          if (imageUrl) {
            // Update the vocabulary record with the new image URL
            await db
              .update(vocabulary)
              .set({ 
                imageUrl: imageUrl,
                updatedAt: new Date()
              })
              .where(eq(vocabulary.id, vocabItem.id));
            
            results.updated++;
            console.log(`✅ Updated "${vocabItem.word}" with image: ${imageUrl}`);
          } else {
            results.failed++;
            results.errors.push(`No image found for "${vocabItem.word}"`);
            console.log(`❌ No image found for "${vocabItem.word}"`);
          }
          
          results.processed++;
          
          // Add delay between requests to respect API rate limits
          if (delayMs > 0) {
            await delay(delayMs);
          }
          
        } catch (error) {
          results.failed++;
          const errorMsg = `Error processing "${vocabItem.word}": ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
          console.error(errorMsg);
          results.processed++;
        }
      }
      
      // Longer delay between batches
      if (i + batchSize < vocabularyWords.length) {
        console.log(`Batch completed. Waiting ${delayMs * 2}ms before next batch...`);
        await delay(delayMs * 2);
      }
    }
    
    console.log('Vocabulary image update completed!');
    console.log(`Results: ${results.updated} updated, ${results.failed} failed out of ${results.total} total`);
    
    return NextResponse.json({
      success: true,
      message: 'Vocabulary image update completed',
      results
    });
    
  } catch (error) {
    console.error('Error in vocabulary image update:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update vocabulary images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check status or get sample data
export async function GET() {
  try {
    // Get sample vocabulary data to show current state
    const sampleData = await db
      .select({
        id: vocabulary.id,
        word: vocabulary.word,
        imageUrl: vocabulary.imageUrl,
      })
      .from(vocabulary)
      .limit(10);
    
    const totalCount = await db
      .select({ count: count() })
      .from(vocabulary);
    
    const withImages = await db
      .select({ count: count() })
      .from(vocabulary)
      .where(isNotNull(vocabulary.imageUrl));
    
    return NextResponse.json({
      totalVocabulary: totalCount[0]?.count || 0,
      withImages: withImages[0]?.count || 0,
      withoutImages: (totalCount[0]?.count || 0) - (withImages[0]?.count || 0),
      sampleData
    });
    
  } catch (error) {
    console.error('Error getting vocabulary status:', error);
    return NextResponse.json(
      { error: 'Failed to get vocabulary status' },
      { status: 500 }
    );
  }
}
