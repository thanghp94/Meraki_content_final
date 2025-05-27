'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { GameSession, GameSetupConfig, Question, Team, Tile, Topic } from '@/types/quiz';
import { TOPICS } from '@/lib/quizData';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// Helper to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}


interface GameContextType {
  gameState: GameSession | null;
  initializeGame: (config: GameSetupConfig) => string; // Returns sessionId
  revealTile: (tileId: number) => void;
  adjudicateAnswer: (isCorrect: boolean) => void;
  closeQuestionModal: () => void;
  endGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameSession | null>(null);

  const initializeGame = useCallback((config: GameSetupConfig): string => {
    const selectedTopic = TOPICS.find(t => t.id === config.topicId);
    if (!selectedTopic) {
      throw new Error("Selected topic not found.");
    }

    if (selectedTopic.questions.length < config.gridSize) {
      // This case should ideally be prevented by disabling grid sizes in UI
      // if not enough questions are available for the selected topic.
      alert(`Warning: The selected topic "${selectedTopic.name}" has fewer questions (${selectedTopic.questions.length}) than the selected grid size (${config.gridSize}). Some tiles may not have unique questions or the game may not function as expected.`);
    }
    
    const teams: Team[] = config.teamNames.map((name, index) => ({
      id: uuidv4(),
      name: name || `Team ${index + 1}`,
      score: 0,
    }));

    const availableQuestions = shuffleArray([...selectedTopic.questions]);
    const gameQuestions = availableQuestions.slice(0, config.gridSize);
    
    const tiles: Tile[] = Array.from({ length: config.gridSize }, (_, i) => ({
      id: i,
      displayNumber: i + 1,
      question: gameQuestions[i % gameQuestions.length], // Use modulo to repeat questions if fewer than grid size
      isRevealed: false,
    }));

    const sessionId = uuidv4();
    const newGame: GameSession = {
      sessionId,
      topic: selectedTopic,
      teams,
      gridSize: config.gridSize,
      tiles,
      currentTeamTurnIndex: 0,
      status: 'in_progress',
      activeQuestion: null,
      currentTileId: null,
    };
    setGameState(newGame);
    return sessionId;
  }, []);

  const revealTile = useCallback((tileId: number) => {
    setGameState(prev => {
      if (!prev || prev.status !== 'in_progress') return prev;
      const tile = prev.tiles.find(t => t.id === tileId);
      if (!tile || tile.isRevealed) return prev;

      return {
        ...prev,
        activeQuestion: tile.question,
        currentTileId: tileId,
      };
    });
  }, []);
  
  const closeQuestionModal = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        activeQuestion: null,
        // currentTileId is kept to mark the tile after adjudication
      };
    });
  }, []);

  const adjudicateAnswer = useCallback((isCorrect: boolean) => {
    setGameState(prev => {
      if (!prev || prev.status !== 'in_progress' || prev.currentTileId === null) return prev;

      const currentTeam = prev.teams[prev.currentTeamTurnIndex];
      const tile = prev.tiles.find(t => t.id === prev.currentTileId);

      if (!tile || tile.isRevealed) return prev; // Should not happen if logic is correct

      const updatedTiles = prev.tiles.map(t => 
        t.id === prev.currentTileId 
        ? { ...t, isRevealed: true, revealedByTeamId: currentTeam.id, answeredCorrectly: isCorrect } 
        : t
      );

      const updatedTeams = [...prev.teams];
      if (isCorrect) {
        updatedTeams[prev.currentTeamTurnIndex] = {
          ...currentTeam,
          score: currentTeam.score + tile.question.points,
        };
      }
      
      const nextTeamTurnIndex = (prev.currentTeamTurnIndex + 1) % prev.teams.length;
      
      const allTilesRevealed = updatedTiles.every(t => t.isRevealed);
      const newStatus = allTilesRevealed ? 'finished' : 'in_progress';

      return {
        ...prev,
        teams: updatedTeams,
        tiles: updatedTiles,
        currentTeamTurnIndex: nextTeamTurnIndex,
        activeQuestion: null, // Close modal after adjudication
        currentTileId: null,
        status: newStatus,
      };
    });
  }, []);

  const endGame = useCallback(() => {
    setGameState(prev => {
      if (!prev) return null;
      return { ...prev, status: 'finished' };
    });
  }, []);

  const contextValue = useMemo(() => ({
    gameState,
    initializeGame,
    revealTile,
    adjudicateAnswer,
    closeQuestionModal,
    endGame,
  }), [gameState, initializeGame, revealTile, adjudicateAnswer, closeQuestionModal, endGame]);


  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
