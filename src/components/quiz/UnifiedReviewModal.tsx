'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight, BookOpen, HelpCircle, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import ContentRenderer from './ContentRenderer';
import TextToSpeechButton from '@/components/ui/text-to-speech-button';
import { useToast } from '@/hooks/use-toast';
import { extractVocabularyWords } from '@/lib/utils';
import { createErrorHandler } from '@/components/library/topics-by-unit/utils/errorHandling';
import { parseContentData, getContentText, getContentImage } from '@/types/question';

interface VocabularyItem {
  id: string;
  word: string;
  partOfSpeech: string;
  definition: string;
  exampleSentence?: string;
  phoneticTranscription?: string;
  imageUrl?: string;
  videoUrl?: string;
  tags?: string[];
}

interface QuestionItem {
  id: string;
  chuong_trinh: string;
  questionlevel: string;
  contentid: string;
  question_type: string;
  noi_dung: string;
  video?: string;
  picture?: string;
  cau_tra_loi_1: string;
  cau_tra_loi_2: string;
  cau_tra_loi_3: string;
  cau_tra_loi_4: string;
  correct_choice: string;
  time: string;
  explanation?: string;
  answer?: string;
  content_title?: string;
}

type ReviewItem = {
  type: 'vocabulary';
  data: VocabularyItem;
} | {
  type: 'question';
  data: QuestionItem;
};

interface ReviewSettings {
  includeVocabulary: boolean;
  includeQuestions: boolean;
}

interface UnifiedReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    id: string;
    title: string;
    infor1?: string;
    [key: string]: any;
  };
}

