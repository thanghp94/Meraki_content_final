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
      variant={isRevealed ? "secondary" : "default"}
      className={cn(
        "aspect-square h-auto w-full text-2xl md:text-3xl font-bold flex flex-col items-center justify-center p-2 shadow-md hover:shadow-lg transition-all duration-200",
        isRevealed ? "opacity-50 cursor-not-allowed" : "hover:scale-105 hover:bg-primary/90",
        isRevealed && tile.answeredCorrectly === true && "bg-green-500/30 hover:bg-green-500/30",
        isRevealed && tile.answeredCorrectly === false && "bg-red-500/30 hover:bg-red-500/30",
      )}
      onClick={onClick}
      disabled={isRevealed}
      aria-label={isRevealed ? `Question ${displayNumber} (revealed)` : `Select question ${displayNumber}`}
    >
      {isRevealed ? (
        <>
         {tile.answeredCorrectly === true && <CheckSquare size={40} className="text-green-700" />}
         {tile.answeredCorrectly === false && <EyeOff size={40} className="text-red-700" />}
         {tile.answeredCorrectly === null && <HelpCircle size={40} className="text-muted-foreground" />}
         <span className="text-sm mt-1 text-muted-foreground">{question.points} pts</span>
        </>
      ) : (
        <>
          <span>{displayNumber}</span>
          <span className="text-sm mt-1 font-normal">{question.points} pts</span>
        </>
      )}
    </Button>
  );
}
