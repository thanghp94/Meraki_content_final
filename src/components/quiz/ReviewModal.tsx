'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ContentRenderer from './ContentRenderer';
import TextToSpeechButton from '@/components/ui/text-to-speech-button';
import { useToast } from '@/hooks/use-toast';
import { safeExtractVocabulary, createErrorHandler } from '@/components/library/topics-by-unit/utils/errorHandling';

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

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    id: string;
    title: string;
    infor1?: string;
    [key: string]: any;
  };
}

export default function ReviewModal({ isOpen, onClose, content }: ReviewModalProps) {
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showWord, setShowWord] = useState(false);
  const [showDefinition, setShowDefinition] = useState(false);
  const [assessmentMode, setAssessmentMode] = useState(false);
  const { toast } = useToast();
  const errorHandler = createErrorHandler(toast);

  useEffect(() => {
    if (isOpen && content) {
      fetchVocabulary();
    }
  }, [isOpen, content]);

  useEffect(() => {
    // Reset states when modal opens or index changes
    if (isOpen) {
      setShowWord(false);
      setShowDefinition(false);
      setAssessmentMode(false);
    }
  }, [isOpen, currentIndex]);

  const fetchVocabulary = async () => {
    try {
      setLoading(true);
      
      // Extract vocabulary words from content.infor1
      const vocabularyWords = safeExtractVocabulary(content);
      
      if (vocabularyWords.length === 0) {
        toast({
          title: 'No Vocabulary Found',
          description: `No vocabulary words found in "${content.title}". Please check the content format.`,
          variant: 'default',
        });
        setVocabularyItems([]);
        return;
      }

      // Fetch vocabulary items from API
      const response = await fetch('/api/vocabulary/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ words: vocabularyWords }),
      });

      if (response.ok) {
        const data = await response.json();
        setVocabularyItems(data.vocabularyItems || []);
        setCurrentIndex(0);
        
        if (data.vocabularyItems.length === 0) {
          toast({
            title: 'No Vocabulary Items Found',
            description: 'No matching vocabulary items were found in the database.',
            variant: 'default',
          });
        }
      } else {
        throw new Error('Failed to fetch vocabulary');
      }
    } catch (error) {
      errorHandler.handleVocabularyError(error, content.title);
      setVocabularyItems([]);
    } finally {
      setLoading(false);
    }
  };

  const currentItem = vocabularyItems[currentIndex];

  const goToNext = () => {
    if (currentIndex < vocabularyItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRevealWord = () => {
    setShowWord(true);
  };

  const handleToggleDefinition = () => {
    setShowDefinition(!showDefinition);
  };

  const handleAssessment = (isCorrect: boolean) => {
    // Optional: Track assessment results
    console.log(`Assessment for "${currentItem.word}": ${isCorrect ? 'Correct' : 'Incorrect'}`);
    
    // Auto-advance to next item after assessment
    setTimeout(() => {
      if (currentIndex < vocabularyItems.length - 1) {
        goToNext();
      } else {
        // End of review session
        toast({
          title: 'Review Complete!',
          description: `You've reviewed all ${vocabularyItems.length} vocabulary items.`,
          variant: 'default',
        });
      }
    }, 1000);
  };

  const handleClose = () => {
    setCurrentIndex(0);
    setShowWord(false);
    setShowDefinition(false);
    setAssessmentMode(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="!fixed !inset-0 !w-screen !h-screen !translate-x-0 !translate-y-0 !left-0 !top-0 bg-card shadow-2xl rounded-none p-0 overflow-hidden flex flex-col max-w-none">
        <DialogTitle className="sr-only">
          Vocabulary Review - {content.title}
        </DialogTitle>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-[2vh] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <BookOpen className="h-8 w-8" />
            <div>
              <h1 className="text-[3vw] md:text-[2vw] lg:text-[1.5vw] font-bold">Vocabulary Review</h1>
              <p className="text-[2vw] md:text-[1.5vw] lg:text-[1vw] opacity-90">{content.title}</p>
            </div>
          </div>
          
          {vocabularyItems.length > 0 && (
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white text-[2vh] px-4 py-2">
                {currentIndex + 1} / {vocabularyItems.length}
              </Badge>
              
              {vocabularyItems.length > 1 && (
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
                    disabled={currentIndex === vocabularyItems.length - 1}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-[2vh] overflow-y-auto">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
                <p className="text-xl font-semibold text-gray-600">Loading vocabulary...</p>
              </div>
            </div>
          ) : vocabularyItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="h-24 w-24 mx-auto mb-6 text-gray-300" />
                <h3 className="text-2xl font-semibold text-gray-600 mb-4">No Vocabulary Found</h3>
                <p className="text-gray-500 mb-6">No vocabulary items were found for this content.</p>
                <Button onClick={handleClose} variant="outline">
                  Close Review
                </Button>
              </div>
            </div>
          ) : currentItem ? (
            <div className="flex-1 flex flex-col">
              {/* Image Section */}
              <div className="flex-1 flex items-center justify-center mb-[2vh]">
                {currentItem.imageUrl ? (
                  <div className="relative">
                    <img
                      src={currentItem.imageUrl}
                      alt="Vocabulary image"
                      className="max-w-[60vw] max-h-[40vh] object-contain rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                      onClick={!showWord ? handleRevealWord : undefined}
                      onError={(e) => {
                        console.error(`Failed to load image for word "${currentItem.word}":`, currentItem.imageUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {!showWord && (
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
                    {!showWord && (
                      <Button onClick={handleRevealWord} variant="outline" size="lg">
                        <Eye className="h-4 w-4 mr-2" />
                        Show Word
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Word Information */}
              {showWord && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-[2vh] animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <h2 className="text-4xl font-bold text-blue-600">{currentItem.word}</h2>
                      <TextToSpeechButton
                        text={currentItem.word}
                        variant="outline"
                        size="sm"
                        iconOnly={true}
                      />
                    </div>
                    
                    {currentItem.phoneticTranscription && (
                      <p className="text-lg text-gray-600 italic mb-2">
                        /{currentItem.phoneticTranscription}/
                      </p>
                    )}
                    
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {currentItem.partOfSpeech}
                    </Badge>
                  </div>

                  {/* Definition Toggle */}
                  <div className="text-center mb-4">
                    <Button
                      onClick={handleToggleDefinition}
                      variant="outline"
                      size="lg"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showDefinition ? 'Hide Definition' : 'Show Definition'}
                    </Button>
                  </div>

                  {/* Definition and Example */}
                  {showDefinition && (
                    <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">Definition</h3>
                        <p className="text-gray-700">{currentItem.definition}</p>
                      </div>
                      
                      {currentItem.exampleSentence && (
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h3 className="font-semibold text-green-800 mb-2">Example</h3>
                          <p className="text-gray-700 italic">"{currentItem.exampleSentence}"</p>
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
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="p-[2vh] bg-muted/50 flex justify-center gap-[2vh]">
          {!showWord ? (
            <Button onClick={handleRevealWord} variant="outline" size="lg" className="text-[2vh] px-[3vh] py-[1vh]">
              <Eye className="mr-[1vh] h-[2.5vh] w-[2.5vh]" /> Reveal Word
            </Button>
          ) : assessmentMode && showDefinition ? (
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
      </DialogContent>
    </Dialog>
  );
}
