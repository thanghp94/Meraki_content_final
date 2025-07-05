'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Play, Volume2, CheckCircle, XCircle } from 'lucide-react';
import TextToSpeechButton from '@/components/ui/text-to-speech-button';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  noi_dung: string;
  cau_tra_loi_1: string;
  cau_tra_loi_2: string;
  cau_tra_loi_3: string;
  cau_tra_loi_4: string;
  correct_choice: string;
  explanation: string;
  contentid: string;
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

// Helper function to parse content that might contain multimedia
const parseQuestionContent = (content: string): QuestionContent => {
  if (!content) return { type: 'text', text: '' };
  
  // Check if content contains image URL
  const imageRegex = /\.(jpg|jpeg|png|gif|webp)$/i;
  if (imageRegex.test(content.trim())) {
    return { type: 'image', url: content.trim() };
  }
  
  // Check if content contains video URL
  const videoRegex = /\.(mp4|webm|ogg|mov)$/i;
  if (videoRegex.test(content.trim()) || content.includes('youtube.com') || content.includes('youtu.be')) {
    return { type: 'video', url: content.trim() };
  }
  
  // Check if content contains audio URL
  const audioRegex = /\.(mp3|wav|ogg|m4a)$/i;
  if (audioRegex.test(content.trim())) {
    return { type: 'audio', url: content.trim() };
  }
  
  // Default to text
  return { type: 'text', text: content };
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
        />
      );
    case 'video':
      return (
        <video 
          src={content.url} 
          controls 
          className={`max-w-full h-auto rounded-lg ${className}`}
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

export default function ContentQuizModal({ 
  isOpen, 
  onClose, 
  questions, 
  contentTitle 
}: ContentQuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Reset quiz state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowResults(false);
      setQuizCompleted(false);
    }
  }, [isOpen]);

  const handleAnswerSelect = (answer: string) => {
    if (quizCompleted) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const getScore = () => {
    let correct = 0;
    questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correct_choice) {
        correct++;
      }
    });
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
  };

  const isAnswerCorrect = (questionId: string, answer: string) => {
    const question = questions.find(q => q.id === questionId);
    return question?.correct_choice === answer;
  };

  const getChoiceLabel = (index: number) => {
    return ['A', 'B', 'C', 'D'][index];
  };

  if (!isOpen || questions.length === 0) return null;

  const score = getScore();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Quiz: {contentTitle}</h2>
              {!showResults && (
                <Badge variant="secondary" className="bg-white text-blue-600">
                  Question {currentQuestionIndex + 1}/{questions.length}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {!showResults && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Progress</span>
                  <Progress value={progress} className="w-24 bg-blue-500" />
                  <span className="text-sm">{Math.round(progress)}%</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-700"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {showResults ? (
              // Results View
              <div className="p-8 h-full overflow-y-auto">
                <div className="max-w-2xl mx-auto text-center">
                  <div className="mb-8">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                      score.percentage >= 70 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {score.percentage >= 70 ? (
                        <CheckCircle className="h-10 w-10" />
                      ) : (
                        <XCircle className="h-10 w-10" />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      {score.percentage >= 70 ? 'Great Job!' : 'Keep Practicing!'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You scored {score.correct} out of {score.total} questions correctly
                    </p>
                    <div className="text-4xl font-bold text-blue-600 mb-6">
                      {score.percentage}%
                    </div>
                  </div>

                  {/* Question Review */}
                  <div className="space-y-4 text-left">
                    <h4 className="text-lg font-semibold mb-4">Review Your Answers</h4>
                    {questions.map((question, index) => {
                      const userAnswer = selectedAnswers[question.id];
                      const isCorrect = isAnswerCorrect(question.id, userAnswer);
                      const questionContent = parseQuestionContent(question.noi_dung);
                      
                      return (
                        <div key={question.id} className={`p-4 rounded-lg border-2 ${
                          isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }`}>
                          <div className="flex items-start gap-3 mb-3">
                            <Badge variant={isCorrect ? 'default' : 'destructive'} className="mt-1">
                              {index + 1}
                            </Badge>
                            <div className="flex-1">
                              <MediaContent content={questionContent} className="mb-2" />
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium">Your answer:</span>
                                <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                  {getChoiceLabel(parseInt(userAnswer) - 1)} - {
                                    userAnswer === '1' ? question.cau_tra_loi_1 :
                                    userAnswer === '2' ? question.cau_tra_loi_2 :
                                    userAnswer === '3' ? question.cau_tra_loi_3 :
                                    question.cau_tra_loi_4
                                  }
                                </span>
                                {!isCorrect && (
                                  <>
                                    <span className="text-gray-500">|</span>
                                    <span className="font-medium">Correct:</span>
                                    <span className="text-green-600">
                                      {getChoiceLabel(parseInt(question.correct_choice) - 1)} - {
                                        question.correct_choice === '1' ? question.cau_tra_loi_1 :
                                        question.correct_choice === '2' ? question.cau_tra_loi_2 :
                                        question.correct_choice === '3' ? question.cau_tra_loi_3 :
                                        question.cau_tra_loi_4
                                      }
                                    </span>
                                  </>
                                )}
                              </div>
                              {question.explanation && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                  <span className="font-medium">Explanation:</span> {question.explanation}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 flex gap-4 justify-center">
                    <Button onClick={onClose} variant="outline">
                      Close Quiz
                    </Button>
                    <Button onClick={() => {
                      setCurrentQuestionIndex(0);
                      setSelectedAnswers({});
                      setShowResults(false);
                      setQuizCompleted(false);
                    }}>
                      Retake Quiz
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Question View
              <div className="p-8 h-full overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                  {/* Question */}
                  <div className="mb-8">
                    <div className="flex items-start gap-4 mb-6">
                      <Badge variant="outline" className="text-lg px-3 py-1 mt-1">
                        {currentQuestionIndex + 1}
                      </Badge>
                      <div className="flex-1">
                        <MediaContent 
                          content={parseQuestionContent(currentQuestion.noi_dung)} 
                          className="text-xl font-medium text-gray-800"
                        />
                        <div className="mt-2">
                          <TextToSpeechButton
                            text={currentQuestion.noi_dung}
                            variant="ghost"
                            size="sm"
                            iconOnly={true}
                            className="h-8 w-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Answer Choices */}
                  <div className="space-y-4 mb-8">
                    {[
                      { key: '1', content: currentQuestion.cau_tra_loi_1, label: 'A' },
                      { key: '2', content: currentQuestion.cau_tra_loi_2, label: 'B' },
                      { key: '3', content: currentQuestion.cau_tra_loi_3, label: 'C' },
                      { key: '4', content: currentQuestion.cau_tra_loi_4, label: 'D' }
                    ].map((choice) => {
                      const isSelected = selectedAnswers[currentQuestion.id] === choice.key;
                      const choiceContent = parseQuestionContent(choice.content);
                      
                      return (
                        <button
                          key={choice.key}
                          onClick={() => handleAnswerSelect(choice.key)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-blue-300 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-medium ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-500 text-white' 
                                : 'border-gray-300 text-gray-600'
                            }`}>
                              {choice.label}
                            </div>
                            <div className="flex-1">
                              <MediaContent content={choiceContent} />
                              <div className="mt-2">
                                <TextToSpeechButton
                                  text={choice.content}
                                  variant="ghost"
                                  size="sm"
                                  iconOnly={true}
                                  className="h-6 w-6"
                                />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      {questions.map((_, index) => (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-full ${
                            index === currentQuestionIndex
                              ? 'bg-blue-500'
                              : selectedAnswers[questions[index].id]
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      onClick={handleNext}
                      disabled={!selectedAnswers[currentQuestion.id]}
                      className="flex items-center gap-2"
                    >
                      {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next'}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
