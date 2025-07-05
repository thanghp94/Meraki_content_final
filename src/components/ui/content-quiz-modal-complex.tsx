'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // Badge is not used in the original code, but kept if you intend to use it.
import { X, Check, AlertCircle } from 'lucide-react';
import TextToSpeechButton from '@/components/ui/text-to-speech-button';
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

// Helper function to parse JSON content with better handling
const parseJsonContent = (content: string): string => {
  if (!content) return '';

  // If it looks like JSON, try to parse it
  if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
    try {
      const parsed = JSON.parse(content);

      // Handle different JSON structures
      if (parsed.type === 'text') {
        return parsed.text || '';
      }
      if (parsed.type === 'image') {
        return parsed.image || ''; // Return the image URL directly
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

      // If it's an empty JSON object or has no meaningful content, return empty string
      if (Object.keys(parsed).length === 0 ||
          (parsed.type === 'text' && !parsed.text) ||
          (!parsed.type && !parsed.text)) {
        return '';
      }

      // Return the original content if we can't parse it meaningfully
      return content;
    } catch (e) {
      // If JSON parsing fails, return the original content
      return content;
    }
  }

  return content;
};

// Helper function to parse content that might contain multimedia
const parseQuestionContent = (content: string): QuestionContent => {
  if (!content) return { type: 'text', text: '' };

  // First parse JSON if needed
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

  // Default to text
  return { type: 'text', text: parsedContent };
};

