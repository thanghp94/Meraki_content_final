export interface Question {
  id: string;
  questionText: string;
  answerText: string;
  points: number;
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
  question: Question;
  isRevealed: boolean;
  revealedByTeamId?: string | null; // ID of the team that revealed this tile
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
  // For modal control
  activeQuestion: Question | null;
  currentTileId: number | null; 
}

export interface GameSetupConfig {
  topicId: string;
  numberOfTeams: number;
  teamNames: string[];
  gridSize: number;
}
