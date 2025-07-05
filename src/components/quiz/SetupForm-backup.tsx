'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TOPICS, GRID_SIZES, MIN_TEAMS, MAX_TEAMS } from '@/lib/quizData';
import TeamNameInput from './TeamNameInput';
import { useToast } from '@/hooks/use-toast';
import type { GameSetupConfig, Topic } from '@/types/quiz';
import type { PowerUpId } from '@/types/powerups';
import { POWER_UPS } from '@/types/powerups';
import { Users, LayoutGrid, BookOpen, Loader2, Zap, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';

const CUTE_TEAM_NAMES = [
  "Rainbow Stars", "Happy Pandas", "Clever Foxes", "Mighty Dragons",
  "Space Explorers", "Ocean Adventurers", "Forest Friends", "Mountain Heroes",
  "Brave Knights", "Magic Unicorns", "Super Scientists", "Math Masters",
  "Reading Rangers", "History Hunters", "Geography Giants", "Art Wizards",
  "Music Makers", "Sports Stars", "Nature Ninjas", "Tech Tigers"
];

export default function SetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { initializeGame } = useGame();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  const [topicId, setTopicId] = useState<string>(TOPICS[0]?.id || '');
  const [numberOfTeams, setNumberOfTeams] = useState<number>(MIN_TEAMS);
  const [teamNames, setTeamNames] = useState<string[]>(Array(MIN_TEAMS).fill(''));
  const [gridSize, setGridSize] = useState<number>(GRID_SIZES[0]);
  const [powerUpProbability, setPowerUpProbability] = useState<number>(0);
  const [enabledPowerUps, setEnabledPowerUps] = useState<PowerUpId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState<{ id: string; name: string; questions: any[] } | null>(null);
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>(TOPICS);
  const [selectedContent, setSelectedContent] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle URL parameters for content selection
  useEffect(() => {
    if (!mounted) return;

    const contentIds = searchParams.get('contentIds');
    const topicId = searchParams.get('topicId');
    const unit = searchParams.get('unit');

    if (contentIds) {
      // Handle multiple content IDs
      const ids = contentIds.split(',');
      setIsLoadingGame(true);
      
      // Fetch content from the API
      Promise.all(ids.map(id => 
        fetch(`/api/admin/content/${id}`).then(res => res.json())
      )).then(contentArray => {
        setSelectedContent(contentArray);
        
        // Create a custom topic from the selected content
        const customTopic = {
          id: `custom-${Date.now()}`,
          name: unit ? `${unit} - Selected Content` : 'Selected Content',
          questions: contentArray.flatMap(content => 
            content.questions?.map((q: any) => ({
              ...q,
              contentTitle: content.title
            })) || []
          )
        };
        
        setAvailableTopics([customTopic]);
        setTopicId(customTopic.id);
        setIsLoadingGame(false);
        
        toast({
          title: "Content Loaded!",
          description: `Loaded ${customTopic.questions.length} questions from selected content.`,
        });
      }).catch(error => {
        console.error('Error loading content:', error);
        setIsLoadingGame(false);
        toast({
          title: "Error",
          description: "Failed to load selected content.",
          variant: "destructive"
        });
      });
    } else if (topicId) {
      // Handle single topic selection
      setTopicId(topicId);
    }
  }, [mounted, searchParams, toast]);

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
        duration: 7000
      });
      setIsLoading(false);
      return;
    }

    const config: GameSetupConfig = {
      topicId,
      numberOfTeams,
      teamNames: teamNames.map((name, index) => name || `Team ${index + 1}`),
      gridSize,
      powerUpProbability,
      enabledPowerUps
    };

    try {
      const sessionId = initializeGame(config);
      toast({ title: "Game Created!", description: "Your quiz game is ready." });
      router.push(`/game/${sessionId}`);
    } catch (error) {
      console.error("Failed to initialize game:", error);
      toast({ 
        title: "Error", 
        description: (error as Error).message || "Failed to create game. Please try again.", 
        variant: "destructive" 
      });
      setIsLoading(false);
    }
  };

  const teamOptions = Array.from(
    { length: MAX_TEAMS - MIN_TEAMS + 1 }, 
    (_, i) => MIN_TEAMS + i
  );

  if (!mounted) {
    return null;
  }

  const startButton = (
    <Button 
      type="submit" 
      form="game-setup-form"
      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-6 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105" 
      disabled={isLoading || isLoadingGame}
    >
      {isLoading ? '🎮 Starting...' : isLoadingGame ? '⏳ Loading...' : '🚀 Start Game'}
    </Button>
  );

  return (
    <>
      {/* Portal for sticky Start Game button */}
      {mounted && typeof document !== 'undefined' && document.getElementById('sticky-start-button') &&
        createPortal(startButton, document.getElementById('sticky-start-button')!)
      }
      
      <div className="min-h-screen w-full bg-background p-4">
        <div className="w-full max-w-7xl mx-auto">
          <form id="game-setup-form" onSubmit={handleSubmit} className="space-y-3">
          {/* Topic Selection - Full Width */}
          <section className="space-y-3">
            <Label className="text-xl font-bold flex items-center justify-center text-purple-600">
              <BookOpen className="mr-2 h-6 w-6 text-purple-500" />
              🎯 Choose a Topic
            </Label>
            {isLoadingGame ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading selected game...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                {availableTopics.map(topic => (
                  <Button
                    key={topic.id}
                    type="button"
                    variant={topicId === topic.id ? 'default' : 'outline'}
                    onClick={() => setTopicId(topic.id)}
                    className={cn(
                      "text-sm h-10 truncate",
                      topicId === topic.id ? "ring-2 ring-primary ring-offset-1" : ""
                    )}
                    title={`${topic.name}${selectedGame && topic.id === selectedGame.id ? ` (${selectedGame.questions.length} Questions)` : ''}`}
                  >
                    {topic.name}
                    {selectedGame && topic.id === selectedGame.id && (
                      <span className="ml-1 text-xs">({selectedGame.questions.length})</span>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </section>

          {/* Game Settings - Full Width */}
          <section className="space-y-4 bg-muted/20 rounded-lg p-4">
            {/* Number of Teams and Grid Size - 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Number of Teams */}
              <div className="space-y-3 text-center">
                <Label className="text-lg font-bold flex items-center justify-center text-blue-600">
                  <Users className="mr-2 h-5 w-5 text-blue-500" />
                  👥 Number of Teams
                </Label>
                <div className="flex gap-1">
                  {teamOptions.map(num => (
                    <Button
                      key={num}
                      type="button"
                      variant={numberOfTeams === num ? 'default' : 'outline'}
                      onClick={() => setNumberOfTeams(num)}
                      className={cn("h-8 text-sm px-3 flex-1", numberOfTeams === num ? "ring-2 ring-primary ring-offset-1" : "")}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Grid Size */}
              <div className="space-y-3 text-center">
                <Label className="text-lg font-bold flex items-center justify-center text-green-600">
                  <LayoutGrid className="mr-2 h-5 w-5 text-green-500" />
                  🎯 Grid Size
                </Label>
                <div className="flex gap-1">
                  {GRID_SIZES.map(size => (
                    <Button
                      key={size}
                      type="button"
                      variant={gridSize === size ? 'default' : 'outline'}
                      onClick={() => setGridSize(size)}
                      className={cn("h-8 text-sm px-2 flex-1", gridSize === size ? "ring-2 ring-primary ring-offset-1" : "")}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Names - Directly Below Number of Teams and Grid Size */}
            <div className="pt-3 border-t">
              <Label className="text-lg font-semibold block mb-3 text-center">Team Names (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamNames.map((name, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder={`Enter name for Team ${index + 1}`}
                      value={name}
                      onChange={e => handleTeamNameChange(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const randomIndex = Math.floor(Math.random() * CUTE_TEAM_NAMES.length);
                        handleTeamNameChange(index, CUTE_TEAM_NAMES[randomIndex]);
                      }}
                      className="h-8 px-3"
                    >
                      <Shuffle className="h-4 w-4" />
                      <span className="ml-1 hidden sm:inline">Cute</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Power-up Settings - Separate Section */}
            <div className="pt-3 border-t text-center">
              <Label className="text-lg font-semibold flex items-center justify-center mb-3">
                <Zap className="mr-2 h-5 w-5 text-primary" />
                Power-up Settings
              </Label>
              
              {/* Power-up Frequency and Select All in same row */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {[
                  { value: 0, label: 'None' },
                  { value: 0.1, label: 'Rare' },
                  { value: 0.3, label: 'Normal' },
                  { value: 0.5, label: 'Common' },
                  { value: 0.7, label: 'Frequent' }
                ].map(option => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={powerUpProbability === option.value ? 'default' : 'outline'}
                    onClick={() => setPowerUpProbability(option.value)}
                    className={cn(
                      "text-sm h-8 px-3 min-w-[80px]",
                      powerUpProbability === option.value ? "ring-2 ring-primary ring-offset-1" : ""
                    )}
                  >
                    {option.label}
                  </Button>
                ))}
                
                {/* Select All button - only show when frequency is not None */}
                {powerUpProbability > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allPowerUpIds = Object.keys(POWER_UPS) as PowerUpId[];
                      setEnabledPowerUps(
                        enabledPowerUps.length === allPowerUpIds.length ? [] : allPowerUpIds
                      );
                    }}
                    className="ml-2"
                  >
                    {enabledPowerUps.length === Object.keys(POWER_UPS).length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>

              {/* Power-up Selection */}
              {powerUpProbability > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Object.entries(POWER_UPS).map(([id, powerUp]) => (
                    <Button
                      key={id}
                      type="button"
                      variant={enabledPowerUps.includes(id as PowerUpId) ? 'default' : 'outline'}
                      onClick={() => {
                        setEnabledPowerUps(prev => 
                          prev.includes(id as PowerUpId)
                            ? prev.filter(p => p !== id)
                            : [...prev, id as PowerUpId]
                        );
                      }}
                      className={cn(
                        "text-xs h-auto p-2 justify-start text-left",
                        enabledPowerUps.includes(id as PowerUpId) ? "ring-2 ring-primary ring-offset-1" : "",
                        powerUp.category === 'Positive' ? "border-green-500" :
                        powerUp.category === 'Negative' ? "border-red-500" :
                        "border-blue-500"
                      )}
                    >
                      <span className="font-semibold">{powerUp.name}:</span> {powerUp.description}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </form>
      </div>
    </div>
    </>
  );
}
