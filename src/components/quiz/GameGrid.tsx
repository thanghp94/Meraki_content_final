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
  if (gridSize === 24) gridColsClass = 'grid-cols-6'; // For 24 tiles (4x6 or 6x4)
  else if (gridSize === 8) gridColsClass = 'grid-cols-4'; // For 8 tiles (2x4 or 4x2)
  else if (gridSize === 16) gridColsClass = 'grid-cols-4'; // For 16 tiles (4x4)
  
  // Could be more sophisticated, e.g. 2x4 for 8, 4x4 for 16, 4x6 for 24.
  // Tailwind JIT needs full class names.
  if (gridSize === 8) gridColsClass = 'sm:grid-cols-4 grid-cols-2'; 
  if (gridSize === 16) gridColsClass = 'sm:grid-cols-4 grid-cols-4';
  if (gridSize === 24) gridColsClass = 'sm:grid-cols-6 grid-cols-4';


  return (
    <div className={`grid ${gridColsClass} gap-3 md:gap-4 p-1 bg-secondary/50 rounded-lg shadow-inner`}>
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
