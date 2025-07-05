import { db } from './database';
import { sql } from 'drizzle-orm';

export async function migrateToCentralizedQuestions() {
  try {
    console.log('Starting migration to centralized questions system...');

    // Create the game_question_links table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS game_question_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        order_in_game INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        UNIQUE(game_id, question_id)
      )
    `);

    // Create indexes for better performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_game_question_links_game_id ON game_question_links(game_id);
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_game_question_links_question_id ON game_question_links(question_id);
    `);

    // Add the new columns to questions table if they don't exist
    await db.execute(sql`
      ALTER TABLE questions 
      ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'text',
      ADD COLUMN IF NOT EXISTS cau_tra_loi_1 TEXT,
      ADD COLUMN IF NOT EXISTS cau_tra_loi_2 TEXT,
      ADD COLUMN IF NOT EXISTS cau_tra_loi_3 TEXT,
      ADD COLUMN IF NOT EXISTS cau_tra_loi_4 TEXT,
      ADD COLUMN IF NOT EXISTS correct_choice TEXT,
      ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'WSC',
      ADD COLUMN IF NOT EXISTS media_url TEXT,
      ADD COLUMN IF NOT EXISTS media_type TEXT,
      ADD COLUMN IF NOT EXISTS media_alt TEXT;
    `);

    console.log('Migration completed successfully!');
    console.log('New tables and columns created:');
    console.log('- game_question_links table');
    console.log('- Additional columns in questions table for multiple choice support');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateToCentralizedQuestions()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}
