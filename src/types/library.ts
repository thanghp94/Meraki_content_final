
export interface Folder {
  type: 'folder';
  id: string;
  name: string;
  coverImageUrl?: string;
  itemCount: number; // Number of games or sub-folders
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  aiHint?: string; // for placeholder images
}

export interface GameStub { // A simplified representation of a game for the library
  type: 'game';
  id: string; // Could be the Topic ID if one game per topic, or a unique game instance ID
  name: string;
  subtitle?: string; // e.g., "UNIT 7"
  thumbnailUrl?: string;
  questionCount?: number;
  playCount?: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  aiHint?: string; // for placeholder images
}

export type LibraryItem = Folder | GameStub;
