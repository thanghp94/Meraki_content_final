'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Check, AlertCircle } from 'lucide-react';
import TextToSpeechButton from '@/components/ui/text-to-speech-button';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  // Support both old and new data structures
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
        return parsed.text || ''; // Return empty string if text is empty
      }
      if (parsed.type === 'image') {
        return parsed.image ? parsed.image : ''; // Return the image URL directly
      }
      if (parsed.type === 'video') {
        return parsed.video ? parsed.video : '';
      }
      if (parsed.type === 'audio') {
        return parsed.audio ? parsed.audio : '';
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
function MediaContent({ content, className = "" }: { content: QuestionContent; className?: string }) {
  switch (content.type) {
    case 'image':
      return (
        <img 
          src={content.url} 
          alt="Question content" 
          className={`max-w-full h-auto rounded-lg ${className}`}
          style={{ maxHeight: '120px', objectFit: 'cover' }}
        />
      );
    case 'video':
      return (
        <video 
          src={content.url} 
          controls 
          className={`max-w-full h-auto rounded-lg ${className}`}
          style={{ maxHeight: '120px' }}
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
  const rawText = question.noi_dung || question.questionText || 'Question text not available';
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
      return `Answer ${choiceNumber}`;
  }
  
  const parsed = parseJsonContent(rawText);
  
  // If parsing results in empty string, provide a default
  if (!parsed || parsed.trim() === '') {
    return `Answer ${choiceNumber}`;
  }
  
  return parsed;
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

  // Debug logging
  useEffect(() => {
    console.log('ContentQuizModal props:', { isOpen, questions, contentTitle });
    console.log('Questions length:', questions?.length);
    console.log('First question:', questions?.[0]);
  }, [isOpen, questions, contentTitle]);

  const currentQuestion = questions?.[currentQuestionIndex];
  const progress = questions?.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

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
      onClose(); // Close the quiz for now
    }
  };

  const handleShowContent = () => {
    // This would show the content modal - for now just close
    onClose();
  };

  const getChoiceLabel = (index: number) => {
    return ['A', 'B', 'C', 'D'][index];
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
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">No Quiz Available</h2>
            <p className="text-gray-600 mb-4">There are no questions available for this content.</p>
            <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
              <p><strong>Debug Info:</strong></p>
              <p>Content Title: {contentTitle}</p>
              <p>Questions: {questions ? `Array with ${questions.length} items` : 'null/undefined'}</p>
            </div>
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
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Quiz Error</h2>
            <p>Unable to load question {currentQuestionIndex + 1}. Please try again.</p>
            <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
              <p><strong>Debug Info:</strong></p>
              <p>Current Index: {currentQuestionIndex}</p>
              <p>Total Questions: {questions.length}</p>
              <p>Questions Array: {JSON.stringify(questions, null, 2)}</p>
            </div>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const selectedAnswer = getSelectedAnswer();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 bg-gray-50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-white border-b">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-blue-600">
                Question {currentQuestionIndex + 1}/{questions.length}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Progress</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-orange-600">0%</span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-orange-600">{Math.round(progress)}%</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Question Navigation Dots */}
          <div className="flex justify-center py-4 bg-white border-b">
            <div className="flex items-center gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
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

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <div className="p-8 h-full overflow-y-auto">
              <div className="max-w-5xl mx-auto">
                {/* Question */}
                <div className="mb-8">
                  <div className="text-2xl font-bold text-blue-600 mb-6">
                    <MediaContent content={parseQuestionContent(getQuestionText(currentQuestion))} />
                  </div>
                </div>

                {/* Answer Choices - 2x2 Grid */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {[
                    { key: '1', content: getAnswerChoice(currentQuestion, 1), label: 'A' },
                    { key: '2', content: getAnswerChoice(currentQuestion, 2), label: 'B' },
                    { key: '3', content: getAnswerChoice(currentQuestion, 3), label: 'C' },
                    { key: '4', content: getAnswerChoice(currentQuestion, 4), label: 'D' }
                  ].map((choice) => {
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
                        className={`p-4 rounded-lg border-2 text-left transition-all relative min-h-[120px] ${
                          showCorrect
                            ? 'border-green-500 bg-green-50'
                            : showIncorrect
                            ? 'border-red-500 bg-red-50'
                            : isSelected && !showFeedback
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                        } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-start gap-3 h-full">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-medium text-sm flex-shrink-0 ${
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
                          <div className="flex-1 flex items-center justify-center">
                            <MediaContent content={choiceContent} className="font-medium" />
                          </div>
                          {showCorrect && (
                            <Check className="h-5 w-5 text-green-600 absolute top-4 right-4" />
                          )}
                          {showIncorrect && (
                            <X className="h-5 w-5 text-red-600 absolute top-4 right-4" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Section */}
                {showFeedback && (
                  <div className={`p-4 rounded-lg border-2 mb-8 ${
                    isCorrectAnswer(selectedAnswer || '')
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
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
                      <div className="flex-1">
                        <h4 className={`font-bold text-lg mb-2 ${
                          isCorrectAnswer(selectedAnswer || '')
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}>
                          {isCorrectAnswer(selectedAnswer || '') ? 'Correct' : 'Incorrect'}
                        </h4>
                        <p className="text-gray-700">
                          {getExplanation(currentQuestion)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handleShowContent}
                    className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                  >
                    Show Content
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={!selectedAnswer}
                    className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
