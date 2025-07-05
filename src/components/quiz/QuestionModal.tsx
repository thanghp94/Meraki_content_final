'use client';

import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import ContentRenderer from './ContentRenderer';
import TextToSpeechButton from '@/components/ui/text-to-speech-button';

// Helper function to play sound
const playSound = (soundFile: string) => {
  try {
    const audio = new Audio(soundFile);
    audio.play().catch(error => {
      // Autoplay was prevented or another error occurred
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
    setShowAnswer(false);
  };

  const handleShowAnswer = () => {
    playSound('/sounds/reveal.mp3');
    setShowAnswer(true);
  };
  
  const handleClose = () => {
    setShowAnswer(false); 
    closeQuestionModal(); 
  };

  // Check if any answer choices contain images
  const hasImageChoices = [
    activeQuestion.cauTraLoi1,
    activeQuestion.cauTraLoi2,
    activeQuestion.cauTraLoi3,
    activeQuestion.cauTraLoi4
  ].some(choice => choice && choice.includes('http'));

  return (
    <Dialog open={!!activeQuestion} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="!fixed !inset-0 !w-screen !h-screen !translate-x-0 !translate-y-0 !left-0 !top-0 bg-card shadow-2xl rounded-none p-0 overflow-hidden flex flex-col max-w-none">
        {/* Points Header - Responsive with viewport units */}
        <div className="bg-primary text-primary-foreground p-[2vh] flex justify-center items-center relative">
          <h1 className="text-[4vw] md:text-[3vw] lg:text-[2.5vw] font-bold">{activeQuestion.points}</h1>
          {/* TTS for entire question */}
          <div className="absolute right-[2vh] top-1/2 transform -translate-y-1/2">
            <TextToSpeechButton
              text={`Question for ${activeQuestion.points} points: ${activeQuestion.questionText}. ${
                activeQuestion.cauTraLoi1 ? `Option A: ${activeQuestion.cauTraLoi1}. ` : ''
              }${
                activeQuestion.cauTraLoi2 ? `Option B: ${activeQuestion.cauTraLoi2}. ` : ''
              }${
                activeQuestion.cauTraLoi3 ? `Option C: ${activeQuestion.cauTraLoi3}. ` : ''
              }${
                activeQuestion.cauTraLoi4 ? `Option D: ${activeQuestion.cauTraLoi4}.` : ''
              }`}
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/20"
              iconOnly={true}
              rate={0.9}
            />
          </div>
        </div>
        
        {/* Main Content Area - Flexbox layout */}
        <div className="flex-1 flex flex-col p-[2vh] overflow-y-auto relative">
          {/* Question Text - Improved responsive typography */}
          <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground text-center mb-[3vh] leading-tight relative z-30">
            <ContentRenderer 
              content={activeQuestion.questionText}
              textClassName="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground text-center leading-tight"
              imageClassName="w-full max-h-[25vh] my-[2vh] relative z-30"
              alt="Question content"
            />
          </div>

          {/* Question Media - Responsive sizing */}
          {media && (media.type === 'image' || media.type === 'gif') && (
            <div className="w-full max-w-[80vw] mx-auto aspect-video mb-[2vh] rounded-md overflow-hidden shadow-md bg-muted relative z-30">
              <img
                src={media.url}
                alt={media.alt || "Question media"}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Answer Choices Grid - Adaptive layout */}
          {(activeQuestion.cauTraLoi1 || activeQuestion.cauTraLoi2 || activeQuestion.cauTraLoi3 || activeQuestion.cauTraLoi4) && (
            <div className={`w-full grid gap-[2vh] mt-[3vh] relative z-20 ${
              hasImageChoices 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
                : 'grid-cols-1 md:grid-cols-2'
            }`}>
              {[
                { answer: activeQuestion.cauTraLoi1, letter: 'A', choice: '1', color: 'from-blue-50 to-blue-100 border-blue-300 hover:border-blue-400' },
                { answer: activeQuestion.cauTraLoi2, letter: 'B', choice: '2', color: 'from-indigo-50 to-violet-100 border-indigo-300 hover:border-indigo-400' },
                { answer: activeQuestion.cauTraLoi3, letter: 'C', choice: '3', color: 'from-orange-50 to-orange-100 border-orange-300 hover:border-orange-400' },
                { answer: activeQuestion.cauTraLoi4, letter: 'D', choice: '4', color: 'from-rose-50 to-pink-100 border-rose-300 hover:border-rose-400' },
              ].map((item, index) => item.answer && (
                <div
                  key={index}
                  className={`relative p-[2vh] rounded-xl border-2 shadow-lg hover:shadow-xl transition-all ${
                    showAnswer && activeQuestion.correctChoice === item.choice
                      ? 'bg-green-50 border-green-500 text-green-800'
                      : `bg-gradient-to-br ${item.color} text-gray-800`
                  }`}
                >
                  {/* Choice Letter Badge - Responsive sizing */}
                  <div className="absolute left-[1vh] top-[1vh] w-[5vh] h-[5vh] rounded-full bg-white flex items-center justify-center shadow-md border-2 border-blue-500">
                    <span className="text-[2.5vh] font-bold text-blue-600">{item.letter}</span>
                  </div>
                  
                  {/* Choice Content - Flexible container */}
                  <div className="flex items-center justify-center min-h-[8vh] pl-[7vh] text-center">
                    <ContentRenderer 
                      content={item.answer}
                      textClassName="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold"
                      imageClassName="w-full h-[12vh] md:h-[15vh]"
                      alt={`Choice ${item.letter} content`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Answer Explanation - Conditional display */}
          {showAnswer && (activeQuestion.answerText || activeQuestion.answer || activeQuestion.explanation) && (
            <div className="w-full max-w-[80vw] mx-auto p-[2vh] my-[2vh] border border-border rounded-xl bg-card shadow-lg text-center">
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-primary mb-[1vh]">Correct Answer:</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary">
                {activeQuestion.answerText || activeQuestion.answer}
              </p>
              {activeQuestion.explanation && (
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground mt-[1vh]">
                  {activeQuestion.explanation}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="p-[2vh] bg-muted/50 flex justify-center gap-[2vh]">
          {!showAnswer ? (
            <Button onClick={handleShowAnswer} variant="outline" size="lg" className="text-[2vh] px-[3vh] py-[1vh]">
              <Eye className="mr-[1vh] h-[2.5vh] w-[2.5vh]" /> Reveal Answer
            </Button>
          ) : (
            <>
              <Button
                onClick={() => handleAdjudication(true)}
                className="bg-green-600 hover:bg-green-700 text-white text-[2vh] px-[3vh] py-[1vh]"
                size="lg"
              >
                <CheckCircle className="mr-[1vh] h-[2.5vh] w-[2.5vh]" /> Correct
              </Button>
              <Button
                onClick={() => handleAdjudication(false)}
                variant="destructive"
                size="lg"
                className="text-[2vh] px-[3vh] py-[1vh]"
              >
                <XCircle className="mr-[1vh] h-[2.5vh] w-[2.5vh]" /> Incorrect
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
