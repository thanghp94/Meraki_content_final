'use client';

import type { Team } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScoreboardProps {
  teams: Team[];
  currentTeamId?: string | null;
}

export default function Scoreboard({ teams, currentTeamId }: ScoreboardProps) {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Scoreboard</CardTitle>
        <Users className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {sortedTeams.length > 0 ? (
          <ul className="space-y-3">
            {sortedTeams.map((team, index) => (
              <li
                key={team.id}
                className={cn(
                  "flex justify-between items-center p-3 rounded-md transition-all duration-300",
                  team.id === currentTeamId ? "bg-accent text-accent-foreground shadow-md scale-105" : "bg-secondary",
                  index === 0 && teams.length > 1 && team.id !== currentTeamId ? "border-2 border-yellow-400" : ""
                )}
              >
                <div className="flex items-center">
                  {index === 0 && teams.length > 1 && <Trophy className="h-5 w-5 mr-2 text-yellow-500" />}
                  <span className="font-medium text-lg">{team.name}</span>
                </div>
                <span className="font-bold text-lg">{team.score} pts</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No teams configured yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
