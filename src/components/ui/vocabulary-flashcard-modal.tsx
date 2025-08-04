'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, Volume2, BookOpen, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TextToSpeechButton from '@/components/ui/text-to-speech-button';

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

interface VocabularyFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: string[];
}

export default function VocabularyFlashcardModal({
  isOpen,
  onClose,
  words
}: VocabularyFlashcardModalProps) {
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDefinition, setShowDefinition] = useState(false);
  const [showWord, setShowWord] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && words.length > 0) {
      fetchVocabulary();
    }
  }, [isOpen, words]);

  useEffect(() => {
    // Reset to first card and hide definition when modal opens
    if (isOpen) {
      setCurrentIndex(0);
      setShowDefinition(false);
      setShowWord(false);
    }
  }, [isOpen]);

  const fetchVocabulary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/vocabulary/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ words }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Vocabulary API Response:', data);
        console.log('Vocabulary Items:', data.vocabularyItems);
        
        // Log image URLs for debugging
        if (data.vocabularyItems && data.vocabularyItems.length > 0) {
          data.vocabularyItems.forEach((item: VocabularyItem, index: number) => {
            console.log(`Item ${index + 1} - Word: ${item.word}, Image URL: ${item.imageUrl}`);
          });
        }
        
        setVocabularyItems(data.vocabularyItems || []);
        
        if (data.vocabularyItems.length === 0) {
          toast({
            title: 'No Vocabulary Found',
            description: 'No vocabulary items were found for the selected words.',
            variant: 'default',
          });
        }
      } else {
        throw new Error('Failed to fetch vocabulary');
      }
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vocabulary items.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const currentItem = vocabularyItems[currentIndex];

  const goToNext = () => {
    if (currentIndex < vocabularyItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowDefinition(false);
      setShowWord(false);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowDefinition(false);
      setShowWord(false);
    }
  };

  const toggleDefinition = () => {
    setShowDefinition(!showDefinition);
  };

  const toggleWord = () => {
    setShowWord(!showWord);
  };

  const formatTextForTTS = (item: VocabularyItem) => {
    let text = `${item.word}. `;
    if (item.phoneticTranscription) {
      text += `Pronunciation: ${item.phoneticTranscription}. `;
    }
    text += `Part of speech: ${item.partOfSpeech}. `;
    text += `Definition: ${item.definition}. `;
    if (item.exampleSentence) {
      text += `Example: ${item.exampleSentence}`;
    }
    return text;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0">
        <DialogTitle className="sr-only">Vocabulary Flashcards</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-4">
            <BookOpen className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Vocabulary Flashcards</h2>
            {vocabularyItems.length > 0 && (
              <Badge variant="secondary" className="bg-white/20 text-white">
                {currentIndex + 1} / {vocabularyItems.length}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {vocabularyItems.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={goToNext}
                  disabled={currentIndex === vocabularyItems.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : vocabularyItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <BookOpen className="h-16 w-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No vocabulary found</p>
              <p className="text-sm">Try different words or check your content.</p>
            </div>
          ) : currentItem ? (
            <div className="h-full flex flex-col">
              {/* Flashcard - Dynamic layout based on showWord state */}
              <div className={`flex-1 transition-all duration-500 ${showWord ? 'flex' : 'flex flex-col items-center justify-center'}`}>
                {!showWord ? (
                  /* Centered Image Layout - Before clicking */
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                    {currentItem.imageUrl ? (
                      <div className="flex-1 flex items-center justify-center w-full max-w-4xl">
                        <img
                          src={currentItem.imageUrl}
                          alt="Vocabulary image"
                          className="max-w-full max-h-full object-contain rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                          style={{ maxHeight: '70vh' }}
                          onClick={toggleWord}
                          onError={(e) => {
                            console.error(`Failed to load image for word "${currentItem.word}":`, currentItem.imageUrl);
                            console.error('Image error event:', e);
                            // Hide the image if it fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                          onLoad={() => {
                            console.log(`Successfully loaded image for word "${currentItem.word}":`, currentItem.imageUrl);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center w-full">
                        <div className="text-center text-gray-400">
                          <BookOpen className="h-32 w-32 mx-auto mb-6" />
                          <p className="text-xl mb-4">No image available</p>
                          <Button
                            onClick={toggleWord}
                            variant="outline"
                            size="lg"
                            className="mt-4"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Show Word
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Click hint when word is not shown */}
                    {currentItem.imageUrl && (
                      <div className="text-center mt-6">
                        <p className="text-lg text-gray-600 mb-4">Click the image to reveal the word</p>
                        <Button
                          onClick={toggleWord}
                          variant="outline"
                          size="lg"
                          className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Show Word
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Side by Side Layout - After clicking */
                  <>
                    {/* Left side - Image (smaller) */}
                    <div className="flex-1 p-6 flex flex-col items-center justify-center bg-gray-50">
                      {currentItem.imageUrl ? (
                        <div className="flex-1 flex items-center justify-center w-full">
                          <img
                            src={currentItem.imageUrl}
                            alt={currentItem.word}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                            style={{ maxHeight: '60vh' }}
                            onClick={() => setShowWord(false)}
                            onError={(e) => {
                              console.error(`Failed to load image for word "${currentItem.word}":`, currentItem.imageUrl);
                              console.error('Image error event:', e);
                              // Hide the image if it fails to load
                              e.currentTarget.style.display = 'none';
                            }}
                            onLoad={() => {
                              console.log(`Successfully loaded image for word "${currentItem.word}":`, currentItem.imageUrl);
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center w-full">
                          <div className="text-center text-gray-400">
                            <BookOpen className="h-24 w-24 mx-auto mb-4" />
                            <p className="text-lg">No image available</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center mt-4">
                        <p className="text-sm text-gray-500">Click image to center it again</p>
                      </div>
                    </div>

                    {/* Right side - Word and Definition */}
                    <div className="flex-1 p-6 flex flex-col justify-center bg-white border-l animate-in fade-in-50 slide-in-from-right-4 duration-500">
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-3 mb-3">
                            <h1 className="text-5xl font-bold text-blue-600">
                              {currentItem.word}
                            </h1>
                            <TextToSpeechButton
                              text={currentItem.word}
                              variant="outline"
                              size="sm"
                              iconOnly={true}
                            />
                          </div>
                          
                          {currentItem.phoneticTranscription && (
                            <p className="text-xl text-gray-600 italic mb-3">
                              /{currentItem.phoneticTranscription}/
                            </p>
                          )}
                          
                          <Badge variant="secondary" className="text-lg px-4 py-2">
                            {currentItem.partOfSpeech}
                          </Badge>
                        </div>

                        {/* Definition Toggle Button */}
                        <div className="text-center">
                          <Button
                            onClick={toggleDefinition}
                            variant="outline"
                            size="lg"
                            className="mb-6"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {showDefinition ? 'Hide Definition' : 'Show Definition'}
                          </Button>
                        </div>

                        {/* Definition and Example */}
                        {showDefinition && (
                          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
                            <div className="p-6 bg-blue-50 rounded-lg">
                              <h3 className="font-semibold text-blue-800 mb-3 text-lg">Definition</h3>
                              <p className="text-gray-700 text-lg leading-relaxed">{currentItem.definition}</p>
                            </div>
                            
                            {currentItem.exampleSentence && (
                              <div className="p-6 bg-green-50 rounded-lg">
                                <h3 className="font-semibold text-green-800 mb-3 text-lg">Example</h3>
                                <p className="text-gray-700 italic text-lg leading-relaxed">"{currentItem.exampleSentence}"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Listen to full definition</span>
                  </div>
                  <TextToSpeechButton
                    text={formatTextForTTS(currentItem)}
                    variant="outline"
                    size="sm"
                    showLabel={true}
                  />
                </div>
                
                {currentItem.tags && currentItem.tags.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm text-gray-600">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {currentItem.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