export default function UnifiedReviewModal({ isOpen, onClose, content }: UnifiedReviewModalProps): JSX.Element | null {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [settings, setSettings] = useState<ReviewSettings>({
    includeVocabulary: true,
    includeQuestions: true,
  });
  
  // Review state
  const [showContent, setShowContent] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [assessmentMode, setAssessmentMode] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  
  const { toast } = useToast();
  const errorHandler = createErrorHandler(toast);

  useEffect(() => {
    if (isOpen && content && !showSettings) {
      fetchReviewItems();
    }
  }, [isOpen, content, showSettings, settings]);

  useEffect(() => {
    // Reset states when modal opens or index changes
    if (isOpen) {
      setShowContent(false);
      setShowAnswer(false);
      setAssessmentMode(false);
      setSelectedChoice('');
    }
  }, [isOpen, currentIndex]);

  const fetchReviewItems = async () => {
    try {
      setLoading(true);
      const items: ReviewItem[] = [];

      // Fetch vocabulary if enabled
      if (settings.includeVocabulary) {
        console.log('=== VOCABULARY DEBUG START ===');
        console.log('Content object:', content);
        console.log('Content.infor1 raw:', content.infor1);
        console.log('Content.infor1 type:', typeof content.infor1);
        
        const vocabularyWords = extractVocabularyWords(content.infor1 || '');
        console.log('Extracted vocabulary words:', vocabularyWords);
        console.log('Vocabulary words length:', vocabularyWords.length);
        
        if (vocabularyWords.length > 0) {
          console.log('Making API call to /api/vocabulary/search with words:', vocabularyWords);
          
          try {
            const response = await fetch('/api/vocabulary/search', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ words: vocabularyWords }),
            });

            console.log('API response status:', response.status);
            console.log('API response ok:', response.ok);

            if (response.ok) {
              const data = await response.json();
              console.log('Full API response data:', data);
              const vocabularyItems = data.vocabularyItems || [];
              console.log('Vocabulary items found:', vocabularyItems.length);
              console.log('Vocabulary items:', vocabularyItems);
              
              vocabularyItems.forEach((vocab: VocabularyItem) => {
                console.log('Adding vocabulary item:', vocab.word);
                items.push({ type: 'vocabulary', data: vocab });
              });
            } else {
              const errorText = await response.text();
              console.error('Vocabulary API error:', response.status, response.statusText, errorText);
            }
          } catch (error) {
            console.error('Vocabulary API fetch error:', error);
          }
        } else {
          console.log('No vocabulary words extracted from content.infor1:', content.infor1);
        }
        console.log('=== VOCABULARY DEBUG END ===');
      }

      // Fetch questions if enabled
      if (settings.includeQuestions) {
        const response = await fetch(`/api/admin/questions?contentId=${content.id}`);
        
        if (response.ok) {
          const questions: QuestionItem[] = await response.json();
          questions.forEach((question) => {
            items.push({ type: 'question', data: question });
          });
        }
      }

      // Shuffle items for variety
      const shuffledItems = items.sort(() => Math.random() - 0.5);
      setReviewItems(shuffledItems);
      setCurrentIndex(0);
      
      if (shuffledItems.length === 0) {
        toast({
          title: 'No Review Items Found',
          description: 'No vocabulary or questions were found for this content.',
          variant: 'default',
        });
      }
    } catch (error) {
      errorHandler.handleVocabularyError(error, content.title);
      setReviewItems([]);
    } finally {
      setLoading(false);
    }
  };

  const currentItem = reviewItems[currentIndex];

  const goToNext = () => {
    if (currentIndex < reviewItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRevealContent = () => {
    setShowContent(true);
  };

  const handleToggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const handleChoiceSelect = (choice: string) => {
    setSelectedChoice(choice);
  };

  const handleAssessment = (isCorrect: boolean) => {
    console.log(`Assessment for item: ${isCorrect ? 'Correct' : 'Incorrect'}`);
    
    // Auto-advance to next item after assessment
    setTimeout(() => {
      if (currentIndex < reviewItems.length - 1) {
        goToNext();
      } else {
        // End of review session
        toast({
          title: 'Review Complete!',
          description: `You've reviewed all ${reviewItems.length} items.`,
          variant: 'default',
        });
      }
    }, 1000);
  };

  const handleStartReview = () => {
    if (!settings.includeVocabulary && !settings.includeQuestions) {
      toast({
        title: 'Selection Required',
        description: 'Please select at least one type of content to review.',
        variant: 'destructive',
      });
      return;
    }
    setShowSettings(false);
  };

  const handleClose = () => {
    setCurrentIndex(0);
    setShowContent(false);
    setShowAnswer(false);
    setAssessmentMode(false);
    setSelectedChoice('');
    setShowSettings(true);
    onClose();
  };

  const renderVocabularyItem = (vocab: VocabularyItem) => (
    <div className="flex-1 flex flex-col">
      {/* Image Section */}
      <div className="flex-1 flex items-center justify-center mb-[2vh]">
        {vocab.imageUrl ? (
          <div className="relative">
            <img
              src={vocab.imageUrl}
              alt="Vocabulary image"
              className="max-w-[60vw] max-h-[40vh] object-contain rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={!showContent ? handleRevealContent : undefined}
              onError={(e) => {
                console.error(`Failed to load image for word "${vocab.word}":`, vocab.imageUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
            {!showContent && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
                <div className="bg-white bg-opacity-90 px-4 py-2 rounded-full">
                  <p className="text-sm font-medium text-gray-700">Click to reveal word</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-gray-100 rounded-lg">
            <BookOpen className="h-24 w-24 text-gray-400 mb-4" />
            <p className="text-lg text-gray-600 mb-4">No image available</p>
            {!showContent && (
              <Button onClick={handleRevealContent} variant="outline" size="lg">
                <Eye className="h-4 w-4 mr-2" />
                Show Word
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Word Information */}
      {showContent && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-[2vh] animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h2 className="text-4xl font-bold text-blue-600">{vocab.word}</h2>
              <TextToSpeechButton
                text={vocab.word}
                variant="outline"
                size="sm"
                iconOnly={true}
              />
            </div>
            
            {vocab.phoneticTranscription && (
              <p className="text-lg text-gray-600 italic mb-2">
                /{vocab.phoneticTranscription}/
              </p>
            )}
            
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {vocab.partOfSpeech}
            </Badge>
          </div>

          {/* Definition Toggle */}
          <div className="text-center mb-4">
            <Button
              onClick={handleToggleAnswer}
              variant="outline"
              size="lg"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showAnswer ? 'Hide Definition' : 'Show Definition'}
            </Button>
          </div>

          {/* Definition and Example */}
          {showAnswer && (
            <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Definition</h3>
                <p className="text-gray-700">{vocab.definition}</p>
              </div>
              
              {vocab.exampleSentence && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Example</h3>
                  <p className="text-gray-700 italic">"{vocab.exampleSentence}"</p>
                </div>
              )}

              {/* Assessment Mode Toggle */}
              <div className="text-center pt-4">
                <Button
                  onClick={() => setAssessmentMode(!assessmentMode)}
                  variant={assessmentMode ? "default" : "outline"}
                  size="lg"
                >
                  {assessmentMode ? 'Exit Assessment' : 'Start Assessment'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderQuestionItem = (question: QuestionItem) => {
    const questionContent = parseContentData(question.noi_dung);
    const choices = [
      { key: '1', text: question.cau_tra_loi_1 },
      { key: '2', text: question.cau_tra_loi_2 },
      { key: '3', text: question.cau_tra_loi_3 },
      { key: '4', text: question.cau_tra_loi_4 },
    ].filter(choice => choice.text && choice.text.trim());

    return (
      <div className="flex-1 flex flex-col">
        {/* Question Section */}
        <div className="flex-1 flex flex-col items-center justify-center mb-[2vh]">
          {!showContent ? (
            <div className="text-center">
              <HelpCircle className="h-24 w-24 mx-auto mb-6 text-blue-500" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">Question Ready</h3>
              <Button onClick={handleRevealContent} variant="outline" size="lg">
                <Eye className="h-4 w-4 mr-2" />
                Show Question
              </Button>
            </div>
          ) : (
            <div className="w-full max-w-4xl">
              {/* Question Content */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="mb-4">
                  <Badge variant="outline" className="mb-2">
                    {question.question_type} • Level: {question.questionlevel}
                  </Badge>
                </div>
                
                <div className="mb-6">
                  <ContentRenderer content={questionContent} />
                  {question.picture && (
                    <img
                      src={question.picture}
                      alt="Question image"
                      className="mt-4 max-w-full h-auto rounded-lg shadow-md"
                    />
                  )}
                </div>

                {/* Multiple Choice Options */}
                {choices.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 mb-3">Choose your answer:</h4>
                    {choices.map((choice) => (
                      <button
                        key={choice.key}
                        onClick={() => handleChoiceSelect(choice.key)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                          selectedChoice === choice.key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-semibold mr-3">
                            {choice.key}
                          </span>
                          <span className="text-gray-800">{choice.text}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Show Answer Button */}
                <div className="text-center mt-6">
                  <Button
                    onClick={handleToggleAnswer}
                    variant="outline"
                    size="lg"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showAnswer ? 'Hide Answer' : 'Show Answer'}
                  </Button>
                </div>

                {/* Answer and Explanation */}
                {showAnswer && (
                  <div className="mt-6 space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-2">Correct Answer</h4>
                      <p className="text-gray-700">
                        Option {question.correct_choice}: {
                          choices.find(c => c.key === question.correct_choice)?.text || 'N/A'
                        }
                      </p>
                      {selectedChoice && (
                        <p className={`mt-2 font-medium ${
                          selectedChoice === question.correct_choice 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          Your answer: {selectedChoice === question.correct_choice ? 'Correct!' : 'Incorrect'}
                        </p>
                      )}
                    </div>
                    
                    {question.explanation && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Explanation</h4>
                        <p className="text-gray-700">{question.explanation}</p>
                      </div>
                    )}

                    {/* Assessment Mode Toggle */}
                    <div className="text-center pt-4">
                      <Button
                        onClick={() => setAssessmentMode(!assessmentMode)}
                        variant={assessmentMode ? "default" : "outline"}
                        size="lg"
                      >
                        {assessmentMode ? 'Exit Assessment' : 'Start Assessment'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="!fixed !inset-0 !w-screen !h-screen !translate-x-0 !translate-y-0 !left-0 !top-0 bg-card shadow-2xl rounded-none p-0 overflow-hidden flex flex-col max-w-none">
        <DialogTitle className="sr-only">
          Unified Review - {content.title}
        </DialogTitle>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-[2vh] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-[3vw] md:text-[2vw] lg:text-[1.5vw] font-bold">
                {showSettings ? 'Review Settings' : 'Unified Review'}
              </h1>
              <p className="text-[2vw] md:text-[1.5vw] lg:text-[1vw] opacity-90">{content.title}</p>
            </div>
          </div>
          
          {!showSettings && reviewItems.length > 0 && (
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white text-[2vh] px-4 py-2">
                {currentIndex + 1} / {reviewItems.length}
              </Badge>
              
              <Badge variant="outline" className="bg-white/10 border-white/30 text-white text-[1.5vh] px-3 py-1">
                {currentItem?.type === 'vocabulary' ? 'Vocabulary' : 'Question'}
              </Badge>
              
              {reviewItems.length > 1 && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={goToNext}
                    disabled={currentIndex === reviewItems.length - 1}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-[2vh] overflow-y-auto">
          {showSettings ? (
            /* Settings Screen */
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Choose Review Content</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="vocabulary"
                      checked={settings.includeVocabulary}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, includeVocabulary: !!checked }))
                      }
                    />
                    <label htmlFor="vocabulary" className="flex items-center gap-2 text-lg font-medium text-gray-700 cursor-pointer">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      Vocabulary Words
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="questions"
                      checked={settings.includeQuestions}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, includeQuestions: !!checked }))
                      }
                    />
                    <label htmlFor="questions" className="flex items-center gap-2 text-lg font-medium text-gray-700 cursor-pointer">
                      <HelpCircle className="h-5 w-5 text-green-500" />
                      Quiz Questions
                    </label>
                  </div>
                </div>
                
                <div className="mt-8 flex gap-3">
                  <Button onClick={handleClose} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleStartReview} className="flex-1">
                    Start Review
                  </Button>
                </div>
              </div>
            </div>
          ) : loading ? (
            /* Loading State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                <p className="text-xl font-semibold text-gray-600">Loading review items...</p>
              </div>
            </div>
          ) : reviewItems.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <BookOpen className="h-24 w-24 text-gray-300" />
                  <HelpCircle className="h-16 w-16 text-gray-300" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-4">No Review Items Found</h3>
                <p className="text-gray-500 mb-6">No vocabulary or questions were found for this content.</p>
                <Button onClick={() => setShowSettings(true)} variant="outline">
                  Change Settings
                </Button>
              </div>
            </div>
          ) : currentItem ? (
            /* Review Content */
            currentItem.type === 'vocabulary' 
              ? renderVocabularyItem(currentItem.data)
              : renderQuestionItem(currentItem.data)
          ) : null}
        </div>

        {/* Action Buttons */}
        {!showSettings && reviewItems.length > 0 && (
          <div className="p-[2vh] bg-muted/50 flex justify-center gap-[2vh]">
            {!showContent ? (
              <Button onClick={handleRevealContent} variant="outline" size="lg" className="text-[2vh] px-[3vh] py-[1vh]">
                <Eye className="mr-[1vh] h-[2.5vh] w-[2.5vh]" /> 
                {currentItem?.type === 'vocabulary' ? 'Reveal Word' : 'Show Question'}
              </Button>
            ) : assessmentMode && showAnswer ? (
              <>
                <Button
                  onClick={() => handleAssessment(true)}
                  className="bg-green-600 hover:bg-green-700 text-white text-[2vh] px-[3vh] py-[1vh]"
                  size="lg"
                >
                  <CheckCircle className="mr-[1vh] h-[2.5vh] w-[2.5vh]" /> Correct
                </Button>
                <Button
                  onClick={() => handleAssessment(false)}
                  variant="destructive"
                  size="lg"
                  className="text-[2vh] px-[3vh] py-[1vh]"
                >
                  <XCircle className="mr-[1vh] h-[2.5vh] w-[2.5vh]" /> Incorrect
                </Button>
              </>
            ) : (
              <Button onClick={handleClose} variant="outline" size="lg" className="text-[2vh] px-[3vh] py-[1vh]">
                Close Review
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
