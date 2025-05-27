
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
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl bg-card shadow-2xl rounded-lg p-0">
        <DialogHeader className="bg-primary text-primary-foreground p-4 rounded-t-lg flex justify-center items-center relative">
          {/* The actual X close button is rendered by DialogContent's default structure in its top-right corner, overlaying this header. */}
          <DialogTitle className="text-4xl font-bold">{activeQuestion.points}</DialogTitle>
          {/* Displaying tile number subtly if needed, or remove if points are enough */}
          {/* <span className="absolute left-4 text-sm opacity-75">Tile {tile?.displayNumber}</span> */}
        </DialogHeader>
        
        <div className="p-6 space-y-6 flex flex-col items-center">
          {media && (media.type === 'image' || media.type === 'gif') && (
            <div 
              className="relative w-full max-w-xl aspect-video mb-4 rounded-md overflow-hidden shadow-md bg-muted"
              data-ai-hint="sports equipment" 
            >
              <Image
                src={media.url}
                alt={media.alt || "Question related media"}
                layout="fill"
                objectFit="contain" // Changed to contain to show full image, adjust if crop is better
                priority={true} 
              />
            </div>
          )}
          {/* TODO: Add video support here if media.type === 'video' */}

          <DialogDescription className="text-2xl md:text-3xl text-foreground text-center min-h-[60px] my-6">
            {activeQuestion.questionText}
          </DialogDescription>

          {!showAnswer && (
            <Button onClick={handleShowAnswer} variant="outline" size="sm" className="mt-auto">
              <Eye className="mr-2 h-4 w-4" /> Reveal Answer
            </Button>
          )}

          {showAnswer && (
            <div className="p-4 bg-secondary rounded-md shadow-inner w-full max-w-lg text-center">
              <p className="text-lg font-semibold text-primary">Correct Answer:</p>
              <p className="text-md text-secondary-foreground">{activeQuestion.answerText}</p>
            </div>
          )}
        </div>

        {showAnswer && (
          <DialogFooter className="p-6 bg-muted/50 rounded-b-lg flex flex-col sm:flex-row sm:justify-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              onClick={() => handleAdjudication(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Correct
            </Button>
            <Button
              onClick={() => handleAdjudication(false)}
              variant="destructive"
              size="sm"
            >
              <XCircle className="mr-2 h-4 w-4" /> Incorrect
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
