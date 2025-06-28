import { db } from './database';
import { games, folders, gameQuestions, type NewGame, type NewFolder, type NewGameQuestion } from './schema';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type { Question } from '@/types/quiz';

// --- GAMES ---
export async function addGameToDatabase(
  gameData: Omit<NewGame, 'id' | 'createdAt' | 'updatedAt' | 'questionCount' | 'playCount'>
): Promise<string> {
  try {
    const id = uuidv4();
    await db.insert(games).values({
      id,
      ...gameData,
      name: gameData.name || 'Untitled Game',
      subtitle: gameData.subtitle || '',
      thumbnailUrl: gameData.thumbnailUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(gameData.name || 'Game')}`,
      aiHint: gameData.aiHint || gameData.name?.split(' ').slice(0,2).join(' ').toLowerCase() || 'game',
      questionCount: 0,
      playCount: 0,
    });
    return id;
  } catch (error) {
    console.error('Error adding game to database: ', error);
    throw new Error('Failed to create game.');
  }
}

export async function getGamesFromDatabase() {
  try {
    const result = await db.select().from(games).orderBy(games.createdAt);
    return result.map(game => ({
      ...game,
      type: 'game' as const,
      subtitle: game.subtitle || undefined,
      thumbnailUrl: game.thumbnailUrl || undefined,
      aiHint: game.aiHint || undefined,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching games from database: ', error);
    return [];
  }
}

// --- FOLDERS ---
export async function addFolderToDatabase(
  folderData: Omit<NewFolder, 'id' | 'createdAt' | 'updatedAt' | 'itemCount'>
): Promise<string> {
  try {
    const id = uuidv4();
    await db.insert(folders).values({
      id,
      ...folderData,
      name: folderData.name || 'Untitled Folder',
      coverImageUrl: folderData.coverImageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(folderData.name || 'Folder')}`,
      aiHint: folderData.aiHint || folderData.name?.split(' ').slice(0,2).join(' ').toLowerCase() || 'folder',
      itemCount: 0,
    });
    return id;
  } catch (error) {
    console.error('Error adding folder to database: ', error);
    throw new Error('Failed to create folder.');
  }
}

export async function getFoldersFromDatabase() {
  try {
    const result = await db.select().from(folders).orderBy(folders.createdAt);
    return result.map(folder => ({
      ...folder,
      type: 'folder' as const,
      coverImageUrl: folder.coverImageUrl || undefined,
      aiHint: folder.aiHint || undefined,
      createdAt: folder.createdAt.toISOString(),
      updatedAt: folder.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching folders from database: ', error);
    return [];
  }
}

// --- COMBINED ---
export async function getLibraryItemsFromDatabase() {
  try {
    const [gamesResult, foldersResult] = await Promise.all([
      getGamesFromDatabase(),
      getFoldersFromDatabase(),
    ]);
    
    const allItems = [...gamesResult, ...foldersResult];
    allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return allItems;
  } catch (error) {
    console.error('Error fetching library items: ', error);
    return [];
  }
}

// --- QUESTIONS ---
export async function addQuestionToGameInDatabase(
  gameId: string,
  questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  if (!gameId) {
    throw new Error('Game ID is required to add a question.');
  }
  try {
    const id = uuidv4();
    
    // Start a transaction to ensure both operations complete
    await db.transaction(async (tx) => {
      // Add the question
      await tx.insert(gameQuestions).values({
        id,
        gameId,
        questionText: questionData.questionText,
        answerText: questionData.answerText,
        points: questionData.points,
        mediaUrl: questionData.media?.url,
        mediaType: questionData.media?.type,
        mediaAlt: questionData.media?.alt,
      });

      // Update the game's question count
      await tx
        .update(games)
        .set({ 
          questionCount: sql`${games.questionCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(games.id, gameId));
    });

    return id;
  } catch (error) {
    console.error('Error adding question to game in database: ', error);
    throw new Error('Failed to add question to the game.');
  }
}

export async function getQuestionsForGameFromDatabase(gameId: string) {
  if (!gameId) {
    console.warn('No gameId provided to getQuestionsForGameFromDatabase');
    return [];
  }
  try {
    const result = await db
      .select()

    return result.map(question => ({
      id: question.id,
      questionText: question.questionText,
      answerText: question.answerText,
      points: question.points,
      media: question.mediaUrl ? {
        url: question.mediaUrl,
        type: (question.mediaType as 'image' | 'video' | 'gif') || 'image',
        alt: question.mediaAlt || '',
      } : undefined,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching questions for game from database: ', error);
    return [];
  }
}

export async function addMultipleQuestionsToGameInDatabase(
  gameId: string,
  questionsData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<void> {
  if (!gameId) {
    throw new Error('Game ID is required to add questions.');
  }
  if (!questionsData || questionsData.length === 0) {
    return;
  }

  try {
    await db.transaction(async (tx) => {
      // Add all questions
      const questionValues = questionsData.map(question => ({
        id: uuidv4(),
        gameId,
        questionText: question.questionText,
        answerText: question.answerText,
        points: question.points,
        mediaUrl: question.media?.url,
        mediaType: question.media?.type,
        mediaAlt: question.media?.alt,
      }));
      
      await tx.insert(questions).values(questionValues);

      // Update the game's question count
      await tx
        .update(games)
        .set({ 
          questionCount: sql`${games.questionCount} + ${questionsData.length}`,
          updatedAt: new Date()
        })
        .where(eq(games.id, gameId));
    });
  } catch (error) {
    console.error('Error adding multiple questions to game in database: ', error);
    throw new Error('Failed to import questions.');
  }
}
