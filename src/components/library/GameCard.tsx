'use client';

import type { GameStub } from '@/types/library';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Eye, ListChecks, MoreHorizontal, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GameCardProps {
  game: GameStub;
}

export default function GameCard({ game }: GameCardProps) {
  const router = useRouter();
  const thumbnail = game.thumbnailUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(game.name)}`;
  const hint = game.aiHint || game.name.split(' ').slice(0,2).join(' ').toLowerCase() || "game illustration";
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/setup?gameId=${game.id}`);
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col cursor-pointer" onClick={handlePlayClick}>
      <CardHeader className="p-0 relative aspect-video bg-muted">
        <Image
          src={thumbnail}
          alt={`Thumbnail for ${game.name}`}
          fill
          className="object-cover"
          data-ai-hint={hint}
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
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/edit-game/${game.id}`);
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Edit game</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-primary"
            onClick={handlePlayClick}
          >
            <Play className="h-4 w-4" />
            <span className="sr-only">Play game</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