// Component to render multimedia content
function MediaContent({ content, className = "", isCompact = false, isQuestionImage = false }: { content: QuestionContent; className?: string; isCompact?: boolean; isQuestionImage?: boolean }) {
  switch (content.type) {
    case 'image':
      return (
        // For question image, allow it to fill height/width of its flex container
        // For answer choices, keep it compact
        <img
          src={content.url}
          alt="Content"
          className={`object-contain ${className}`}
          style={{
            maxHeight: isQuestionImage ? '100%' : (isCompact ? '60px' : '100px'), // Adjusted maxHeight for answers
            width: isQuestionImage ? '100%' : 'auto',
            height: isQuestionImage ? '100%' : 'auto'
          }}
        />
      );
    case 'video':
      return (
        <video
          src={content.url}
          controls
          className={`max-w-full h-auto rounded-lg ${className}`}
          style={{ maxHeight: isQuestionImage ? '100%' : (isCompact ? '60px' : '100px') }}
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

// Helper functions to get question data regardless of structure
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
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { toast } = useToast();
  const dialogContentRef = useRef<HTMLDivElement>(null); // Ref for feedback overlay positioning

  // Debug logging
  useEffect(() => {
    console.log('ContentQuizModal props:', { isOpen, questions, contentTitle });
    console.log('Questions length:', questions?.length);
    console.log('First question:', questions?.[0]);
  }, [isOpen, questions, contentTitle]);

  const currentQuestion = questions?.[currentQuestionIndex];
  const progress = questions?.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  // Get available answer choices (filter out empty ones)
  const availableChoices = currentQuestion ? [
    { key: '1', content: getAnswerChoice(currentQuestion, 1), label: 'A' },
    { key: '2', content: getAnswerChoice(currentQuestion, 2), label: 'B' },
    { key: '3', content: getAnswerChoice(currentQuestion, 3), label: 'C' },
    { key: '4', content: getAnswerChoice(currentQuestion, 4), label: 'D' }
  ].filter(choice => choice.content.trim() !== '') : [];

  // Check if current question content is an image
  const isQuestionContentImage = parseQuestionContent(getQuestionText(currentQuestion)).type === 'image';
  // Check if any answer choice is an image
  const hasImageAnswers = availableChoices.some(choice => parseQuestionContent(choice.content).type === 'image');

  // Reset quiz state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowFeedback(false);
      setQuizCompleted(false);
    }
  }, [isOpen]);

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback || !currentQuestion) return;

    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    // Show feedback immediately after selection
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowFeedback(false);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      toast({
        title: "Quiz Completed!",
        description: `You have finished the quiz for "${contentTitle}".`,
        duration: 3000,
      });
      onClose(); // Close the quiz
    }
  };

  const handleShowContent = () => {
    // This would trigger a separate content modal/page - for now just close quiz
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

  // Show debug info if no questions
  if (!isOpen) return null;

  if (!questions || questions.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
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
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
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
  const questionText = getQuestionText(currentQuestion);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* DialogContent takes full screen on small/medium, fixed height on large */}
      <DialogContent ref={dialogContentRef} className="max-w-7xl w-full h-[100vh] md:h-[90vh] p-0 flex flex-col bg-gray-50 relative overflow-hidden">
        {/* Header - Always visible, compact */}
        <div className="flex items-center justify-between p-3 md:p-4 bg-white border-b border-gray-200 flex-shrink-0 relative z-10">
          {/* Left: Question Number & Navigation Dots */}
          <div className="flex items-center gap-3">
            <h2 className="text-base md:text-lg font-bold text-blue-600 flex-shrink-0">
              Q{currentQuestionIndex + 1}/{questions.length}
            </h2>
            <div className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-1 hide-scrollbar"> {/* Added overflow-x-auto */}
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all flex-shrink-0 ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white shadow'
                      : selectedAnswers[q.id]
                      ? (isCorrectAnswer(selectedAnswers[q.id]) ? 'bg-green-500 text-white' : 'bg-red-500 text-white') // Show correct/incorrect dot
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  onClick={() => {
                    // Allow navigation to previous questions, but not future ones unless completed
                    if (index <= currentQuestionIndex || quizCompleted) {
                      setCurrentQuestionIndex(index);
                      setShowFeedback(!!selectedAnswers[questions[index].id]);
                    } else {
                        toast({
                            title: "Cannot jump ahead",
                            description: "Please complete the current question before moving to the next.",
                            variant: "destructive"
                        });
                    }
                  }}
                  title={`Question ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Action Buttons, Progress, Close */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <TextToSpeechButton text={questionText} className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 md:h-8 md:w-8" iconSize={16} /> {/* Compact TTS button */}

            <Button
              variant="outline"
              size="sm"
              onClick={handleShowContent}
              className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700 px-3 h-7 text-xs font-medium"
            >
              Show Content
            </Button>

            <Button
              onClick={handleNext}
              disabled={!selectedAnswer && !quizCompleted} // Allow 'Finish' even if no answer if quiz completed
              size="sm"
              className="bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 px-3 h-7 text-xs font-medium flex items-center gap-1"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 text-xs font-medium text-orange-600 flex-shrink-0">
              <span className="hidden md:inline">Progress:</span> {Math.round(progress)}%
              <div className="w-12 h-2 bg-gray-200 rounded-full hidden md:block">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-600 h-7 w-7 md:h-8 md:w-8 flex-shrink-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content Area - Split 50/50 */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Question Content Area (Top Half) */}
          <div className="relative flex-1 p-4 md:p-6 flex items-center justify-center overflow-auto bg-white border-b border-gray-100 min-h-[50%] max-h-[50%]"> {/* Added min/max height for 50% split */}
            {isQuestionContentImage && questionContent.type === 'image' ? (
              // Scenario A: Image Question + Text Answers
              // Scenario C: Image Question + Image Answers
              // Layout: Image on one side, text on the other for question text
              <div className={`w-full h-full flex flex-col md:flex-row items-center justify-center gap-4`}>
                <div className="md:w-1/2 h-full flex items-center justify-center"> {/* Image takes 50% width on md+, fills height */}
                  <MediaContent content={questionContent} isQuestionImage={true} className="rounded-lg" />
                </div>
                <div className="md:w-1/2 flex items-center justify-center text-base md:text-lg lg:text-xl font-bold text-blue-800 text-center">
                  {/* Provide question text if available, even if it's an image question */}
                  <MarkdownRenderer content={questionText} />
                </div>
              </div>
            ) : (
              // Scenario B: Text Question + Any Answers
              // Question text displays prominently
              <div className="text-base md:text-lg lg:text-2xl font-bold text-blue-800 text-center max-w-full overflow-auto">
                <MediaContent content={questionContent} />
              </div>
            )}
          </div>

          {/* Answer Choices Area (Bottom Half) */}
          <div className="relative flex-1 p-4 md:p-6 flex items-center justify-center bg-gray-50 min-h-[50%] max-h-[50%] overflow-auto"> {/* Added min/max height for 50% split */}
            <div className="w-full max-w-6xl h-full"> {/* h-full to make cards fill container */}
                {/* Always grid-cols-4. If fewer choices, adjust items with auto-placement */}
                <div className={`grid grid-cols-4 gap-3 md:gap-4 lg:gap-5 h-full ${
                    // Center content if fewer than 4 choices and not filling entire row
                    availableChoices.length < 4 ? 'justify-center' : ''
                }`}>
                  {availableChoices.map((choice) => {
                    const isSelected = selectedAnswer === choice.key;
                    const isCorrect = isCorrectAnswer(choice.key);
                    const showCorrect = showFeedback && isCorrect;
                    const showIncorrect = showFeedback && isSelected && !isCorrect;
                    const choiceContent = parseQuestionContent(choice.content);

                    let colSpanClass = '';
                    if (availableChoices.length === 2) {
                        colSpanClass = 'col-span-2'; // Each takes 2 columns, so 2 choices fill 4 columns
                    } else if (availableChoices.length === 3) {
                        colSpanClass = 'col-span-1 md:col-span-1'; // Each takes 1 column, auto-distribute.
                                                            // For 3, it'll naturally occupy 3/4.
                                                            // For visual centering, you might add 'col-start-2' on the first one if you want exact center.
                    } else {
                        colSpanClass = 'col-span-1';
                    }
                    
                    return (
                      <button
                        key={choice.key}
                        onClick={() => handleAnswerSelect(choice.key)}
                        disabled={showFeedback}
                        className={`
                          relative flex flex-col items-center justify-center p-2 md:p-3 lg:p-4 rounded-lg border-2 text-left transition-all 
                          ${colSpanClass} h-full
                          ${
                            showCorrect
                              ? 'border-green-500 bg-green-50'
                              : showIncorrect
                              ? 'border-red-500 bg-red-50'
                              : isSelected && !showFeedback
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                          } 
                          ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <div className="flex items-center justify-center gap-1 md:gap-2 h-full w-full">
                          <div className={`flex items-center justify-center w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-full border-2 font-medium text-xs md:text-sm flex-shrink-0 ${
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
                              className="font-medium text-xs md:text-sm text-center"
                              isCompact={true}
                            />
                          </div>
                        </div>
                        {showCorrect && (
                          <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600 absolute top-2 right-2" />
                        )}
                        {showIncorrect && (
                          <X className="h-4 w-4 md:h-5 md:w-5 text-red-600 absolute top-2 right-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
            </div>
          </div>
        </div>

        {/* Feedback Overlay - positioned absolutely over content */}
        {showFeedback && (
          <div
            className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg p-3 rounded-lg border-2 shadow-lg z-20 ${
              isCorrectAnswer(selectedAnswer || '')
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                isCorrectAnswer(selectedAnswer || '')
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {isCorrectAnswer(selectedAnswer || '') ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <X className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className={`font-bold text-sm mb-1 ${
                  isCorrectAnswer(selectedAnswer || '')
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}>
                  {isCorrectAnswer(selectedAnswer || '') ? 'Correct' : 'Incorrect'}
                </h4>
                <p className="text-xs text-gray-700 line-clamp-2"> {/* line-clamp for compactness */}
                  {getExplanation(currentQuestion)}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}