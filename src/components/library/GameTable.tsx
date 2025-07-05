'use client';

import type { GameStub } from '@/types/library';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Eye, ListChecks, MoreHorizontal, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import type { Question } from '@/types/quiz';

interface Choice {
  text: string;
}

interface QuestionWithChoices extends Question {
  choices?: Choice[];
}

interface GameTableProps {
  games: GameStub[];
}

interface GameWithQuestions extends GameStub {
  questions?: QuestionWithChoices[];
  questionsLoaded?: boolean;
}

export default function GameTable({ games }: GameTableProps) {
  const router = useRouter();
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());
  const [gamesWithQuestions, setGamesWithQuestions] = useState<GameWithQuestions[]>(games);

  useEffect(() => {
    setGamesWithQuestions(games);
  }, [games]);

  const toggleExpanded = async (gameId: string) => {
    const newExpanded = new Set(expandedGames);
    
    if (newExpanded.has(gameId)) {
      newExpanded.delete(gameId);
    } else {
      newExpanded.add(gameId);
      
      // Load questions if not already loaded
      const gameIndex = gamesWithQuestions.findIndex(g => g.id === gameId);
      if (gameIndex !== -1 && !gamesWithQuestions[gameIndex].questionsLoaded) {
        try {
          const response = await fetch(`/api/games/${gameId}/questions`);
          if (response.ok) {
            const questions = await response.json();
            const updatedGames = [...gamesWithQuestions];
            updatedGames[gameIndex] = {
              ...updatedGames[gameIndex],
              questions,
              questionsLoaded: true
            };
            setGamesWithQuestions(updatedGames);
          }
        } catch (error) {
          console.error('Failed to load questions:', error);
        }
      }
    }
    
    setExpandedGames(newExpanded);
  };

  const handlePlayClick = (gameId: string) => {
    router.push(`/setup?gameId=${gameId}`);
  };

  const handleEditClick = (gameId: string) => {
    router.push(`/edit-game/${gameId}`);
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Game Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-center">Questions</TableHead>
            <TableHead className="text-center">Plays</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gamesWithQuestions.map((game) => {
            const isExpanded = expandedGames.has(game.id);
            const questions = game.questions || [];
            
            return (
              <>
                <TableRow key={game.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(game.id)}
                      className="p-1 h-6 w-6"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{game.name}</div>
                      {game.subtitle && (
                        <div className="text-sm text-muted-foreground">{game.subtitle}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md truncate text-sm text-muted-foreground">
                      {game.subtitle || 'No description'}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <ListChecks className="h-4 w-4" />
                      <span>{game.questionCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{game.playCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-1 justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(game.id)}
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Edit game</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePlayClick(game.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Play className="h-4 w-4" />
                        <span className="sr-only">Play game</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={6} className="bg-muted/20 p-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Questions ({questions.length})</h4>
                        {questions.length > 0 ? (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {questions.map((question, index) => (
                              <div key={question.id} className="border rounded p-3 bg-background">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className="text-xs">
                                        {question.type}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {question.questionType}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {question.points} pts
                                      </span>
                                    </div>
                                    <div className="text-sm font-medium truncate">
                                      {index + 1}. {question.questionText}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Answer: {question.answer || question.answerText}
                                    </div>
                                    {question.choices && question.choices.length > 0 && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        Choices: {question.choices.map((c: Choice) => c.text).join(', ')}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground py-4 text-center">
                            No questions found for this game.
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
