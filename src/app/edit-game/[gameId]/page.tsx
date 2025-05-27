
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
import { useToast } from '@/hooks/use-toast'; 

export default function EditGamePage() {
  const params = useParams();
  const gameId = params.gameId as string; // Now this is the actual Firestore gameId
  const [showAlert, setShowAlert] = useState(true);
  const [gameName, setGameName] = useState('Loading game...');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { toast } = useToast(); 

  // State to track the number of questions saved for THIS session on this page.
  // In a real app, you might fetch the actual count from Firestore initially.
  const [questionsSavedThisSession, setQuestionsSavedThisSession] = useState(0);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const nameFromQuery = queryParams.get('name');
    if (nameFromQuery) {
      setGameName(decodeURIComponent(nameFromQuery));
    } else if (gameId) {
      // In a real app, you'd fetch game details (including name and questionCount) from Firestore using gameId
      // For now, just use the ID.
      setGameName(`Game ID: ${gameId.substring(0, 8)}...`);
      // Example: fetchGameDetails(gameId).then(details => setGameName(details.name));
    }
  }, [gameId]);


  const handleSaveQuestionSuccess = () => {
    setQuestionsSavedThisSession(prev => prev + 1);
    // Potentially fetch updated game details here if needed, or just update local count
  };

  const handleCloseQuestionEditor = () => {
    // Logic for closing or clearing the question editor if it were separate
    // For now, the QuestionEditorForm has its own close/cancel logic
    console.log("Close question editor action (if applicable outside form)");
  };

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
  };

  const handleImportQuestions = (text: string, delimiter: string) => {
    // This is where you would parse the 'text' based on 'delimiter'
    // and then call 'addQuestionToGameInFirestore' for each parsed question.
    // This will be a more complex loop.
    console.log("Importing questions (logic TBD):", { text, delimiter, gameId });
    
    const validLines = text.split('\n').filter(line => line.trim() !== '');
    const numLines = validLines.length;

    // For now, just show a toast and update a mock count
    toast({
      title: "Import Initiated (Not Implemented)",
      description: `Would attempt to import ${numLines} question line(s) for game ${gameId}. Actual saving logic from import is TBD.`,
      duration: 5000,
    });
    // This count update is temporary until import save is implemented
    setQuestionsSavedThisSession(prev => prev + numLines); 
    // setIsImportModalOpen(false); // Modal closes itself on import click
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
            onSaveSuccess={handleSaveQuestionSuccess} 
            onClose={handleCloseQuestionEditor} 
            questionsSavedCount={questionsSavedThisSession} // Display count of questions saved in this session
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
