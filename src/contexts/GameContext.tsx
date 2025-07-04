'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { GameSession, GameSetupConfig, Question, Team, Tile, Topic } from '@/types/quiz';
import type { PowerUpId } from '@/types/powerups';
import { TOPICS } from '@/lib/quizData';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { activatePowerUp as activatePowerUpService } from '@/lib/powerUpService';

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
  initializeGame: (config: GameSetupConfig, selectedTopic?: Topic) => string; // Returns sessionId
  revealTile: (tileId: number) => void;
  adjudicateAnswer: (isCorrect: boolean) => void;
  closeQuestionModal: () => void;
  endGame: () => void;
  activePowerUp: { powerUpId: PowerUpId; teamName: string } | null;
  closePowerUpModal: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameSession | null>(null);
  const [activePowerUp, setActivePowerUp] = useState<{ powerUpId: PowerUpId; teamName: string } | null>(null);

  const initializeGame = useCallback((config: GameSetupConfig, selectedTopic?: Topic): string => {
    const topic = selectedTopic || TOPICS.find(t => t.id === config.topicId);
    if (!topic) {
      throw new Error("Selected topic not found.");
    }

    if (topic.questions.length < config.gridSize) {
      alert(`Warning: The selected topic "${topic.name}" has fewer questions (${topic.questions.length}) than the selected grid size (${config.gridSize}). Some tiles may not have unique questions or the game may not function as expected.`);
    }
    
    const teams: Team[] = config.teamNames.map((name, index) => ({
      id: uuidv4(),
      name: name || `Team ${index + 1}`,
      score: 0,
    }));

    const availableQuestions = shuffleArray([...topic.questions]);
    
    // Determine which tiles will be power-ups
    const powerUpTileCount = Math.floor(config.gridSize * config.powerUpProbability);
    const powerUpTileIndices = shuffleArray(Array.from({ length: config.gridSize }, (_, i) => i))
      .slice(0, powerUpTileCount);
    
    const tiles: Tile[] = Array.from({ length: config.gridSize }, (_, index) => {
      const isPowerUpTile = powerUpTileIndices.includes(index);
      
      if (isPowerUpTile && config.enabledPowerUps.length > 0) {
        // Randomly select a power-up from enabled ones
        const randomPowerUp = config.enabledPowerUps[Math.floor(Math.random() * config.enabledPowerUps.length)];
        return {
          id: index,
          displayNumber: index + 1,
          type: 'powerup' as const,
          powerUpId: randomPowerUp,
          isRevealed: false,
        };
      } else {
        // Regular question tile
        const questionIndex = index - powerUpTileIndices.filter(i => i < index).length;
        const question = availableQuestions[questionIndex] || availableQuestions[0]; // Fallback
        return {
          id: index,
          displayNumber: index + 1,
          type: 'question' as const,
          question,
          isRevealed: false,
        };
      }
    });

    const sessionId = uuidv4();
    const newGame: GameSession = {
      sessionId,
      topic: topic,
      teams,
      gridSize: config.gridSize,
      tiles,
      currentTeamTurnIndex: 0,
      status: 'in_progress',
      activeQuestion: null,
      currentTileId: null,
      enabledPowerUps: config.enabledPowerUps,
      powerUpProbability: config.powerUpProbability,
    };
    setGameState(newGame);
    return sessionId;
  }, []);

  const revealTile = useCallback((tileId: number) => {
    setGameState(prev => {
      if (!prev || prev.status !== 'in_progress') return prev;
      const tile = prev.tiles.find(t => t.id === tileId);
      if (!tile || tile.isRevealed) return prev;

      // If it's a power-up tile, auto-apply the effect and show modal
      if (tile.type === 'powerup' && tile.powerUpId) {
        const currentTeam = prev.teams[prev.currentTeamTurnIndex];
        const effects = activatePowerUpService(tile.powerUpId, currentTeam.id, prev.teams);
        
        // Apply effects to teams
        const updatedTeams = prev.teams.map(team => {
          const teamEffects = effects.filter(effect => effect.sourceTeamId === team.id);
          let updatedTeam = { ...team };

          teamEffects.forEach(effect => {
            if (effect.type === 'points' && effect.points !== undefined) {
              updatedTeam.score = Math.max(0, updatedTeam.score + effect.points);
            }
          });

          return updatedTeam;
        });

        // Mark tile as revealed and move to next team
        const updatedTiles = prev.tiles.map(t => 
          t.id === tileId 
          ? { ...t, isRevealed: true, revealedByTeamId: currentTeam.id } 
          : t
        );

        const nextTeamTurnIndex = (prev.currentTeamTurnIndex + 1) % prev.teams.length;
        const allTilesRevealed = updatedTiles.every(t => t.isRevealed);
        const newStatus = allTilesRevealed ? 'finished' : 'in_progress';

        // Show power-up modal
        setActivePowerUp({ powerUpId: tile.powerUpId, teamName: currentTeam.name });

        return {
          ...prev,
          teams: updatedTeams,
          tiles: updatedTiles,
          currentTeamTurnIndex: nextTeamTurnIndex,
          status: newStatus,
        };
      } else {
        // Regular question tile - show question modal
        return {
          ...prev,
          activeQuestion: tile.question || null,
          currentTileId: tileId,
        };
      }
    });
  }, []);
  
  const closeQuestionModal = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        activeQuestion: null,
      };
    });
  }, []);

  const adjudicateAnswer = useCallback((isCorrect: boolean) => {
    setGameState(prev => {
      if (!prev || prev.status !== 'in_progress' || prev.currentTileId === null) return prev;

      const currentTeam = prev.teams[prev.currentTeamTurnIndex];
      const tile = prev.tiles.find(t => t.id === prev.currentTileId);

      if (!tile || tile.isRevealed || tile.type !== 'question') return prev;

      const updatedTiles = prev.tiles.map(t => 
        t.id === prev.currentTileId 
        ? { ...t, isRevealed: true, revealedByTeamId: currentTeam.id, answeredCorrectly: isCorrect } 
        : t
      );

      const updatedTeams = [...prev.teams];
      if (isCorrect && tile.question) {
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
        activeQuestion: null,
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

  const closePowerUpModal = useCallback(() => {
    setActivePowerUp(null);
  }, []);

  const contextValue = useMemo(() => ({
    gameState,
    initializeGame,
    revealTile,
    adjudicateAnswer,
    closeQuestionModal,
    endGame,
    activePowerUp,
    closePowerUpModal,
  }), [gameState, initializeGame, revealTile, adjudicateAnswer, closeQuestionModal, endGame, activePowerUp, closePowerUpModal]);

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
