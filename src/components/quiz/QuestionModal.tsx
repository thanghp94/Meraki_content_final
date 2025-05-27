
'use client';

import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import Image from 'next/image'; // Import next/image

// Helper function to play sound
const playSound = (soundFile: string) => {
  try {
    const audio = new Audio(soundFile);
    audio.play().catch(error => {
      // Autoplay was prevented or another error occurred
      // console.warn(`Could not play sound ${soundFile}:`, error);
      // You might want to inform the user that interaction is needed to enable sound
    });
  } catch (error) {
    // console.error(`Error playing sound ${soundFile}:`, error);
  }
};

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
    if (isCorrect) {
      playSound('/sounds/correct.mp3');
    } else {
      playSound('/sounds/incorrect.mp3');
    }
    adjudicateAnswer(isCorrect);
    setShowAnswer(false); // Reset for next question
  };

  const handleShowAnswer = () => {
    playSound('/sounds/reveal.mp3');
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
          <DialogTitle className="text-4xl font-bold">{activeQuestion.points}</DialogTitle>
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
                objectFit="contain" 
                priority={true} 
              />
            </div>
          )}
          {/* TODO: Add video support here if media.type === 'video' */}

          <DialogDescription className="text-3xl md:text-4xl font-bold text-foreground text-center my-6">
            {activeQuestion.questionText}
          </DialogDescription>

          {!showAnswer && (
            <Button onClick={handleShowAnswer} variant="outline" size="sm" className="mt-auto">
              <Eye className="mr-2 h-4 w-4" /> Reveal Answer
            </Button>
          )}

          {/* Display the answer in a styled box when showAnswer is true */}
          {showAnswer && activeQuestion.answerText && (
            <div className="w-full max-w-2xl p-6 my-6 border border-border rounded-xl bg-card shadow-lg text-center">
              <p className="text-2xl md:text-3xl font-semibold text-primary">{activeQuestion.answerText}</p>
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
