'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  noi_dung?: string;
  questionText?: string;
  cau_tra_loi_1?: string;
  cau_tra_loi_2?: string;
  cau_tra_loi_3?: string;
  cau_tra_loi_4?: string;
  cauTraLoi1?: string;
  cauTraLoi2?: string;
  cauTraLoi3?: string;
  cauTraLoi4?: string;
  correct_choice?: string;
  correctChoice?: string;
  explanation?: string;
  contentid?: string;
  contentId?: string;
  visible?: boolean;
  order_index?: number;
}

interface ContentQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  contentTitle: string;
}

interface QuestionContent {
  type: 'text' | 'image' | 'video' | 'audio';
  text?: string;
  url?: string;
}

// Helper function to parse JSON content
const parseJsonContent = (content: string): string => {
  if (!content) return '';
  
  if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
    try {
      const parsed = JSON.parse(content);
      
      if (parsed.type === 'text') {
        return parsed.text || '';
      }
      if (parsed.type === 'image') {
        return parsed.image || '';
      }
      if (parsed.type === 'video') {
        return parsed.video || '';
      }
      if (parsed.type === 'audio') {
        return parsed.audio || '';
      }
      if (parsed.text) {
        return parsed.text;
      }
      
      if (Object.keys(parsed).length === 0 || 
          (parsed.type === 'text' && !parsed.text) ||
          (!parsed.type && !parsed.text)) {
        return '';
      }
      
      return content;
    } catch (e) {
      return content;
    }
  }
  
  return content;
};

// Helper function to parse content that might contain multimedia
const parseQuestionContent = (content: string): QuestionContent => {
  if (!content) return { type: 'text', text: '' };
  
  const parsedContent = parseJsonContent(content);
  
  // Check if content contains image URL
  const imageRegex = /\.(jpg|jpeg|png|gif|webp)$/i;
  if (imageRegex.test(parsedContent.trim()) ||
      parsedContent.includes('upload.wikimedia.org') ||
      parsedContent.includes('images.squarespace-cdn.com') ||
      parsedContent.includes('giphy.com')) {
    return { type: 'image', url: parsedContent.trim() };
  }
  
  // Check if content contains video URL
  const videoRegex = /\.(mp4|webm|ogg|mov)$/i;
  if (videoRegex.test(parsedContent.trim()) || parsedContent.includes('youtube.com') || parsedContent.includes('youtu.be')) {
    return { type: 'video', url: parsedContent.trim() };
  }
  
  // Check if content contains audio URL
  const audioRegex = /\.(mp3|wav|ogg|m4a)$/i;
  if (audioRegex.test(parsedContent.trim())) {
    return { type: 'audio', url: parsedContent.trim() };
  }
  
  return { type: 'text', text: parsedContent };
};

// Component to render multimedia content with proper constraints
function MediaContent({ content, className = "", isCompact = false, isQuestionImage = false }: { content: QuestionContent; className?: string; isCompact?: boolean; isQuestionImage?: boolean }) {
  switch (content.type) {
    case 'image':
      return (
        <img
          src={content.url}
          alt="Content"
          className={`object-contain rounded-lg ${className}`}
          style={{
            // For question images: constrain to container, never exceed 100% of parent
            maxHeight: isQuestionImage ? '100%' : (isCompact ? '80px' : '100px'),
            maxWidth: isQuestionImage ? '100%' : (isCompact ? 'auto' : '100%'),
            width: 'auto',
            height: 'auto',
            // Ensure image never forces container to grow beyond bounds
            objectFit: 'contain'
          }}
        />
      );
    case 'video':
      return (
        <video
          src={content.url}
          controls
          className={`max-w-full max-h-full rounded-lg object-contain ${className}`}
          style={{ 
            maxHeight: isQuestionImage ? '100%' : (isCompact ? '80px' : '100px'),
            maxWidth: '100%',
            width: 'auto',
            height: 'auto'
          }}
        >
          Your browser does not support the video tag.
        </video>
      );
    case 'audio':
      return (
        <audio
          src={content.url}
          controls
          className={`w-full ${className}`}
        >
          Your browser does not support the audio tag.
        </audio>
      );
    default:
      return (
        <div className={className}>
          <MarkdownRenderer content={content.text || ''} />
        </div>
      );
  }
}

