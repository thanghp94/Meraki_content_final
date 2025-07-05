'use client';

import { useParams } from 'next/navigation';
import EditGameHeader from '@/components/edit-game/EditGameHeader';
import QuestionEditorForm from '@/components/edit-game/QuestionEditorForm';
import ActionButtonsBar from '@/components/edit-game/ActionButtonsBar';
import ImportQuestionsModal from '@/components/edit-game/ImportQuestionsModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast'; 
import type { Question } from '@/types/quiz';

export default function EditGamePage() {
  const params = useParams();
  const gameId = params.gameId as string; 
  const [showAlert, setShowAlert] = useState(true);
  const [gameName, setGameName] = useState('Loading game...');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { toast } = useToast(); 
  const [questions, setQuestions] = useState<Question[]>([]);

  const fetchQuestions = useCallback(async () => {
    if (!gameId) return;
    try {
      const response = await fetch(`/api/games/${gameId}/questions`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const fetchedQuestions = await response.json();
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Could not load questions for this game.",
        variant: "destructive",
      });
    }
  }, [gameId, toast]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const nameFromQuery = queryParams.get('name');
    if (nameFromQuery) {
      setGameName(decodeURIComponent(nameFromQuery));
    } else if (gameId) {
      setGameName(`Game ID: ${gameId.substring(0, 8)}...`);
    }
    fetchQuestions();
  }, [gameId, fetchQuestions]);

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
  };

  const handleImportQuestions = async (text: string, delimiter: string) => {
    if (!gameId) {
      toast({ title: "Error", description: "Game ID is missing. Cannot import.", variant: "destructive" });
      return;
    }
    if (!text.trim()) {
      toast({ title: "No content", description: "Please paste some questions to import.", variant: "destructive" });
      return;
    }

    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
      toast({ title: "No questions found", description: "The pasted text doesn't seem to contain any questions.", variant: "default" });
      return;
    }

    const newQuestions: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const parts = line.split(delimiter);
      const questionText = parts[0]?.trim();
      const answerText = parts[1]?.trim();
      const pointsStr = parts[2]?.trim();
      let points = 10; // Default points

      if (!questionText || !answerText) {
        errors.push(`Line ${index + 1}: Missing question or answer.`);
        return; // Skip this line
      }

      if (pointsStr) {
        const parsedPoints = parseInt(pointsStr, 10);
        if (!isNaN(parsedPoints) && parsedPoints > 0) {
          points = parsedPoints;
        } else {
          errors.push(`Line ${index + 1}: Invalid points value "${pointsStr}", using default ${points}.`);
        }
      }
      
      let media;
      const potentialMediaUrl = parts[3]?.trim();
      if (potentialMediaUrl && (potentialMediaUrl.startsWith('http://') || potentialMediaUrl.startsWith('https://'))) {
        media = {
          url: potentialMediaUrl,
          type: 'image' as 'image',
          alt: `Imported image for: ${questionText.substring(0,30)}`
        };
      }

      newQuestions.push({
        questionText,
        answerText,
        answer: answerText, // For compatibility with the new schema
        points,
        media,
        type: 'WSC', // Default type
        questionType: 'text' // Default question type
      });
    });

    if (errors.length > 0) {
      toast({
        title: "Import Issues",
        description: `Found ${errors.length} issue(s) with the import. Some questions might be skipped or use default values.`,
        variant: "destructive",
        duration: 7000,
      });
    }

    if (newQuestions.length > 0) {
      try {
        const response = await fetch(`/api/games/${gameId}/questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newQuestions),
        });
        
        if (!response.ok) {
          throw new Error('Failed to import questions');
        }
        toast({
          title: "Import Successful!",
          description: `${newQuestions.length} questions imported.`,
        });
        fetchQuestions(); // Refresh the list
      } catch (error) {
        console.error("Error importing questions:", error);
        toast({
          title: "Import Failed",
          description: "Could not save imported questions. Please try again.",
          variant: "destructive",
        });
      }
    } else if (errors.length === lines.length) {
      toast({
        title: "Import Failed",
        description: "No valid questions could be parsed from the input.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <EditGameHeader title="EDIT GAME" subtitle={gameName} />

      <main className="flex-grow container mx-auto px-4 py-6 space-y-6">
        {showAlert && (
          <Alert className="bg-primary/10 border-primary/30 text-primary relative">
            <AlertTitle className="font-semibold">New game made!</AlertTitle>
            <AlertDescription>
              Now add some questions to it. You can add questions one by one using the form below, or import multiple questions.
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 !p-1 h-auto text-primary hover:bg-primary/20"
              onClick={() => setShowAlert(false)}
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        <ActionButtonsBar onOpenImportModal={handleOpenImportModal} />

        {gameId ? (
          <QuestionEditorForm 
            gameId={gameId}
            questions={questions}
            onQuestionsChange={setQuestions}
          />
        ) : (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Game ID is missing. Cannot edit questions.</AlertDescription>
          </Alert>
        )}
      </main>

      <ImportQuestionsModal
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        onImport={handleImportQuestions}
      />
    </div>
  );
}
