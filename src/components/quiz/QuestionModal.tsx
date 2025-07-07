'use client';

import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import ContentRenderer from './ContentRenderer';
import TextToSpeechButton from '@/components/ui/text-to-speech-button';
import { getQuestionPoints } from '@/lib/pointsService';


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
  const questionPoints = getQuestionPoints(activeQuestion);

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
    activeQuestion.cau_tra_loi_1,
    activeQuestion.cau_tra_loi_2,
    activeQuestion.cau_tra_loi_3,
    activeQuestion.cau_tra_loi_4
  ].some(choice => choice && choice.includes('http'));

  return (
    <Dialog open={!!activeQuestion} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="!fixed !inset-0 !w-screen !h-screen !translate-x-0 !translate-y-0 !left-0 !top-0 bg-card shadow-2xl rounded-none p-0 overflow-hidden flex flex-col max-w-none">
        <DialogTitle className="sr-only">
          Question {questionPoints} Points
        </DialogTitle>
        {/* Points Header - Responsive with viewport units */}
        <div className="bg-primary text-primary-foreground p-[2vh] flex justify-center items-center relative">
          <h1 className="text-[4vw] md:text-[3vw] lg:text-[2.5vw] font-bold">{questionPoints}</h1>
          {/* TTS for entire question */}
          <div className="absolute right-[2vh] top-1/2 transform -translate-y-1/2">
            <TextToSpeechButton
             text={`Question for ${questionPoints} points: ${activeQuestion.noi_dung}. ${
              (activeQuestion.question_type === 'multiple_choice' || activeQuestion.question_type === 'text') ? `${
                activeQuestion.cau_tra_loi_1 ? `Option A: ${activeQuestion.cau_tra_loi_1}. ` : ''
              }${
                activeQuestion.cau_tra_loi_2 ? `Option B: ${activeQuestion.cau_tra_loi_2}. ` : ''
              }${
                activeQuestion.cau_tra_loi_3 ? `Option C: ${activeQuestion.cau_tra_loi_3}. ` : ''
              }${
                activeQuestion.cau_tra_loi_4 ? `Option D: ${activeQuestion.cau_tra_loi_4}.` : ''
              }` : ''
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
          {/* Question Section - Fixed height allocation */}
          <div className="flex-shrink-0 mb-[2vh]">
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground text-center leading-tight">
              <ContentRenderer 
                content={activeQuestion.noi_dung}
                textClassName="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground text-center leading-tight"
                imageClassName="w-auto max-w-[60vw] max-h-[25vh] mx-auto my-[1vh] object-contain"
                alt="Question content"
              />
            </div>
          </div>

          {/* Answer Choices Section - Flexible height */}
          <div className="flex-1 flex flex-col justify-center">
            {(activeQuestion.question_type === 'multiple_choice' || activeQuestion.question_type === 'one_choice') && (activeQuestion.cau_tra_loi_1 || activeQuestion.cau_tra_loi_2 || activeQuestion.cau_tra_loi_3 || activeQuestion.cau_tra_loi_4) && (
              <div className={`w-full grid gap-[2vh] ${
                hasImageChoices 
                  ? 'grid-cols-2 lg:grid-cols-4' 
                  : 'grid-cols-1 md:grid-cols-2'
              }`}>
                {[
                  { answer: activeQuestion.cau_tra_loi_1, letter: 'A', choice: '1', color: 'from-blue-50 to-blue-100 border-blue-300 hover:border-blue-400' },
                  { answer: activeQuestion.cau_tra_loi_2, letter: 'B', choice: '2', color: 'from-indigo-50 to-violet-100 border-indigo-300 hover:border-indigo-400' },
                  { answer: activeQuestion.cau_tra_loi_3, letter: 'C', choice: '3', color: 'from-orange-50 to-orange-100 border-orange-300 hover:border-orange-400' },
                  { answer: activeQuestion.cau_tra_loi_4, letter: 'D', choice: '4', color: 'from-rose-50 to-pink-100 border-rose-300 hover:border-rose-400' },
                ].map((item, index) => item.answer && (
                  <div
                    key={index}
                    className={`relative p-[1vh] rounded-xl border-2 shadow-lg hover:shadow-xl transition-all flex flex-col ${
                      showAnswer && activeQuestion.correctChoice === item.choice
                        ? 'bg-green-50 border-green-500 text-green-800'
                        : `bg-gradient-to-br ${item.color} text-gray-800`
                    }`}
                  >
                    {/* Choice Letter Badge */}
                    <div className="absolute left-[0.5vh] top-[0.5vh] w-[4vh] h-[4vh] rounded-full bg-white flex items-center justify-center shadow-md border-2 border-blue-500 z-10">
                      <span className="text-[2vh] font-bold text-blue-600">{item.letter}</span>
                    </div>
                    
                    {/* Choice Content - Flexible container */}
                    <div className="flex-1 flex items-center justify-center p-[1vh] pt-[3vh]">
                      <ContentRenderer 
                        content={item.answer}
                        textClassName="text-sm sm:text-base md:text-lg font-semibold text-center"
                        imageClassName="w-full h-full max-h-full object-contain"
                        alt={`Choice ${item.letter} content`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Answer Explanation - Conditional display */}
          {showAnswer && (
            <div className="w-full max-w-[80vw] mx-auto p-[2vh] my-[2vh] border border-border rounded-xl bg-card shadow-lg text-center">
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-primary mb-[1vh]">Correct Answer:</p>
              <div className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary">
                <ContentRenderer 
                  content={(() => {
                    // For multiple choice questions, show the actual choice content
                    if (activeQuestion.correctChoice && (activeQuestion.question_type === 'multiple_choice' || activeQuestion.question_type === 'one_choice')) {
                      const choiceMap: { [key: string]: string | undefined } = {
                        '1': activeQuestion.cau_tra_loi_1,
                        '2': activeQuestion.cau_tra_loi_2,
                        '3': activeQuestion.cau_tra_loi_3,
                        '4': activeQuestion.cau_tra_loi_4
                      };
                      const correctChoiceContent = choiceMap[activeQuestion.correctChoice];
                      if (correctChoiceContent) {
                        return correctChoiceContent;
                      }
                    }
                    // Fallback to answerText for text questions or when no choice content
                    return activeQuestion.answerText || activeQuestion.answer || '';
                  })()}
                  textClassName="text-xl sm:text-2xl md:text-3xl font-semibold text-primary"
                  imageClassName="w-auto max-w-[200px] max-h-[150px] mx-auto object-contain"
                  alt="Correct answer"
                />
              </div>

              {activeQuestion.explanation && (
                <div className="text-base sm:text-lg md:text-xl text-muted-foreground mt-[1vh]">
                  <ContentRenderer 
                    content={activeQuestion.explanation}
                    textClassName="text-base sm:text-lg md:text-xl text-muted-foreground"
                    imageClassName="w-full max-h-[15vh] my-[1vh]"
                    alt="Answer explanation"
                  />
                </div>
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
