const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sql = `
CREATE TABLE IF NOT EXISTS "folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"cover_image_url" text,
	"item_count" integer DEFAULT 0 NOT NULL,
	"ai_hint" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"subtitle" text,
	"thumbnail_url" text,
	"question_count" integer DEFAULT 0 NOT NULL,
	"play_count" integer DEFAULT 0 NOT NULL,
	"ai_hint" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

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

CREATE TABLE IF NOT EXISTS "question" (
	"id" text PRIMARY KEY NOT NULL,
	"topic" text,
	"random_order" integer,
	"question_level" text,
	"content_id" text,
	"question_type" text DEFAULT 'text' NOT NULL,
	"nb_dung" text,
	"video" text,
	"picture" text,
	"cau_tra_loi1" text,
	"cau_tra_loi2" text,
	"cau_tra_loi3" text,
	"cau_tra_loi4" text,
	"correct_choice" text,
	"writing_choice" text,
	"time" integer,
	"explanation" text,
	"question_order" integer,
	"translation" text,
	"update" text,
	"ig_lao" text,
	"answer" text,
	"show_answer" text,
	"student_seen" text,
	"type" text DEFAULT 'WSC' NOT NULL,
	"question_text" text NOT NULL,
	"points" integer NOT NULL,
	"media_url" text,
	"media_type" text,
	"media_alt" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "game_question_links" (
	"game_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"order_in_game" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "game_question_links_game_id_question_id_pk" PRIMARY KEY("game_id","question_id")
);

CREATE TABLE IF NOT EXISTS "game_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"answer_text" text NOT NULL,
	"points" integer NOT NULL,
	"media_url" text,
	"media_type" text,
	"media_alt" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'game_questions_game_id_games_id_fk'
    ) THEN
        ALTER TABLE "game_questions" ADD CONSTRAINT "game_questions_game_id_games_id_fk" 
        FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'game_question_links_game_id_games_id_fk'
    ) THEN
        ALTER TABLE "game_question_links" ADD CONSTRAINT "game_question_links_game_id_games_id_fk" 
        FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'game_question_links_question_id_question_id_fk'
    ) THEN
        ALTER TABLE "game_question_links" ADD CONSTRAINT "game_question_links_question_id_question_id_fk" 
        FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'question_content_id_content_id_fk'
    ) THEN
        ALTER TABLE "question" ADD CONSTRAINT "question_content_id_content_id_fk" 
        FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE set null ON UPDATE no action;
    END IF;
END $$;
`;

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');
    await pool.query(sql);
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
