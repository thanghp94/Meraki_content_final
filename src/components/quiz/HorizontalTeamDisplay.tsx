
'use client';

import type { Team } from '@/types/quiz';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface HorizontalTeamDisplayProps {
  teams: Team[];
  currentTeamId?: string | null;
  onEndGame: () => void;
  // topicName: string; // Removed
}

export default function HorizontalTeamDisplay({ teams, currentTeamId, onEndGame }: HorizontalTeamDisplayProps) {
  return (
    <div className="bg-game-header text-game-header-foreground p-3 shadow-md w-full min-h-[120px] relative">
      <div className="container mx-auto flex items-center justify-center gap-4 h-full">
        {/* Teams Display - centered in the row */}
        <div className="flex items-center justify-center gap-4 flex-wrap flex-1">
          {teams.map((team) => (
            <div
              key={team.id}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-6 rounded-lg transition-all duration-300",
                team.id === currentTeamId 
                  ? "bg-current-team-highlight text-current-team-highlight-foreground shadow-lg scale-105" 
                  : "" // No special background for non-current teams
              )}
              style={{
                minWidth: 'min(150px, 25vw)'
              }}
            >
              <span 
                className={cn(
                  "font-bold whitespace-nowrap",
                  team.id === currentTeamId ? "text-current-team-highlight-foreground" : "text-game-header-foreground"
                )}
                style={{
                  fontSize: 'clamp(1.25rem, 3vmin, 2rem)'
                }}
              >
                {team.name}
              </span>
              <span 
                className={cn(
                  "font-extrabold",
                  team.id === currentTeamId ? "text-current-team-highlight-foreground" : "text-game-header-foreground"
                )}
                style={{
                  fontSize: 'clamp(2rem, 4vmin, 3rem)'
                }}
              >
                {team.score}
              </span>
            </div>
          ))}
        </div>

        {/* End Game Button - positioned absolutely in top right */}
        <div className="absolute top-3 right-3">
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
