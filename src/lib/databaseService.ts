import { db } from './database';
import { games, folders, questions, gameQuestionLinks, content, type NewGame, type NewFolder, type NewQuestion, type NewContent } from './schema';
import { eq, sql, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type { Question, GameQuestionLink } from '@/types/quiz';

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
    const questionId = uuidv4();
    
    // Start a transaction to ensure both operations complete
    await db.transaction(async (tx) => {
      // Add the question to central questions table
      await tx.insert(questions).values({
        id: questionId,
        questionText: questionData.questionText,
        answer: questionData.answerText || questionData.answer,
        points: questionData.points,
        mediaUrl: questionData.media?.url || questionData.mediaUrl,
        mediaType: questionData.media?.type || questionData.mediaType,
        mediaAlt: questionData.media?.alt || questionData.mediaAlt,
        questionType: questionData.questionType || 'text',
        type: questionData.type || 'WSC',
        cauTraLoi1: questionData.cauTraLoi1,
        cauTraLoi2: questionData.cauTraLoi2,
        cauTraLoi3: questionData.cauTraLoi3,
        cauTraLoi4: questionData.cauTraLoi4,
        correctChoice: questionData.correctChoice,
      });

      // Link the question to the game
      await tx.insert(gameQuestionLinks).values({
        gameId,
        questionId,
        orderInGame: 0,
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

    return questionId;
  } catch (error) {
    console.error('Error adding question to game in database: ', error);
    throw new Error('Failed to add question to the game.');
  }
}

export async function getQuestionsForGameFromDatabase(gameId: string): Promise<Question[]> {
  if (!gameId) {
    console.warn('No gameId provided to getQuestionsForGameFromDatabase');
    return [];
  }
  try {
    // Get questions linked to this game through the game_question_links table
    const result = await db
      .select({
        question: questions,
        link: gameQuestionLinks
      })
      .from(gameQuestionLinks)
      .innerJoin(questions, eq(gameQuestionLinks.questionId, questions.id))
      .where(eq(gameQuestionLinks.gameId, gameId))
      .orderBy(gameQuestionLinks.orderInGame);

    return result.map(({ question: q }) => ({
      id: q.id,
      topic: q.topic || undefined,
      randomOrder: q.randomOrder || undefined,
      questionLevel: q.questionLevel || undefined,
      contentId: q.contentId || undefined,
      questionType: q.questionType as 'text' | 'multiple_choice' | 'one_choice',
      nbDung: q.nbDung || undefined,
      video: q.video || undefined,
      picture: q.picture || undefined,
      cauTraLoi1: q.cauTraLoi1 || undefined,
      cauTraLoi2: q.cauTraLoi2 || undefined,
      cauTraLoi3: q.cauTraLoi3 || undefined,
      cauTraLoi4: q.cauTraLoi4 || undefined,
      correctChoice: q.correctChoice || undefined,
      writingChoice: q.writingChoice || undefined,
      time: q.time || undefined,
      explanation: q.explanation || undefined,
      questionOrder: q.questionOrder || undefined,
      translation: q.translation || undefined,
      update: q.update || undefined,
      igLao: q.igLao || undefined,
      answer: q.answer || undefined,
      showAnswer: q.showAnswer || undefined,
      studentSeen: q.studentSeen || undefined,
      type: q.type as 'WSC' | 'TAHN' | 'Grapeseed',
      questionText: q.questionText,
      points: q.points,
      mediaUrl: q.mediaUrl || undefined,
      mediaType: q.mediaType as 'image' | 'video' | 'gif' | undefined,
      mediaAlt: q.mediaAlt || undefined,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
      // Legacy support
      answerText: q.answer || '',
      media: q.mediaUrl ? {
        url: q.mediaUrl,
        type: (q.mediaType as 'image' | 'video' | 'gif') || 'image',
        alt: q.mediaAlt || undefined
      } : undefined,
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
      // Add all questions to central questions table and create links
      for (let i = 0; i < questionsData.length; i++) {
        const question = questionsData[i];
        const questionId = uuidv4();
        
        // Add question to central questions table
        await tx.insert(questions).values({
          id: questionId,
          questionText: question.questionText,
          answer: question.answerText || question.answer,
          points: question.points,
          mediaUrl: question.media?.url || question.mediaUrl,
          mediaType: question.media?.type || question.mediaType,
          mediaAlt: question.media?.alt || question.mediaAlt,
          questionType: question.questionType || 'text',
          type: question.type || 'WSC',
          cauTraLoi1: question.cauTraLoi1,
          cauTraLoi2: question.cauTraLoi2,
          cauTraLoi3: question.cauTraLoi3,
          cauTraLoi4: question.cauTraLoi4,
          correctChoice: question.correctChoice,
        });

        // Link question to game
        await tx.insert(gameQuestionLinks).values({
          gameId,
          questionId,
          orderInGame: i,
        });
      }

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

// --- CENTRALIZED QUESTIONS ---
export async function getAllQuestionsFromDatabase(type?: 'WSC' | 'TAHN' | 'Grapeseed'): Promise<Question[]> {
  try {
    const whereClause = type ? eq(questions.type, type) : undefined;
    
    const result = await db
      .select()
      .from(questions)
      .where(whereClause)
      .orderBy(questions.createdAt);

    return result.map(q => ({
      id: q.id,
      topic: q.topic || undefined,
      randomOrder: q.randomOrder || undefined,
      questionLevel: q.questionLevel || undefined,
      contentId: q.contentId || undefined,
      questionType: q.questionType as 'text' | 'multiple_choice' | 'one_choice',
      nbDung: q.nbDung || undefined,
      video: q.video || undefined,
      picture: q.picture || undefined,
      cauTraLoi1: q.cauTraLoi1 || undefined,
      cauTraLoi2: q.cauTraLoi2 || undefined,
      cauTraLoi3: q.cauTraLoi3 || undefined,
      cauTraLoi4: q.cauTraLoi4 || undefined,
      correctChoice: q.correctChoice || undefined,
      writingChoice: q.writingChoice || undefined,
      time: q.time || undefined,
      explanation: q.explanation || undefined,
      questionOrder: q.questionOrder || undefined,
      translation: q.translation || undefined,
      update: q.update || undefined,
      igLao: q.igLao || undefined,
      answer: q.answer || undefined,
      showAnswer: q.showAnswer || undefined,
      studentSeen: q.studentSeen || undefined,
      type: q.type as 'WSC' | 'TAHN' | 'Grapeseed',
      questionText: q.questionText,
      points: q.points,
      mediaUrl: q.mediaUrl || undefined,
      mediaType: q.mediaType as 'image' | 'video' | 'gif' | undefined,
      mediaAlt: q.mediaAlt || undefined,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
      // Legacy support
      answerText: q.answer || '',
      media: q.mediaUrl ? {
        url: q.mediaUrl,
        type: (q.mediaType as 'image' | 'video' | 'gif') || 'image',
        alt: q.mediaAlt || undefined
      } : undefined,
    }));
  } catch (error) {
    console.error('Error fetching all questions from database:', error);
    throw new Error('Failed to fetch questions');
  }
}

export async function linkQuestionToGame(gameId: string, questionId: string, orderInGame: number = 0): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // Add the link
      await tx.insert(gameQuestionLinks).values({
        gameId,
        questionId,
        orderInGame
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
  } catch (error) {
    console.error('Error linking question to game:', error);
    throw new Error('Failed to link question to game');
  }
}

export async function unlinkQuestionFromGame(gameId: string, questionId: string): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // Remove the link
      await tx.delete(gameQuestionLinks)
        .where(and(
          eq(gameQuestionLinks.gameId, gameId),
          eq(gameQuestionLinks.questionId, questionId)
        ));

      // Update the game's question count
      await tx
        .update(games)
        .set({ 
          questionCount: sql`${games.questionCount} - 1`,
          updatedAt: new Date()
        })
        .where(eq(games.id, gameId));
    });
  } catch (error) {
    console.error('Error unlinking question from game:', error);
    throw new Error('Failed to unlink question from game');
  }
}

export async function addQuestionToCentralDatabase(
  questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const questionId = uuidv4();
    
    await db.insert(questions).values({
      id: questionId,
      questionText: questionData.questionText,
      answer: questionData.answerText || questionData.answer,
      points: questionData.points,
      mediaUrl: questionData.media?.url || questionData.mediaUrl,
      mediaType: questionData.media?.type || questionData.mediaType,
      mediaAlt: questionData.media?.alt || questionData.mediaAlt,
      questionType: questionData.questionType || 'text',
      type: questionData.type || 'WSC',
      cauTraLoi1: questionData.cauTraLoi1,
      cauTraLoi2: questionData.cauTraLoi2,
      cauTraLoi3: questionData.cauTraLoi3,
      cauTraLoi4: questionData.cauTraLoi4,
      correctChoice: questionData.correctChoice,
      topic: questionData.topic,
      questionLevel: questionData.questionLevel,
      contentId: questionData.contentId,
      nbDung: questionData.nbDung,
      video: questionData.video,
      picture: questionData.picture,
      writingChoice: questionData.writingChoice,
      time: questionData.time,
      explanation: questionData.explanation,
      questionOrder: questionData.questionOrder,
      translation: questionData.translation,
      update: questionData.update,
      igLao: questionData.igLao,
      showAnswer: questionData.showAnswer,
      studentSeen: questionData.studentSeen,
    });

    return questionId;
  } catch (error) {
    console.error('Error adding question to central database:', error);
    throw new Error('Failed to add question');
  }
}

// --- CONTENT ---
export interface ContentItem {
  id: string;
  name: string;
  description?: string;
  topic?: string;
  thumbnailUrl?: string;
  questionCount: number;
  questions?: any[];
  createdAt: string;
  updatedAt: string;
}

export async function getContentFromDatabase(): Promise<ContentItem[]> {
  try {
    // Get content items from meraki.content table
    const contentResult = await db.execute(sql`
      SELECT 
        id,
        "Title" as name,
        infor1 as description,
        '' as topic,
        image1 as thumbnail_url,
        COALESCE((
          SELECT COUNT(*) 
          FROM meraki.question 
          WHERE contentid = content.id::text
        ), 0) as question_count,
        COALESCE(date_created, NOW()) as created_at,
        NOW() as updated_at
      FROM meraki.content 
      ORDER BY date_created DESC NULLS LAST
    `);
    
    // For each content item, get its questions
    const contentWithQuestions = await Promise.all(
      contentResult.rows.map(async (c: any) => {
        const questionsResult = await db.execute(sql`
          SELECT 
            id,
            noi_dung as questionText,
            answer,
            10 as points,
            picture as mediaUrl,
            'image' as mediaType,
            '' as mediaAlt,
            cau_tra_loi_1,
            cau_tra_loi_2,
            cau_tra_loi_3,
            cau_tra_loi_4,
            correct_choice,
            explanation
          FROM meraki.question 
          WHERE contentid = ${c.id}
          ORDER BY tg_tao NULLS LAST
        `);
        
        const questions = questionsResult.rows.map((q: any) => ({
          id: q.id,
          questionText: q.questiontext || '',  // Use the aliased field name
          answer: q.answer || '',
          points: q.points || 10,
          media: q.mediaurl ? {
            url: q.mediaurl,
            type: q.mediatype || 'image',
            alt: q.mediaalt
          } : undefined,
          // Add multiple choice fields
          cauTraLoi1: q.cau_tra_loi_1,
          cauTraLoi2: q.cau_tra_loi_2,
          cauTraLoi3: q.cau_tra_loi_3,
          cauTraLoi4: q.cau_tra_loi_4,
          correctChoice: q.correct_choice,
          explanation: q.explanation
        }));
        
        return {
          id: c.id,
          name: c.name || 'Untitled Content',
          description: c.description || undefined,
          topic: c.topic || undefined,
          thumbnailUrl: c.thumbnail_url || undefined,
          questionCount: parseInt(c.question_count) || 0,
          questions,
          createdAt: new Date(c.created_at).toISOString(),
          updatedAt: new Date(c.updated_at).toISOString(),
        };
      })
    );
    
    return contentWithQuestions;
  } catch (error: unknown) {
    console.error('Error fetching content from database:', error);
    return [];
  }
}

export async function addContentToDatabase(
  contentData: Omit<NewContent, 'createdAt' | 'updatedAt' | 'questionCount'>
): Promise<string> {
  try {
    await db.insert(content).values({
      ...contentData,
      name: contentData.name || 'Untitled Content',
      description: contentData.description || '',
      thumbnailUrl: contentData.thumbnailUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(contentData.name || 'Content')}`,
      questionCount: 0,
    });
    return contentData.id;
  } catch (error) {
    console.error('Error adding content to database:', error);
    throw new Error('Failed to create content');
  }
}

export async function updateContentQuestionCount(contentId: string, increment: boolean = true): Promise<void> {
  try {
    if (increment) {
      await db
        .update(content)
        .set({ 
          questionCount: sql`${content.questionCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(content.id, contentId));
    } else {
      await db
        .update(content)
        .set({ 
          questionCount: sql`${content.questionCount} - 1`,
          updatedAt: new Date()
        })
        .where(eq(content.id, contentId));
    }
  } catch (error) {
    console.error('Error updating content question count:', error);
    throw new Error('Failed to update content question count');
  }
}

export async function getQuestionsForContent(contentId: string): Promise<Question[]> {
  try {
    const result = await db.execute<{
      id: string;
      noiDung: string;
      chuongTrinh: string;
      questionLevel: string;
      contentId: string;
      questionType: string;
      video: string | null;
      picture: string | null;
      cauTraLoi1: string | null;
      cauTraLoi2: string | null;
      cauTraLoi3: string | null;
      cauTraLoi4: string | null;
      correctChoice: string | null;
      time: string | null;
      explanation: string | null;
      tgTao: string;
    }>(sql`
      SELECT 
        id,
        noi_dung as "noiDung",
        chuong_trinh as "chuongTrinh",
        questionlevel as "questionLevel",
        contentid as "contentId",
        question_type as "questionType",
        video,
        picture,
        cau_tra_loi_1 as "cauTraLoi1",
        cau_tra_loi_2 as "cauTraLoi2",
        cau_tra_loi_3 as "cauTraLoi3",
        cau_tra_loi_4 as "cauTraLoi4",
        correct_choice as "correctChoice",
        time,
        explanation,
        tg_tao as "tgTao"
      FROM question 
      WHERE contentid = ${contentId}
      ORDER BY tg_tao ASC
    `);

    return result.rows.map(q => ({
      id: q.id,
      questionText: q.noiDung,
      questionType: (q.questionType || 'multiple_choice') as 'text' | 'multiple_choice' | 'one_choice',
      contentId: q.contentId,
      type: 'WSC' as const,
      points: 10,
      cauTraLoi1: q.cauTraLoi1 || undefined,
      cauTraLoi2: q.cauTraLoi2 || undefined,
      cauTraLoi3: q.cauTraLoi3 || undefined,
      cauTraLoi4: q.cauTraLoi4 || undefined,
      correctChoice: q.correctChoice || undefined,
      time: q.time || undefined,
      explanation: q.explanation || undefined,
      createdAt: new Date(q.tgTao).toISOString(),
      updatedAt: new Date(q.tgTao).toISOString()
    }));
  } catch (error) {
    console.error('Error fetching questions for content:', error);
    throw error;
  }
}

export async function getContentByIdFromDatabase(contentId: string): Promise<ContentItem | null> {
  try {
    const result = await db
      .select()
      .from(content)
      .where(eq(content.id, contentId));

    if (result.length === 0) {
      return null;
    }

    const contentItem = result[0];
    return {
      id: contentItem.id,
      name: contentItem.name,
      description: contentItem.description || undefined,
      topic: contentItem.topic || undefined,
      thumbnailUrl: contentItem.thumbnailUrl || undefined,
      questionCount: contentItem.questionCount,
      createdAt: contentItem.createdAt.toISOString(),
      updatedAt: contentItem.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Error fetching content by ID from database:', error);
    return null;
  }
}
