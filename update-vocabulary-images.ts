#!/usr/bin/env tsx

/**
 * Standalone script to update vocabulary images in bulk
 * Usage: npx tsx update-vocabulary-images.ts
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { vocabulary } from './src/lib/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface ImageResult {
  type: 'giphy' | 'google';
  url: string;
  thumbnail: string;
  title: string;
}

// Database setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', (client) => {
  client.query('SET search_path TO meraki, public');
});

const db = drizzle(pool);

// Function to search for images using Google Custom Search API directly
async function searchGoogleImages(query: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  
  if (!apiKey || !searchEngineId) {
    console.error('Google Search API not configured. Please set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables.');
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&searchType=image&safe=active&num=1`
    );
    
    if (!response.ok) {
      console.error(`Google API error for "${query}": ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items[0].link;
    }
    
    return null;
  } catch (error) {
    console.error(`Error searching Google Images for "${query}":`, error);
    return null;
  }
}

// Add delay to avoid hitting API rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function updateVocabularyImages() {
  try {
    console.log('🚀 Starting vocabulary image update process...');
    console.log('📊 Using Google Images (child-appropriate content)');
    
    // Fetch ALL vocabulary words
    const vocabularyWords = await db
      .select({
        id: vocabulary.id,
        word: vocabulary.word,
        imageUrl: vocabulary.imageUrl,
      })
      .from(vocabulary)
      .orderBy(vocabulary.word);
    
    console.log(`📚 Found ${vocabularyWords.length} vocabulary words to process`);
    
    const results = {
      total: vocabularyWords.length,
      processed: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[],
    };
    
    const batchSize = 5; // Smaller batch size to be more conservative with API calls
    const delayMs = 2000; // 2 second delay between requests
    
    // Process in batches
    for (let i = 0; i < vocabularyWords.length; i += batchSize) {
      const batch = vocabularyWords.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(vocabularyWords.length / batchSize);
      
      console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} words)`);
      
      for (const vocabItem of batch) {
        try {
          console.log(`🔍 Searching image for: "${vocabItem.word}"`);
          
          // Search for image using Google Images
          const imageUrl = await searchGoogleImages(vocabItem.word);
          
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
            console.log(`✅ Updated "${vocabItem.word}" with image`);
          } else {
            results.failed++;
            results.errors.push(`No image found for "${vocabItem.word}"`);
            console.log(`❌ No image found for "${vocabItem.word}"`);
          }
          
          results.processed++;
          
          // Add delay between requests
          await delay(delayMs);
          
        } catch (error) {
          results.failed++;
          const errorMsg = `Error processing "${vocabItem.word}": ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
          results.processed++;
        }
      }
      
      // Progress update
      const progressPercent = Math.round((results.processed / results.total) * 100);
      console.log(`📈 Progress: ${results.processed}/${results.total} (${progressPercent}%) - Updated: ${results.updated}, Failed: ${results.failed}`);
      
      // Longer delay between batches
      if (i + batchSize < vocabularyWords.length) {
        console.log(`⏳ Waiting ${delayMs * 2}ms before next batch...`);
        await delay(delayMs * 2);
      }
    }
    
    console.log('\n🎉 Vocabulary image update completed!');
    console.log(`📊 Final Results:`);
    console.log(`   Total words: ${results.total}`);
    console.log(`   Successfully updated: ${results.updated}`);
    console.log(`   Failed: ${results.failed}`);
    console.log(`   Success rate: ${Math.round((results.updated / results.total) * 100)}%`);
    
    if (results.errors.length > 0) {
      console.log(`\n❌ Errors encountered:`);
      results.errors.slice(0, 10).forEach(error => console.log(`   - ${error}`));
      if (results.errors.length > 10) {
        console.log(`   ... and ${results.errors.length - 10} more errors`);
      }
    }
    
  } catch (error) {
    console.error('💥 Fatal error in vocabulary image update:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  updateVocabularyImages()
    .then(() => {
      console.log('✨ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export { updateVocabularyImages };
