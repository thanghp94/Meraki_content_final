
'use client';

import { useParams } from 'next/navigation';
import EditGameHeader from '@/components/edit-game/EditGameHeader';
import QuestionEditorForm from '@/components/edit-game/QuestionEditorForm';
import ActionButtonsBar from '@/components/edit-game/ActionButtonsBar';
import ImportQuestionsModal from '@/components/edit-game/ImportQuestionsModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast'; // Added useToast import

export default function EditGamePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const [showAlert, setShowAlert] = useState(true);
  const [gameName, setGameName] = useState('Loading game...');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { toast } = useToast(); // Initialized toast

  useEffect(() => {
    // In a real app, you'd fetch game details based on gameId
    // For now, we'll try to get the name from URL query params if available
    const queryParams = new URLSearchParams(window.location.search);
    const nameFromQuery = queryParams.get('name');
    if (nameFromQuery) {
      setGameName(decodeURIComponent(nameFromQuery));
    } else if (gameId) {
      // Fallback if no query param, could be a generic name or fetched
      setGameName(`Game ID: ${gameId.substring(0, 8)}...`);
    }
  }, [gameId]);


  // Placeholder for questions count for the Save button
  const [questionsCount, setQuestionsCount] = useState(0);

  const handleSaveQuestion = () => {
    // In a real app, this would save the question and update the count
    setQuestionsCount(prev => prev + 1);
    // Potentially clear form or load next question
  };

  const handleCloseQuestionEditor = () => {
    // Logic for closing or clearing the question editor
    console.log("Close question editor");
  };

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
  };

  const handleImportQuestions = (text: string, delimiter: string) => {
    console.log("Importing questions:", { text, delimiter });
    // Here you would parse the text and create question objects
    // For now, just log and show a toast
    const validLines = text.split('\n').filter(line => line.trim() !== '');
    const numLines = validLines.length;

    toast({
      title: "Import Processed",
      description: `Attempted to import ${numLines} question line(s) using "${delimiter}" as the delimiter. Actual parsing logic is TBD.`,
      duration: 5000,
    });
    setQuestionsCount(prev => prev + numLines);
  };


  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <EditGameHeader title="EDIT GAME" subtitle={gameName} />

      <main className="flex-grow container mx-auto px-4 py-6 space-y-6">
        {showAlert && (
          <Alert className="bg-primary/10 border-primary/30 text-primary relative">
            <AlertTitle className="font-semibold">New game made!</AlertTitle>
            <AlertDescription>
              Now add some questions to it.
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

        <QuestionEditorForm 
          onSave={handleSaveQuestion} 
          onClose={handleCloseQuestionEditor} 
          questionsSavedCount={questionsCount}
        />
      </main>
      <ImportQuestionsModal
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        onImport={handleImportQuestions}
      />
    </div>
  );
}
