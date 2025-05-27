
'use client';

import { useGame } from '@/contexts/GameContext';
import QuestionTile from './QuestionTile';

export default function GameGrid() {
  const { gameState, revealTile } = useGame();

  if (!gameState) {
    return <p>Loading game grid...</p>;
  }

  const { tiles, gridSize } = gameState;

  // Determine columns based on grid size for a somewhat balanced layout
  let gridColsClass = 'grid-cols-4'; // Default for 8 or 16
  if (gridSize === 24) gridColsClass = 'grid-cols-6';
  else if (gridSize === 8) gridColsClass = 'grid-cols-4'; 
  else if (gridSize === 16) gridColsClass = 'grid-cols-4';
  
  // Responsive adjustments for smaller screens
  if (gridSize === 8) gridColsClass = 'grid-cols-2 sm:grid-cols-4'; 
  if (gridSize === 16) gridColsClass = 'grid-cols-4'; // Stays 4x4
  if (gridSize === 24) gridColsClass = 'grid-cols-4 sm:grid-cols-6';


  return (
    <div className={`grid ${gridColsClass} gap-3 md:gap-4 bg-secondary/50 rounded-lg shadow-inner h-full`}>
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
