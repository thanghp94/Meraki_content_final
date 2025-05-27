'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import Scoreboard from '@/components/quiz/Scoreboard';
import GameGrid from '@/components/quiz/GameGrid';
import QuestionModal from '@/components/quiz/QuestionModal';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Award, CheckCircle, Info, Play } from 'lucide-react';
import Link from 'next/link';

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const { gameState, endGame } = useGame();
  const sessionId = params.sessionId as string;

  useEffect(() => {
    if (!gameState || gameState.sessionId !== sessionId) {
      // If there's no game state or session ID mismatch, redirect to setup
      // This can happen on page refresh if state is not persisted
      // For MVP, we just redirect. A real app might try to load session from backend.
      // router.push('/setup');
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
      <div className="flex flex-col items-center justify-center py-10">
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-center mb-2">Topic: {topic.name}</h2>
        <Alert className="bg-primary text-primary-foreground text-center shadow-md">
          <CheckCircle className="h-5 w-5 text-primary-foreground" />
          <AlertTitle className="text-xl font-bold">
            {currentTeam ? `${currentTeam.name}'s Turn` : "Loading..."}
          </AlertTitle>
        </Alert>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Scoreboard teams={teams} currentTeamId={currentTeam?.id} />
        </div>
        <div className="md:col-span-2">
          <GameGrid />
        </div>
      </div>

      <QuestionModal />
      
      <div className="mt-8 text-center">
        <Button variant="destructive" onClick={endGame}>End Game Early</Button>
      </div>
    </div>
  );
}

// Minimal Card component if not already available (it is, but for completeness if it were missing)
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
