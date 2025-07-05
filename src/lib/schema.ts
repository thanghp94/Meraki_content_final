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

// Content table in meraki schema
export const content = pgTable('content', {
  id: uuid('id').primaryKey(),
  title: text('Title'),
  infor1: text('infor1'),
  infor2: text('infor2'),
  image1: text('image1'),
  image2: text('image2'),
  video1: text('video1'),
  video2: text('video2'),
  topicid: text('topicid').references(() => topics.id),
  dateCreated: timestamp('date_created', { withTimezone: true }),
});

// Topic table in meraki schema
export const topics = pgTable('topic', {
  id: text('id').primaryKey(),
  topic: text('topic'),
  shortSummary: text('short_summary'),
  unit: text('unit'),
  image: text('image'),
  parentId: text('parentid'),
  showStudent: boolean('showstudent'),
  program: text('program'),
});

// Questions table in meraki schema
export const questions = pgTable('question', {
  id: text('id').primaryKey(),
  chuongTrinh: text('chuong_trinh'),
  questionLevel: text('questionlevel'),
  contentId: text('contentid'),
  questionType: text('question_type'),
  noiDung: text('noi_dung'),
  video: text('video'),
  picture: text('picture'),
  cauTraLoi1: text('cau_tra_loi_1'),
  cauTraLoi2: text('cau_tra_loi_2'),
  cauTraLoi3: text('cau_tra_loi_3'),
  cauTraLoi4: text('cau_tra_loi_4'),
  correctChoice: text('correct_choice'),
  time: text('time'),
  explanation: text('explanation'),
  tgTao: text('tg_tao'),
  answer: text('answer'),
});

// Game-Question Links table (many-to-many relationship)
export const gameQuestionLinks = pgTable('game_question_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  gameId: uuid('game_id').references(() => games.id, { onDelete: 'cascade' }).notNull(),
  questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  orderInGame: integer('order_in_game').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type Content = typeof content.$inferSelect;
export type NewContent = typeof content.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type GameQuestionLink = typeof gameQuestionLinks.$inferSelect;
export type NewGameQuestionLink = typeof gameQuestionLinks.$inferInsert;

// Legacy exports for backward compatibility
export const gameQuestions = questions; // Point to the central questions table
export type GameQuestion = Question;
export type NewGameQuestion = NewQuestion;
