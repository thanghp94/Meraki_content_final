const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sql = `
CREATE TABLE IF NOT EXISTS "content" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"topic" text,
	"thumbnail_url" text,
	"question_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

INSERT INTO "content" ("id", "name", "description", "topic", "thumbnail_url", "question_count") 
VALUES 
  ('math-basics', 'Math Basics', 'Basic mathematics questions covering addition, multiplication, and square roots', 'Mathematics', 'https://placehold.co/600x400.png?text=Math+Basics', 5),
  ('science-basics', 'Science Fundamentals', 'Basic science questions covering chemistry, biology, and astronomy', 'Science', 'https://placehold.co/600x400.png?text=Science+Basics', 8),
  ('world-history', 'World History', 'Important events and figures in world history', 'History', 'https://placehold.co/600x400.png?text=World+History', 12),
  ('english-grammar', 'English Grammar', 'Grammar rules and language structure', 'English', 'https://placehold.co/600x400.png?text=English+Grammar', 6),
  ('geography-basics', 'Geography Basics', 'Countries, capitals, and geographical features', 'Geography', 'https://placehold.co/600x400.png?text=Geography+Basics', 10)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  topic = EXCLUDED.topic,
  thumbnail_url = EXCLUDED.thumbnail_url,
  question_count = EXCLUDED.question_count,
  updated_at = now();
`;

async function setupContentTable() {
  try {
    console.log('Setting up content table...');
    await pool.query(sql);
    console.log('Content table setup complete with sample data!');
  } catch (error) {
    console.error('Content table setup failed:', error);
  } finally {
    await pool.end();
  }
}

setupContentTable();
