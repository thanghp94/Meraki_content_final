
'use client';

import type { Tile } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { CheckSquare, EyeOff, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionTileProps {
  tile: Tile;
  onClick: () => void;
}

export default function QuestionTile({ tile, onClick }: QuestionTileProps) {
  const { displayNumber, isRevealed, question } = tile;

  return (
    <Button
      variant="default" 
      className={cn(
        "aspect-[3/4] sm:aspect-square h-auto w-full text-3xl md:text-4xl lg:text-5xl font-bold flex flex-col items-center justify-center p-2 shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg",
        // Base styles for unrevealed tiles
        !isRevealed && "bg-tile-default text-tile-default-foreground hover:opacity-90 hover:scale-105",
        // Styles for revealed tiles
        isRevealed && "opacity-80 cursor-not-allowed", // General revealed style
        isRevealed && tile.answeredCorrectly === true && "bg-tile-revealed-correct text-green-800 dark:text-green-300",
        isRevealed && tile.answeredCorrectly === false && "bg-tile-revealed-incorrect text-red-800 dark:text-red-300",
        isRevealed && tile.answeredCorrectly === null && "bg-tile-revealed-muted text-gray-600 dark:text-gray-400",
      )}
      onClick={onClick}
      disabled={isRevealed}
      aria-label={isRevealed ? `Question ${displayNumber} (revealed, ${tile.answeredCorrectly === true ? 'correct' : tile.answeredCorrectly === false ? 'incorrect' : 'unanswered'}) - ${question.points} points` : `Select question ${displayNumber}`}
    >
      {isRevealed ? (
        <>
         {tile.answeredCorrectly === true && <CheckSquare size={40} className="text-inherit" />}
         {tile.answeredCorrectly === false && <EyeOff size={40} className="text-inherit" />}
         {tile.answeredCorrectly === null && <HelpCircle size={40} className="text-inherit" />} 
         <span className="text-sm mt-1 font-normal text-muted-foreground">{question.points} pts</span>
        </>
      ) : (
        <>
          <span className="drop-shadow-sm">{displayNumber}</span>
          {/* Points removed from unrevealed tile to match image */}
        </>
      )}
    </Button>
  );
}
