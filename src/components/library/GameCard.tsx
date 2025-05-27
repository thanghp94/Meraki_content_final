
'use client';

import type { GameStub } from '@/types/library';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Eye, ListChecks, MoreHorizontal } from 'lucide-react';


interface GameCardProps {
  game: GameStub;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0 relative aspect-video bg-muted">
        <Image
          src={game.thumbnailUrl || 'https://placehold.co/600x400.png'}
          alt={`Thumbnail for ${game.name}`}
          layout="fill"
          objectFit="cover"
          data-ai-hint={game.aiHint || "game illustration"}
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold truncate">{game.name}</CardTitle>
        {game.subtitle && <p className="text-sm text-muted-foreground truncate">{game.subtitle}</p>}
      </CardContent>
       <CardFooter className="p-3 border-t flex justify-between items-center">
        <div className="text-xs text-muted-foreground flex items-center gap-2">
            {typeof game.questionCount === 'number' && (
                <span className="flex items-center" title={`${game.questionCount} questions`}>
                    <ListChecks className="inline h-3.5 w-3.5 mr-1" /> {game.questionCount}
                </span>
            )}
            {typeof game.playCount === 'number' && (
                 <span className="flex items-center" title={`${game.playCount} plays`}>
                    <Eye className="inline h-3.5 w-3.5 mr-1" /> {game.playCount}
                </span>
            )}
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More options</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
