import { pgTable, text, integer, timestamp, boolean, uuid, pgSchema } from 'drizzle-orm/pg-core';

// Define the meraki schema
export const merakiSchema = pgSchema('meraki');

// Games table (in public schema)
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

// Folders table (in public schema)
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
export const content = merakiSchema.table('content', {
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
export const topics = merakiSchema.table('topic', {
  id: text('id').primaryKey(),
  topic: text('topic'),
  shortSummary: text('short_summary'),
  unit: text('unit'),
  image: text('image'),
  parentid: text('parentid'),
  showstudent: boolean('showstudent'),
  program: text('program'),
});

// Questions table in meraki schema
export const questions = merakiSchema.table('question', {
  id: text('id').primaryKey(),
  chuongTrinh: text('chuong_trinh'),
  questionlevel: text('questionlevel'),
  contentid: text('contentid'),
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

// Vocabulary table in meraki schema
export const vocabulary = merakiSchema.table('vocabulary', {
  id: uuid('id').primaryKey(),
  word: text('word').notNull(),
  partOfSpeech: text('part_of_speech').notNull(),
  definition: text('definition').notNull(),
  exampleSentence: text('example_sentence'),
  phoneticTranscription: text('phonetic_transcription'),
  imageUrl: text('image_url'),
  videoUrl: text('video_url'),
  tags: text('tags').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Game-Question Links table (many-to-many relationship) - in public schema
export const gameQuestionLinks = pgTable('game_question_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  gameId: uuid('game_id').references(() => games.id, { onDelete: 'cascade' }).notNull(),
  questionId: text('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
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
export type Vocabulary = typeof vocabulary.$inferSelect;
export type NewVocabulary = typeof vocabulary.$inferInsert;
