import { pgTable, text, integer, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';

// Games table
export const games = pgTable('games', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  subtitle: text('subtitle'),
  thumbnailUrl: text('thumbnail_url'),
  questionCount: integer('question_count').default(0).notNull(),
  playCount: integer('play_count').default(0).notNull(),
  aiHint: text('ai_hint'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Folders table
export const folders = pgTable('folders', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  coverImageUrl: text('cover_image_url'),
  itemCount: integer('item_count').default(0).notNull(),
  aiHint: text('ai_hint'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Game Questions table (renamed from questions to avoid conflicts)
export const gameQuestions = pgTable('game_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  gameId: uuid('game_id').references(() => games.id, { onDelete: 'cascade' }).notNull(),
  questionText: text('question_text').notNull(),
  answerText: text('answer_text').notNull(),
  points: integer('points').notNull(),
  mediaUrl: text('media_url'),
  mediaType: text('media_type'), // 'image' | 'video' | 'gif'
  mediaAlt: text('media_alt'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type GameQuestion = typeof gameQuestions.$inferSelect;
export type NewGameQuestion = typeof gameQuestions.$inferInsert;

// Keep legacy exports for backward compatibility
export const questions = gameQuestions;
export type Question = GameQuestion;
export type NewQuestion = NewGameQuestion;
