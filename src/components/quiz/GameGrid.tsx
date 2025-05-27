
'use client';

import { useGame } from '@/contexts/GameContext';
import QuestionTile from './QuestionTile';

export default function GameGrid() {
  const { gameState, revealTile } = useGame();

  if (!gameState) {
    return <p>Loading game grid...</p>;
  }

  const { tiles, gridSize } = gameState;

  let gridColsClass = 'grid-cols-4'; // Default
  if (gridSize === 8) gridColsClass = 'grid-cols-2 sm:grid-cols-4'; 
  else if (gridSize === 15) gridColsClass = 'grid-cols-3 sm:grid-cols-5'; // For 5x3 layout
  else if (gridSize === 16) gridColsClass = 'grid-cols-4';
  else if (gridSize === 24) gridColsClass = 'grid-cols-4 sm:grid-cols-6';


  return (
    <div className={`grid ${gridColsClass} gap-2 sm:gap-3 md:gap-4 bg-grid-area rounded-lg shadow-inner h-full p-2 sm:p-4`}>
      {tiles.map(tile => (
        <QuestionTile
          key={tile.id}
          tile={tile}
          onClick={() => revealTile(tile.id)}
        />
      ))}
    </div>
  );
}
