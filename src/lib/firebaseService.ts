
'use server'; // Indication that these can be used in Server Components/Actions if needed, though primarily client-side for now

import type { Timestamp } from 'firebase/firestore';
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  doc,
  writeBatch,
  increment,
  Timestamp as FirestoreTimestamp, // Import Timestamp explicitly
} from 'firebase/firestore';
import type { Folder, GameStub, LibraryItem } from '@/types/library';
import type { Question } from '@/types/quiz';
import { db } from './firebase'; // Your existing Firebase app instance

// Firestore typically returns Timestamps, client-side often expects ISO strings or Date objects.
// These interfaces reflect what we expect after conversion for client use.

// --- GAMES ---
export async function addGameToFirestore(
  gameData: Omit<GameStub, 'id' | 'type' | 'createdAt' | 'updatedAt' | 'questionCount' | 'playCount'> & { imageUrl?: string; aiHint?: string }
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'games'), {
      ...gameData,
      name: gameData.name || 'Untitled Game',
      subtitle: gameData.subtitle || '',
      thumbnailUrl: gameData.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(gameData.name || 'Game')}`,
      aiHint: gameData.aiHint || gameData.name?.split(' ').slice(0,2).join(' ').toLowerCase() || 'game',
      questionCount: 0, // Initial value
      playCount: 0, // Initial value
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding game to Firestore: ', error);
    throw new Error('Failed to create game.');
  }
}

export async function getGamesFromFirestore(): Promise<GameStub[]> {
  try {
    const gamesCollection = collection(db, 'games');
    const q = query(gamesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: 'game' as const,
        name: data.name,
        subtitle: data.subtitle,
        thumbnailUrl: data.thumbnailUrl,
        questionCount: data.questionCount,
        playCount: data.playCount,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        aiHint: data.aiHint,
      } as GameStub;
    });
  } catch (error) {
    console.error('Error fetching games from Firestore: ', error);
    return [];
  }
}

// --- FOLDERS ---
export async function addFolderToFirestore(
  folderData: Omit<Folder, 'id' | 'type' | 'createdAt' | 'updatedAt' | 'itemCount'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'folders'), {
      ...folderData,
      name: folderData.name || 'Untitled Folder',
      itemCount: 0, // Initial value
      coverImageUrl: folderData.coverImageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(folderData.name || 'Folder')}`,
      aiHint: folderData.aiHint || folderData.name?.split(' ').slice(0,2).join(' ').toLowerCase() || 'folder',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding folder to Firestore: ', error);
    throw new Error('Failed to create folder.');
  }
}

export async function getFoldersFromFirestore(): Promise<Folder[]> {
  try {
    const foldersCollection = collection(db, 'folders');
    const q = query(foldersCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: 'folder' as const,
        name: data.name,
        coverImageUrl: data.coverImageUrl,
        itemCount: data.itemCount,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        aiHint: data.aiHint,
      } as Folder;
    });
  } catch (error) {
    console.error('Error fetching folders from Firestore: ', error);
    return [];
  }
}

// --- COMBINED ---
export async function getLibraryItemsFromFirestore(): Promise<LibraryItem[]> {
  try {
    const games = await getGamesFromFirestore();
    const folders = await getFoldersFromFirestore();
    
    const allItems = [...games, ...folders];
    allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return allItems;
  } catch (error) {
    console.error('Error fetching library items: ', error);
    return [];
  }
}

// --- QUESTIONS ---
export async function addQuestionToGameInFirestore(
  gameId: string,
  questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'> 
): Promise<string> {
  if (!gameId) {
    throw new Error('Game ID is required to add a question.');
  }
  try {
    const gameRef = doc(db, 'games', gameId);
    const questionsCollectionRef = collection(gameRef, 'questions');
    
    const batch = writeBatch(db);

    const newQuestionRef = doc(questionsCollectionRef); 
    batch.set(newQuestionRef, {
      ...questionData,
      createdAt: serverTimestamp(), 
      updatedAt: serverTimestamp(),
    });

    batch.update(gameRef, {
      questionCount: increment(1),
      updatedAt: serverTimestamp(), 
    });

    await batch.commit();
    return newQuestionRef.id; 
  } catch (error) {
    console.error('Error adding question to game in Firestore: ', error);
    throw new Error('Failed to add question to the game.');
  }
}

export async function getQuestionsForGameFromFirestore(gameId: string): Promise<Question[]> {
  if (!gameId) {
    console.warn('No gameId provided to getQuestionsForGameFromFirestore');
    return [];
  }
  try {
    const questionsCollectionRef = collection(db, 'games', gameId, 'questions');
    const q = query(questionsCollectionRef, orderBy('createdAt', 'asc')); // Order by creation time
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      // Ensure media object is correctly formed or undefined
      const media = data.media && data.media.url ? {
        url: data.media.url,
        type: data.media.type || 'image', // Default to image if type is missing
        alt: data.media.alt || '',
      } : undefined;

      return {
        id: docSnap.id,
        questionText: data.questionText,
        answerText: data.answerText,
        points: data.points,
        media: media,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      } as Question;
    });
  } catch (error) {
    console.error('Error fetching questions for game from Firestore: ', error);
    return [];
  }
}

export async function addMultipleQuestionsToGameInFirestore(
  gameId: string,
  questions: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<void> {
  if (!gameId) {
    throw new Error('Game ID is required to add questions.');
  }
  if (!questions || questions.length === 0) {
    return; // No questions to add
  }

  try {
    const gameRef = doc(db, 'games', gameId);
    const questionsCollectionRef = collection(gameRef, 'questions');
    const batch = writeBatch(db);

    questions.forEach(questionData => {
      const newQuestionRef = doc(questionsCollectionRef); // Create new doc ref for each question
      batch.set(newQuestionRef, {
        ...questionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    // Increment the questionCount on the parent game document by the number of new questions
    batch.update(gameRef, {
      questionCount: increment(questions.length),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (error) {
    console.error('Error adding multiple questions to game in Firestore: ', error);
    throw new Error('Failed to import questions.');
  }
}
