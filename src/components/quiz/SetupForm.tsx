
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TOPICS, GRID_SIZES, MIN_TEAMS, MAX_TEAMS } from '@/lib/quizData';
import TeamNameInput from './TeamNameInput';
import { useToast } from '@/hooks/use-toast';
import type { GameSetupConfig } from '@/types/quiz';
import { Users, LayoutGrid, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SetupForm() {
  const router = useRouter();
  const { initializeGame } = useGame();
  const { toast } = useToast();

  const [topicId, setTopicId] = useState<string>(TOPICS[0]?.id || '');
  const [numberOfTeams, setNumberOfTeams] = useState<number>(MIN_TEAMS);
  const [teamNames, setTeamNames] = useState<string[]>(Array(MIN_TEAMS).fill(''));
  const [gridSize, setGridSize] = useState<number>(GRID_SIZES[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTeamNames(prev => {
      const newTeamNames = Array(numberOfTeams).fill('');
      for (let i = 0; i < Math.min(prev.length, numberOfTeams); i++) {
        newTeamNames[i] = prev[i];
      }
      return newTeamNames;
    });
  }, [numberOfTeams]);

  const handleTeamNameChange = (index: number, name: string) => {
    const newTeamNames = [...teamNames];
    newTeamNames[index] = name;
    setTeamNames(newTeamNames);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!topicId) {
      toast({ title: "Error", description: "Please select a topic.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    
    const selectedTopic = TOPICS.find(t => t.id === topicId);
    if (selectedTopic && selectedTopic.questions.length < gridSize) {
       toast({ 
        title: "Configuration Issue", 
        description: `The selected topic "${selectedTopic.name}" has only ${selectedTopic.questions.length} questions. Please choose a smaller grid size or a topic with more questions.`, 
        variant: "destructive",
        duration: 7000,
      });
      setIsLoading(false);
      return;
    }

    const config: GameSetupConfig = {
      topicId,
      numberOfTeams,
      teamNames: teamNames.map((name, index) => name || `Team ${index + 1}`),
      gridSize,
    };

    try {
      const sessionId = initializeGame(config);
      toast({ title: "Game Created!", description: "Your quiz game is ready." });
      router.push(`/game/${sessionId}`);
    } catch (error) {
      console.error("Failed to initialize game:", error);
      toast({ title: "Error", description: (error as Error).message || "Failed to create game. Please try again.", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const teamOptions = Array.from({ length: MAX_TEAMS - MIN_TEAMS + 1 }, (_, i) => MIN_TEAMS + i);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Game Configuration</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-8">
          {/* Topic Selection */}
          <div className="space-y-3 text-center">
            <Label className="text-lg font-semibold flex items-center justify-center">
              <BookOpen className="mr-2 h-5 w-5 text-primary" />
              Choose a Topic
            </Label>
            <div className="flex flex-wrap gap-2 justify-center">
              {TOPICS.map(topic => (
                <Button
                  key={topic.id}
                  type="button"
                  variant={topicId === topic.id ? 'default' : 'outline'}
                  onClick={() => setTopicId(topic.id)}
                  className={cn("min-w-[120px]", topicId === topic.id ? "ring-2 ring-primary ring-offset-2" : "")}
                >
                  {topic.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Number of Teams Selection */}
          <div className="space-y-3 text-center">
            <Label className="text-lg font-semibold flex items-center justify-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Number of Teams
            </Label>
            <div className="flex flex-wrap gap-2 justify-center">
              {teamOptions.map(num => (
                <Button
                  key={num}
                  type="button"
                  variant={numberOfTeams === num ? 'default' : 'outline'}
                  onClick={() => setNumberOfTeams(num)}
                  className={cn("w-12 h-12 text-lg", numberOfTeams === num ? "ring-2 ring-primary ring-offset-2" : "")}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          {/* Team Name Inputs */}
          <div className="space-y-4">
            {teamNames.map((name, index) => (
              <TeamNameInput
                key={index}
                teamNumber={index + 1}
                value={name}
                onChange={newName => handleTeamNameChange(index, newName)}
                topicForSuggestion={TOPICS.find(t => t.id === topicId)?.name || 'general quiz'}
              />
            ))}
          </div>
          
          {/* Grid Size Selection */}
          <div className="space-y-3 text-center">
            <Label className="text-lg font-semibold flex items-center justify-center">
              <LayoutGrid className="mr-2 h-5 w-5 text-primary" />
              Grid Size
            </Label>
            <div className="flex flex-wrap gap-2 justify-center">
              {GRID_SIZES.map(size => (
                <Button
                  key={size}
                  type="button"
                  variant={gridSize === size ? 'default' : 'outline'}
                  onClick={() => setGridSize(size)}
                   className={cn("w-16 h-12 text-lg", gridSize === size ? "ring-2 ring-primary ring-offset-2" : "")}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

        </CardContent>
        <CardFooter className="pt-8">
          <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
            {isLoading ? 'Starting Game...' : 'Start Game'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
