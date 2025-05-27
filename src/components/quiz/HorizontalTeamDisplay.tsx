
'use client';

import type { Team } from '@/types/quiz';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface HorizontalTeamDisplayProps {
  teams: Team[];
  currentTeamId?: string | null;
  onEndGame: () => void;
  topicName: string;
}

export default function HorizontalTeamDisplay({ teams, currentTeamId, onEndGame, topicName }: HorizontalTeamDisplayProps) {
  return (
    <div className="bg-game-header text-game-header-foreground p-3 shadow-md w-full">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
          {teams.map((team) => (
            <div
              key={team.id}
              className={cn(
                "flex flex-col items-center p-2 sm:p-3 rounded-lg transition-all duration-300 min-w-[80px] sm:min-w-[100px]",
                team.id === currentTeamId 
                  ? "bg-current-team-highlight text-current-team-highlight-foreground shadow-lg scale-105" 
                  : "bg-game-header/80" 
              )}
            >
              <span className="text-sm sm:text-base font-semibold truncate max-w-[100px] sm:max-w-[150px]">{team.name}</span>
              <span className="text-lg sm:text-xl font-bold">{team.score}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm font-medium hidden md:block truncate max-w-[150px] opacity-75" title={topicName}>{topicName}</span>
            <Button
                variant="ghost"
                size="icon"
                onClick={onEndGame}
                className="hover:bg-red-500/20 text-game-header-foreground hover:text-destructive-foreground"
                title="End Game Early"
            >
                <LogOut className="h-5 w-5" />
            </Button>
        </div>
      </div>
    </div>
  );
}
