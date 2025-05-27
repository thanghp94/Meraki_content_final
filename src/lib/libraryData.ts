
import type { Folder, GameStub } from '@/types/library';

export const mockFolders: Folder[] = [
  {
    id: 'folder-1',
    type: 'folder',
    name: 'Science Quizzes',
    coverImageUrl: 'https://placehold.co/600x400.png',
    itemCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiHint: 'science lab'
  },
  {
    id: 'folder-2',
    type: 'folder',
    name: 'History Archives',
    coverImageUrl: 'https://placehold.co/600x400.png',
    itemCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiHint: 'historical map'
  },
  {
    id: 'folder-3',
    type: 'folder',
    name: 'Math Challenges',
    // No cover image, will use default icon
    itemCount: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockGames: GameStub[] = [
  {
    id: 'game-1',
    type: 'game',
    name: 'Grapeseed - Unit 7',
    subtitle: 'UNIT 7',
    thumbnailUrl: 'https://placehold.co/600x400.png',
    questionCount: 24,
    playCount: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiHint: 'birthday cake celebration' // from image
  },
  {
    id: 'game-2',
    type: 'game',
    name: 'Grapeseed Unit 3',
    subtitle: 'UNIT 3',
    thumbnailUrl: 'https://placehold.co/600x400.png',
    questionCount: 15,
    playCount: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiHint: 'red flower' // from image
  },
  {
    id: 'game-3',
    type: 'game',
    name: 'Grapeseed Unit 8',
    subtitle: 'Question about unit 8',
    thumbnailUrl: 'https://placehold.co/600x400.png',
    questionCount: 20,
    playCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiHint: 'silver balloons' // from image
  },
  {
    id: 'game-4',
    type: 'game',
    name: 'Grapeseed Unit 4',
    subtitle: 'unit 4',
    thumbnailUrl: 'https://placehold.co/600x400.png',
    questionCount: 18,
    playCount: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiHint: 'butterfly nature' // from image
  },
   {
    id: 'game-5',
    type: 'game',
    name: 'Grapeseed Unit 13',
    subtitle: 'Unit 13',
    thumbnailUrl: 'https://placehold.co/600x400.png',
    questionCount: 22,
    playCount: 9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiHint: 'carousel park' // from image
  },
];
