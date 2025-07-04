import { PowerUpId, PowerUpInstance, PowerUpEffect } from './powerups';

export interface Question {
  id: string;
  topic?: string;
  randomOrder?: number;
  questionLevel?: number;
  contentId?: string;
  questionType: 'text' | 'multiple_choice' | 'one_choice';
  nbDung?: string;
  video?: string;
  picture?: string;
  cauTraLoi1?: string; // Answer choice 1
  cauTraLoi2?: string; // Answer choice 2
  cauTraLoi3?: string; // Answer choice 3
  cauTraLoi4?: string; // Answer choice 4
  correctChoice?: string; // A, B, C, or D for multiple choice
  writingChoice?: string;
  time?: number;
  explanation?: string;
  questionOrder?: number;
  translation?: string;
  update?: string;
  igLao?: string;
  answer?: string; // For text-based answers
  showAnswer?: boolean;
  studentSeen?: string;
  type: 'WSC' | 'TAHN' | 'Grapeseed'; // Question category type
  questionText: string;
  points: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'gif';
  mediaAlt?: string;
  createdAt?: string; // ISO date string, optional for new questions before saving
  updatedAt?: string; // ISO date string, optional for new questions before saving
  // Legacy support
  answerText?: string;
  media?: {
    url: string;
    type: 'image' | 'video' | 'gif'; 
    alt?: string; 
  };
}

export interface GameQuestionLink {
  id: string;
  gameId: string;
  questionId: string;
  orderInGame: number;
  createdAt?: string;
}

export interface Topic {
  id: string;
  name: string;
  questions: Question[];
}

export interface Team {
  id: string;
  name: string;
  score: number;
}

export interface Tile {
  id: number; // 0 to gridSize-1
  displayNumber: number; // 1 to gridSize
  type: 'question' | 'powerup';
  question?: Question;
  powerUpId?: PowerUpId;
  isRevealed: boolean;
  revealedByTeamId?: string | null; 
  answeredCorrectly?: boolean | null;
}

export interface GameSession {
  sessionId: string;
  topic: Topic;
  teams: Team[];
  gridSize: number;
  tiles: Tile[];
  currentTeamTurnIndex: number;
  status: 'setting_up' | 'in_progress' | 'finished';
  activeQuestion: Question | null;
  currentTileId: number | null;
  enabledPowerUps: PowerUpId[]; // List of power-ups enabled for this game
  powerUpProbability: number; // Probability of a tile being a power-up
}

export interface GameSetupConfig {
  topicId: string;
  numberOfTeams: number;
  teamNames: string[];
  gridSize: number;
  enabledPowerUps: PowerUpId[]; // Power-ups selected by teacher
  powerUpProbability: number; // Probability of tiles being power-ups
}
