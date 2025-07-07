export interface SavedGameConfig {
  id: string;
  name: string;
  timestamp: number;
  config: {
    selectedTopics: string[];
    teamNames: string[];
    gridSize: number;
    questionCount: number;
    gameMode?: string;
  };
}

import { authService } from './authService';

const getStorageKey = (): string => {
  return authService.getUserStorageKey('saved_quiz_games');
};

export const gameSaveService = {
  // Save a game configuration
  saveGame: (name: string, config: SavedGameConfig['config']): string => {
    const savedGame: SavedGameConfig = {
      id: crypto.randomUUID(),
      name,
      timestamp: Date.now(),
      config
    };

    const existingGames = gameSaveService.getSavedGames();
    const updatedGames = [...existingGames, savedGame];
    
    localStorage.setItem(getStorageKey(), JSON.stringify(updatedGames));
    return savedGame.id;
  },

  // Get all saved games
  getSavedGames: (): SavedGameConfig[] => {
    try {
      const saved = localStorage.getItem(getStorageKey());
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  // Load a specific game
  loadGame: (id: string): SavedGameConfig | null => {
    const games = gameSaveService.getSavedGames();
    return games.find(game => game.id === id) || null;
  },

  // Delete a saved game
  deleteGame: (id: string): void => {
    const games = gameSaveService.getSavedGames();
    const filtered = games.filter(game => game.id !== id);
    localStorage.setItem(getStorageKey(), JSON.stringify(filtered));
  },

  // Clear all saved games
  clearAllGames: (): void => {
    localStorage.removeItem(getStorageKey());
  }
};
