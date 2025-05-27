
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import GameGrid from '@/components/quiz/GameGrid';
import QuestionModal from '@/components/quiz/QuestionModal';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Award, Info, Play } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import HorizontalTeamDisplay from '@/components/quiz/HorizontalTeamDisplay'; // New component

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const { gameState, endGame } = useGame();
  const sessionId = params.sessionId as string;

  useEffect(() => {
    if (!gameState || gameState.sessionId !== sessionId) {
      // console.warn("No active game session or session ID mismatch. Consider redirecting or loading state.");
    }
  }, [gameState, sessionId, router]);

  if (!gameState || gameState.sessionId !== sessionId) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
         <Alert variant="destructive" className="max-w-md text-center">
          <Info className="h-4 w-4" />
          <AlertTitle>Game Not Found</AlertTitle>
          <AlertDescription>
            The game session could not be found or has expired. Please start a new game.
          </AlertDescription>
        </Alert>
        <Link href="/setup" passHref>
          <Button variant="default" className="mt-4">
            <Play className="mr-2 h-4 w-4" /> Start a New Game
          </Button>
        </Link>
      </div>
    );
  }
  
  const { teams, currentTeamTurnIndex, status, topic } = gameState;
  const currentTeam = teams[currentTeamTurnIndex];

  if (status === 'finished') {
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    return (
      <div className="flex flex-col items-center justify-center py-10 h-full">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <Award size={64} className="mx-auto text-primary" />
            <CardTitle className="text-3xl font-bold mt-4">Game Over!</CardTitle>
            <CardDescription className="text-lg">Final Scores for "{topic.name}"</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedTeams.map((team, index) => (
              <div key={team.id} className={`p-4 rounded-lg flex justify-between items-center ${index === 0 ? 'bg-accent text-accent-foreground' : 'bg-secondary'}`}>
                <span className="font-semibold text-lg">{index + 1}. {team.name} {index === 0 ? '🏆' : ''}</span>
                <span className="font-bold text-xl">{team.score} points</span>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
             <Button onClick={() => router.push('/setup')} className="w-full">
              Play Again
            </Button>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              Back to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden">
      {/* Top Section: Horizontal Team Display */}
      <HorizontalTeamDisplay 
        teams={teams} 
        currentTeamId={currentTeam?.id} 
        onEndGame={endGame}
        topicName={topic.name}
      />
      
      {/* Middle Section: Game Grid (dominant) */}
      <div className="flex-grow flex items-center justify-center min-h-0 p-2 sm:p-4 bg-background"> {/* Grid container with padding */}
        <div className="w-full h-full max-w-5xl"> {/* Max width for the grid itself */}
          <GameGrid /> 
        </div>
      </div>

      {/* Question Modal */}
      <QuestionModal />
    </div>
  );
}
