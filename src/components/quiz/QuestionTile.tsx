
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
      variant="default" // Use default and override with custom classes
      className={cn(
        "aspect-[3/4] sm:aspect-square h-auto w-full text-3xl md:text-4xl lg:text-5xl font-bold flex flex-col items-center justify-center p-2 shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg",
        isRevealed 
          ? "opacity-70 cursor-not-allowed" 
          : "bg-tile-default text-tile-default-foreground hover:opacity-90 hover:scale-105",
        isRevealed && tile.answeredCorrectly === true && "bg-tile-revealed-correct text-green-700",
        isRevealed && tile.answeredCorrectly === false && "bg-tile-revealed-incorrect text-red-700",
        isRevealed && tile.answeredCorrectly === null && "bg-tile-revealed-muted text-muted-foreground",
      )}
      onClick={onClick}
      disabled={isRevealed}
      aria-label={isRevealed ? `Question ${displayNumber} (revealed)` : `Select question ${displayNumber}`}
    >
      {isRevealed ? (
        <>
         {tile.answeredCorrectly === true && <CheckSquare size={40} className="text-green-700" />}
         {tile.answeredCorrectly === false && <EyeOff size={40} className="text-red-700" />}
         {/* For tiles revealed but not yet adjudicated (e.g. game ended early), or if not tracked */}
         {tile.answeredCorrectly === null && <HelpCircle size={40} className="text-slate-500" />} 
         <span className="text-sm mt-1 text-muted-foreground">{question.points} pts</span>
        </>
      ) : (
        <>
          <span>{displayNumber}</span>
          {/* Points removed from unrevealed tile to match image */}
        </>
      )}
    </Button>
  );
}
