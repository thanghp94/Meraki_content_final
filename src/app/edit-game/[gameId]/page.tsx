
'use client';

import { useParams } from 'next/navigation';
import EditGameHeader from '@/components/edit-game/EditGameHeader';
import QuestionEditorForm from '@/components/edit-game/QuestionEditorForm';
import ActionButtonsBar from '@/components/edit-game/ActionButtonsBar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useState } from 'react';

export default function EditGamePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const [showAlert, setShowAlert] = useState(true);

  // Placeholder game name - in a real app, you'd fetch this based on gameId
  const gameName = "My Awesome Game"; 

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

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <EditGameHeader title="EDIT GAME" subtitle={gameName || 'Loading game...'} />

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

        <ActionButtonsBar />

        <QuestionEditorForm 
          onSave={handleSaveQuestion} 
          onClose={handleCloseQuestionEditor} 
          questionsSavedCount={questionsCount}
        />
      </main>
    </div>
  );
}
