'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TOPICS, GRID_SIZES, MIN_TEAMS, MAX_TEAMS } from '@/lib/quizData';
import TeamNameInput from './TeamNameInput';
import { useToast } from '@/hooks/use-toast';
import type { GameSetupConfig } from '@/types/quiz';

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

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Game Configuration</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic/Question Repository</Label>
            <Select value={topicId} onValueChange={setTopicId}>
              <SelectTrigger id="topic">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {TOPICS.map(topic => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfTeams">Number of Teams ({MIN_TEAMS}-{MAX_TEAMS})</Label>
            <Input
              id="numberOfTeams"
              type="number"
              min={MIN_TEAMS}
              max={MAX_TEAMS}
              value={numberOfTeams}
              onChange={e => setNumberOfTeams(parseInt(e.target.value))}
              required
            />
          </div>

          {teamNames.map((name, index) => (
            <TeamNameInput
              key={index}
              teamNumber={index + 1}
              value={name}
              onChange={newName => handleTeamNameChange(index, newName)}
              topicForSuggestion={TOPICS.find(t => t.id === topicId)?.name || 'general quiz'}
            />
          ))}

          <div className="space-y-2">
            <Label htmlFor="gridSize">Grid Size (Number of Tiles)</Label>
            <Select value={gridSize.toString()} onValueChange={val => setGridSize(parseInt(val))}>
              <SelectTrigger id="gridSize">
                <SelectValue placeholder="Select grid size" />
              </SelectTrigger>
              <SelectContent>
                {GRID_SIZES.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} tiles
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Starting Game...' : 'Start Game'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
