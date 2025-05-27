
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
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* Teams Display - takes up most of the space */}
        <div className="flex items-center space-x-3 sm:space-x-4 overflow-x-auto flex-grow">
          {teams.map((team) => (
            <div
              key={team.id}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 min-w-[90px] sm:min-w-[110px]",
                team.id === currentTeamId 
                  ? "bg-current-team-highlight text-current-team-highlight-foreground shadow-lg scale-105" 
                  : "" // No special background for non-current teams
              )}
            >
              <span className={cn(
                "text-base sm:text-lg font-bold truncate max-w-[100px] sm:max-w-[150px]",
                team.id === currentTeamId ? "text-current-team-highlight-foreground" : "text-game-header-foreground"
              )}>{team.name}</span>
              <span className={cn(
                "text-xl sm:text-2xl font-extrabold",
                 team.id === currentTeamId ? "text-current-team-highlight-foreground" : "text-game-header-foreground"
              )}>{team.score}</span>
            </div>
          ))}
        </div>

        {/* Topic Name and End Game Button - on the right, takes less space */}
        <div className="flex items-center space-x-2 flex-shrink-0">
            <span 
              className="text-xs sm:text-sm font-medium hidden md:block truncate max-w-[150px] lg:max-w-[250px] opacity-75" 
              title={topicName}
            >
              {topicName}
            </span>
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