// Helper functions to get question data
const getQuestionText = (question: Question): string => {
  const rawText = question.noi_dung || question.questionText || '';
  const parsed = parseJsonContent(rawText);
  return parsed || 'Question text not available';
};

const getAnswerChoice = (question: Question, choiceNumber: number): string => {
  let rawText = '';
  
  switch (choiceNumber) {
    case 1:
      rawText = question.cau_tra_loi_1 || question.cauTraLoi1 || '';
      break;
    case 2:
      rawText = question.cau_tra_loi_2 || question.cauTraLoi2 || '';
      break;
    case 3:
      rawText = question.cau_tra_loi_3 || question.cauTraLoi3 || '';
      break;
    case 4:
      rawText = question.cau_tra_loi_4 || question.cauTraLoi4 || '';
      break;
    default:
      return '';
  }
  
  const parsed = parseJsonContent(rawText);
  return parsed || '';
};

const getCorrectChoice = (question: Question): string => {
  return question.correct_choice || question.correctChoice || '1';
};

const getExplanation = (question: Question): string => {
  const rawText = question.explanation || 'No explanation available.';
  const parsed = parseJsonContent(rawText);
  return parsed || 'No explanation available.';
};

export default function ContentQuizModal({
  isOpen,
  onClose,
  questions,
  contentTitle
}: ContentQuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: string }>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const { toast } = useToast();

  const currentQuestion = questions?.[currentQuestionIndex];
  const progress = questions?.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  // Get available answer choices (filter out empty ones)
  const availableChoices = currentQuestion ? [
    { key: '1', content: getAnswerChoice(currentQuestion, 1), label: 'A' },
    { key: '2', content: getAnswerChoice(currentQuestion, 2), label: 'B' },
    { key: '3', content: getAnswerChoice(currentQuestion, 3), label: 'C' },
    { key: '4', content: getAnswerChoice(currentQuestion, 4), label: 'D' }
  ].filter(choice => choice.content.trim() !== '') : [];

  // Reset quiz state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowFeedback(false);
    }
  }, [isOpen]);

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback || !currentQuestion) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
    
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowFeedback(false);
    } else {
      toast({
        title: "Quiz Completed!",
        description: `You have finished the quiz for "${contentTitle}".`,
        duration: 3000,
      });
      onClose();
    }
  };

  const handleShowContent = () => {
    toast({
      title: "Showing Content",
      description: "This feature would open the associated content.",
      duration: 2000,
    });
    onClose();
  };

  const isCorrectAnswer = (choiceKey: string) => {
    return currentQuestion ? getCorrectChoice(currentQuestion) === choiceKey : false;
  };

  const getSelectedAnswer = () => {
    return currentQuestion ? selectedAnswers[currentQuestion.id] : null;
  };

  if (!isOpen) return null;
  
  if (!questions || questions.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">No Quiz Available</h2>
            <p className="text-gray-600 mb-4">There are no questions available for this content yet.</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!currentQuestion) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Quiz Error</h2>
            <p className="text-gray-600">Unable to load question {currentQuestionIndex + 1}. Please try again.</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const selectedAnswer = getSelectedAnswer();
  const questionContent = parseQuestionContent(getQuestionText(currentQuestion));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[100vh] md:h-[90vh] p-0 bg-gray-50 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 bg-white border-b flex-shrink-0">
            <div className="flex items-center gap-4 md:gap-6">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-blue-600">
                Question {currentQuestionIndex + 1}/{questions.length}
              </h2>
              
              {/* Navigation Dots */}
              <div className="flex items-center gap-1 md:gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium transition-all ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : selectedAnswers[questions[index].id]
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    onClick={() => {
                      if (index <= currentQuestionIndex) {
                        setCurrentQuestionIndex(index);
                        setShowFeedback(!!selectedAnswers[questions[index].id]);
                      }
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowContent}
                className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700 px-2 md:px-3 py-1 h-6 md:h-7 text-xs font-medium"
              >
                Show Content
              </Button>

              <Button
                onClick={handleNext}
                disabled={!selectedAnswer}
                size="sm"
                className="bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 px-2 md:px-3 py-1 h-6 md:h-7 text-xs font-medium flex items-center gap-1"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              
              {/* Progress */}
              <div className="text-right">
                <div className="text-xs text-gray-600">Progress</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-orange-600">0%</span>
                  <div className="w-12 md:w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-orange-600">{Math.round(progress)}%</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600 h-6 w-6 md:h-8 md:w-8"
                onClick={onClose}
              >
                <X className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>

          {/* Feedback Dialog */}
          {showFeedback && (
            <div className={`mx-4 md:mx-6 mb-4 p-3 rounded-lg border-2 shadow-lg ${
              isCorrectAnswer(selectedAnswer || '')
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                  isCorrectAnswer(selectedAnswer || '')
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {isCorrectAnswer(selectedAnswer || '') ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-sm mb-1 ${
                    isCorrectAnswer(selectedAnswer || '')
                      ? 'text-green-700'
                      : 'text-red-700'
                  }`}>
                    {isCorrectAnswer(selectedAnswer || '') ? 'Correct' : 'Incorrect'}
                  </h4>
                  <p className="text-xs text-gray-700">
                    {getExplanation(currentQuestion)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content Area - Perfect 50/50 Split with Overflow Control */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Question Content Area - Exactly 50% with strict height constraint */}
            <div className="h-1/2 p-4 md:p-6 overflow-hidden bg-white border-b">
              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                {questionContent.type === 'image' ? (
                  <div className="w-full h-full flex items-center justify-center overflow-hidden">
                    <MediaContent content={questionContent} isQuestionImage={true} />
                  </div>
                ) : (
                  <div className="text-lg md:text-2xl font-bold text-blue-600 text-center overflow-auto">
                    <MediaContent content={questionContent} />
                  </div>
                )}
              </div>
            </div>

            {/* Answer Choices Area - Exactly 50% with strict height constraint */}
            <div className="h-1/2 p-4 md:p-6 flex items-center justify-center bg-gray-50 overflow-hidden">
              <div className="w-full max-w-6xl h-full">
                <div className={`grid gap-3 md:gap-4 h-full ${
                  availableChoices.length === 4 ? 'grid-cols-4' :
                  availableChoices.length === 3 ? 'grid-cols-3' :
                  availableChoices.length === 2 ? 'grid-cols-2' :
                  'grid-cols-1'
                }`}>
                  {availableChoices.map((choice) => {
                    const isSelected = selectedAnswer === choice.key;
                    const isCorrect = isCorrectAnswer(choice.key);
                    const showCorrect = showFeedback && isCorrect;
                    const showIncorrect = showFeedback && isSelected && !isCorrect;
                    const choiceContent = parseQuestionContent(choice.content);
                    
                    return (
                      <button
                        key={choice.key}
                        onClick={() => handleAnswerSelect(choice.key)}
                        disabled={showFeedback}
                        className={`p-3 md:p-4 rounded-lg border-2 text-left transition-all relative h-full overflow-hidden ${
                          showCorrect
                            ? 'border-green-500 bg-green-50'
                            : showIncorrect
                            ? 'border-red-500 bg-red-50'
                            : isSelected && !showFeedback
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                        } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-2 md:gap-3 h-full">
                          <div className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full border-2 font-medium text-xs md:text-sm flex-shrink-0 ${
                            showCorrect
                              ? 'border-green-500 bg-green-500 text-white'
                              : showIncorrect
                              ? 'border-red-500 bg-red-500 text-white'
                              : isSelected && !showFeedback
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-gray-400 text-gray-600'
                          }`}>
                            {choice.label}
                          </div>
                          <div className="flex-1 flex items-center justify-center overflow-hidden">
                            <MediaContent 
                              content={choiceContent} 
                              className="font-medium text-sm md:text-base text-center" 
                              isCompact={true}
                            />
                          </div>
                          {showCorrect && (
                            <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600 absolute top-2 right-2" />
                          )}
                          {showIncorrect && (
                            <X className="h-4 w-4 md:h-5 md:w-5 text-red-600 absolute top-2 right-2" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
