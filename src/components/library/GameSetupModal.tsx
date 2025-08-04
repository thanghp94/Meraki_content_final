'use client';

import { useState, type FormEvent, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { TOPICS, GRID_SIZES, MIN_TEAMS, MAX_TEAMS } from '@/lib/quizData';
import { useToast } from '@/hooks/use-toast';
import type { GameSetupConfig, Topic } from '@/types/quiz';
import type { PowerUpId } from '@/types/powerups';
import { POWER_UPS } from '@/types/powerups';
import { Users, LayoutGrid, BookOpen, Loader2, Zap, Shuffle, FolderOpen, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { gameSaveService, type SavedGameConfig } from '@/lib/gameSaveService';

interface UnitTopic {
  id: string;
  topic: string;
  short_summary: string;
  image: string;
  questions?: any[];
}

const CUTE_TEAM_NAMES = [
  "Rainbow Stars", "Happy Pandas", "Clever Foxes", "Mighty Dragons",
  "Space Explorers", "Ocean Adventurers", "Forest Friends", "Mountain Heroes",
  "Brave Knights", "Magic Unicorns", "Super Scientists", "Math Masters",
  "Reading Rangers", "History Hunters", "Geography Giants", "Art Wizards",
  "Music Makers", "Sports Stars", "Nature Ninjas", "Tech Tigers"
];

interface GameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContentIds?: string[];
  selectedUnit?: string;
  selectedTopicId?: string;
  selectedTopicName?: string;
  unitTopics?: UnitTopic[];
}

export default function GameSetupModal({
  isOpen,
  onClose,
  selectedContentIds = [],
  selectedUnit = '',
  selectedTopicId = '',
  selectedTopicName = '',
  unitTopics = []
}: GameSetupModalProps) {
  const router = useRouter();
  const { initializeGame } = useGame();
  const { toast } = useToast();

  const [topicId, setTopicId] = useState<string>(selectedTopicId || TOPICS[0]?.id || '');
  const [numberOfTeams, setNumberOfTeams] = useState<number>(MIN_TEAMS);
  const [teamNames, setTeamNames] = useState<string[]>(Array(MIN_TEAMS).fill(''));
  const [gridSize, setGridSize] = useState<number>(GRID_SIZES[0]);
  const [powerUpProbability, setPowerUpProbability] = useState<number>(0);
  const [enabledPowerUps, setEnabledPowerUps] = useState<PowerUpId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>(TOPICS);
  const [contentQuestions, setContentQuestions] = useState<any[]>([]);
  const [savedGames, setSavedGames] = useState<SavedGameConfig[]>([]);
  const [selectedLessonIds, setSelectedLessonIds] = useState<Set<string>>(new Set());

  // Memoize the unit topics to prevent infinite loops
  const memoizedUnitTopics = useMemo(() => unitTopics, [JSON.stringify(unitTopics)]);
  const memoizedSelectedContentIds = useMemo(() => selectedContentIds, [JSON.stringify(selectedContentIds)]);

  const loadQuestionsFromContent = useCallback(async (contentIds: string[]) => {
    setIsLoadingGame(true);
    try {
      const allQuestions: any[] = [];
      
      for (const contentId of contentIds) {
        const response = await fetch(`/api/admin/content/${contentId}`);
        if (response.ok) {
          const contentData = await response.json();
          if (contentData.questions && Array.isArray(contentData.questions)) {
            allQuestions.push(...contentData.questions);
          }
        }
      }
      
      if (allQuestions.length > 0) {
        setContentQuestions(allQuestions);
        const customTopic: Topic = {
          id: 'selected-content',
          name: selectedTopicName || selectedUnit || `Selected Content (${allQuestions.length} questions)`,
          questions: allQuestions
        };
        
        setAvailableTopics([customTopic, ...TOPICS]);
        setTopicId('selected-content');
        
        toast({
          title: "Content Loaded!",
          description: `${allQuestions.length} questions loaded from selected content.`,
        });
      } else {
        toast({
          title: "No Questions Found",
          description: "The selected content doesn't contain any questions.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading content questions:', error);
      toast({
        title: "Error Loading Content",
        description: "Failed to load questions from selected content.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingGame(false);
    }
  }, [selectedTopicName, selectedUnit, toast]);

  // Simplified useEffect that only runs when modal opens
  useEffect(() => {
    if (isOpen) {
      setSavedGames(gameSaveService.getSavedGames());
      
      if (memoizedSelectedContentIds.length > 0) {
        loadQuestionsFromContent(memoizedSelectedContentIds);
      } else if (selectedTopicId) {
        setTopicId(selectedTopicId);
      }
    }
  }, [isOpen, loadQuestionsFromContent, memoizedSelectedContentIds, selectedTopicId]);

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

  const handleLoadGame = (gameId: string) => {
    const game = gameSaveService.loadGame(gameId);
    if (game) {
      setNumberOfTeams(game.config.teamNames.length);
      setTeamNames(game.config.teamNames);
      setGridSize(game.config.gridSize);
      
      const matchingTopic = availableTopics.find(topic => 
        game.config.selectedTopics.includes(topic.name)
      );
      if (matchingTopic) {
        setTopicId(matchingTopic.id);
      }

      toast({
        title: 'Game Loaded!',
        description: `"${game.name}" configuration has been loaded.`,
      });
    }
  };

  const handleDeleteGame = (gameId: string) => {
    gameSaveService.deleteGame(gameId);
    setSavedGames(gameSaveService.getSavedGames());
    toast({
      title: 'Game Deleted',
      description: 'Saved game has been removed.',
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Handle lesson selection mode
    if (memoizedUnitTopics.length > 0) {
      if (selectedLessonIds.size === 0) {
        toast({ title: "Error", description: "Please select at least one lesson.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const combinedQuestions: any[] = [];
      memoizedUnitTopics
        .filter(topic => selectedLessonIds.has(topic.id))
        .forEach(topic => {
          if (topic.questions && topic.questions.length > 0) {
            combinedQuestions.push(...topic.questions);
          }
        });

      if (combinedQuestions.length < gridSize) {
        toast({
          title: "Configuration Issue",
          description: `The selected lessons have only ${combinedQuestions.length} questions. Please choose a smaller grid size or select more lessons.`,
          variant: "destructive",
          duration: 7000
        });
        setIsLoading(false);
        return;
      }

      const config: GameSetupConfig = {
        topicId: 'combined-lessons',
        numberOfTeams,
        teamNames: teamNames.map((name, index) => name || `Team ${index + 1}`),
        gridSize,
        powerUpProbability,
        enabledPowerUps
      };

      try {
        const selectedTopicForGame = {
          id: 'combined-lessons',
          name: `${selectedUnit} - Selected Lessons`,
          questions: combinedQuestions
        };
        
        const sessionId = initializeGame(config, selectedTopicForGame);
        toast({ title: "Game Created!", description: "Your quiz game is ready." });
        onClose();
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
      return;
    }

    // Handle regular topic selection mode
    if (!topicId) {
      toast({ title: "Error", description: "Please select a topic.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    let selectedTopic = availableTopics.find(t => t.id === topicId);
    
    if (topicId === 'selected-content' && contentQuestions.length > 0) {
      selectedTopic = {
        id: 'selected-content',
        name: selectedTopicName || selectedUnit || 'Selected Content',
        questions: contentQuestions
      };
    }

    if (selectedTopic && selectedTopic.questions.length < gridSize) {
      toast({
        title: "Configuration Issue",
        description: `The selected content has only ${selectedTopic.questions.length} questions. Please choose a smaller grid size or select more content.`,
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
      const selectedTopicForGame = topicId === 'selected-content' && contentQuestions.length > 0 
        ? {
            id: 'selected-content',
            name: selectedTopicName || selectedUnit || 'Selected Content',
            questions: contentQuestions
          }
        : undefined;
      
      const sessionId = initializeGame(config, selectedTopicForGame);
      toast({ title: "Game Created!", description: "Your quiz game is ready." });
      onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-purple-600">
            🎮 Create New Game
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Topic/Lesson Selection */}
          <section className="space-y-3">
            {memoizedUnitTopics.length > 0 ? (
              <>
                <Label className="text-lg font-bold flex items-center justify-center text-purple-600">
                  <BookOpen className="mr-2 h-5 w-5 text-purple-500" />
                  📚 Choose Lessons from {selectedUnit}
                </Label>
                <div className="bg-muted/20 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">Select lessons to combine:</span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLessonIds(new Set(memoizedUnitTopics.map(t => t.id)))}
                        >
                          Select All
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLessonIds(new Set())}
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                    {memoizedUnitTopics.map((topic, index) => (
                      <div key={topic.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <Checkbox
                          id={topic.id}
                          checked={selectedLessonIds.has(topic.id)}
                          onCheckedChange={(checked) => {
                            const newSelected = new Set(selectedLessonIds);
                            if (checked) {
                              newSelected.add(topic.id);
                            } else {
                              newSelected.delete(topic.id);
                            }
                            setSelectedLessonIds(newSelected);
                          }}
                        />
                        <div className="flex-grow">
                          <label htmlFor={topic.id} className="text-sm font-medium cursor-pointer">
                            Lesson {index + 1}: {topic.topic}
                          </label>
                          <p className="text-xs text-muted-foreground">{topic.short_summary}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {topic.questions?.length || 0} questions
                        </Badge>
                      </div>
                    ))}
                    {selectedLessonIds.size > 0 && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800">
                          ✅ Selected: {selectedLessonIds.size} lesson{selectedLessonIds.size !== 1 ? 's' : ''} from {selectedUnit}
                        </p>
                        <p className="text-xs text-green-600">
                          🎯 Total questions available: {memoizedUnitTopics
                            .filter(t => selectedLessonIds.has(t.id))
                            .reduce((sum, t) => sum + (t.questions?.length || 0), 0)}
                        </p>
                        <div className="mt-2 text-xs text-green-700">
                          <strong>Selected lessons:</strong> {memoizedUnitTopics
                            .filter(t => selectedLessonIds.has(t.id))
                            .map((t, i) => `Lesson ${memoizedUnitTopics.indexOf(t) + 1}`)
                            .join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Label className="text-lg font-bold flex items-center justify-center text-purple-600">
                  <BookOpen className="mr-2 h-5 w-5 text-purple-500" />
                  🎯 Choose a Topic
                </Label>
                {isLoadingGame ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading selected content...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {availableTopics.map(topic => (
                      <Button
                        key={topic.id}
                        type="button"
                        variant={topicId === topic.id ? 'default' : 'outline'}
                        onClick={() => setTopicId(topic.id)}
                        className={cn(
                          "text-sm h-10 truncate",
                          topicId === topic.id ? "ring-2 ring-primary ring-offset-1" : "",
                          topic.id === 'selected-content' ? "bg-green-50 border-green-500 text-green-700" : ""
                        )}
                        title={`${topic.name} (${topic.questions.length} Questions)`}
                      >
                        {topic.name}
                        <span className="ml-1 text-xs">({topic.questions.length})</span>
                      </Button>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>

          {/* Game Settings */}
          <section className="space-y-4 bg-muted/20 rounded-lg p-4">
            {/* Number of Teams and Grid Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Team Names */}
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
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-6 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105" 
              disabled={isLoading || isLoadingGame}
            >
              {isLoading ? '🎮 Starting...' : isLoadingGame ? '⏳ Loading...' : '🚀 Start Game'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
