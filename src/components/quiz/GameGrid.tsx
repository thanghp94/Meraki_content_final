'use client';

import { useGame } from '@/contexts/GameContext';
import QuestionTile from './QuestionTile';

export default function GameGrid() {
  const { gameState, revealTile } = useGame();

  if (!gameState) {
    return <p>Loading game grid...</p>;
  }

  const { tiles, gridSize } = gameState;

  // Calculate grid layout based on grid size
  let gridColsClass = 'grid-cols-2';
  let gridRowsClass = 'grid-rows-2';
  
  if (gridSize === 4) {
    gridColsClass = 'grid-cols-2';
    gridRowsClass = 'grid-rows-2';
  } else if (gridSize === 6) {
    gridColsClass = 'grid-cols-3';
    gridRowsClass = 'grid-rows-2';
  } else if (gridSize === 8) {
    gridColsClass = 'grid-cols-4';
    gridRowsClass = 'grid-rows-2';
  } else if (gridSize === 15) {
    gridColsClass = 'grid-cols-5';
    gridRowsClass = 'grid-rows-3';
  } else if (gridSize === 16) {
    gridColsClass = 'grid-cols-4';
    gridRowsClass = 'grid-rows-4';
  } else if (gridSize === 24) {
    gridColsClass = 'grid-cols-6';
    gridRowsClass = 'grid-rows-4';
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col">
      <div 
        className={`grid gap-2 sm:gap-3 md:gap-4 w-full flex-1 ${gridColsClass} ${gridRowsClass}`}
      >
        {tiles.map(tile => (
          <QuestionTile
            key={tile.id}
            tile={tile}
            onClick={() => revealTile(tile.id)}
          />
        ))}
      </div>
    </div>
  );
}
