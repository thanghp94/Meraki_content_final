
'use client';

import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import Image from 'next/image'; // Import next/image

export default function QuestionModal() {
  const { gameState, adjudicateAnswer, closeQuestionModal } = useGame();
  const [showAnswer, setShowAnswer] = useState(false);

  if (!gameState || !gameState.activeQuestion) {
    return null;
  }

  const { activeQuestion, currentTileId } = gameState;
  const tile = gameState.tiles.find(t => t.id === currentTileId);
  const media = activeQuestion?.media;

  const handleAdjudication = (isCorrect: boolean) => {
    adjudicateAnswer(isCorrect);
    setShowAnswer(false); // Reset for next question
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };
  
  const handleClose = () => {
    setShowAnswer(false); 
    closeQuestionModal(); 
  };


  return (
    <Dialog open={!!activeQuestion} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-2xl bg-card shadow-2xl rounded-lg p-0">
        <DialogHeader className="bg-primary text-primary-foreground p-6 rounded-t-lg">
          <DialogTitle className="text-2xl">Question (Tile {tile?.displayNumber}) - {activeQuestion.points} Points</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          {media && (media.type === 'image' || media.type === 'gif') && (
            <div 
              className="relative w-full aspect-video mb-4 rounded-md overflow-hidden shadow-md bg-muted"
              data-ai-hint="quiz illustration" // Generic hint for placeholders
            >
              <Image
                src={media.url}
                alt={media.alt || "Question related media"}
                layout="fill"
                objectFit="cover"
                priority={true} // Prioritize loading image in modal
              />
            </div>
          )}
          {/* TODO: Add video support here if media.type === 'video' */}

          <DialogDescription className="text-xl text-foreground min-h-[60px]">
            {activeQuestion.questionText}
          </DialogDescription>

          {!showAnswer && (
            <Button onClick={handleShowAnswer} variant="outline" className="w-full">
              <Eye className="mr-2 h-4 w-4" /> Show Answer
            </Button>
          )}

          {showAnswer && (
            <div className="p-4 bg-secondary rounded-md shadow-inner">
              <p className="text-lg font-semibold text-primary">Correct Answer:</p>
              <p className="text-md text-secondary-foreground">{activeQuestion.answerText}</p>
            </div>
          )}
        </div>

        {showAnswer && (
          <DialogFooter className="p-6 bg-muted/50 rounded-b-lg flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              onClick={() => handleAdjudication(true)}
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Correct
            </Button>
            <Button
              onClick={() => handleAdjudication(false)}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              <XCircle className="mr-2 h-4 w-4" /> Incorrect
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
