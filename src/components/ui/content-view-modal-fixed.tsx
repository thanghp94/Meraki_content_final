'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, Play, Volume2, Expand, BookOpen } from 'lucide-react';
import TextToSpeechButton from '@/components/ui/text-to-speech-button';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { useToast } from '@/hooks/use-toast';
import ContentQuizModal from '@/components/ui/content-quiz-modal-colorful';
import VocabularyFlashcardModal from '@/components/ui/vocabulary-flashcard-modal';
import { extractVocabularyWords } from '@/lib/utils';

interface ContentData {
  id: string;
  title: string;
  infor1: string;
  infor2?: string;
  image1?: string;
  image2?: string;
  video1?: string;
  video2?: string;
  topicid?: string;
  date_created?: string;
  visible?: boolean;
  order_index?: number;
  questions?: any[];
}

interface ContentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  onNavigate?: (direction: 'prev' | 'next') => void;
  showNavigation?: boolean;
}

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'image' | 'video';
  url: string;
  title: string;
}

function MediaModal({ isOpen, onClose, type, url, title }: MediaModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
        <DialogTitle className="sr-only">Content Viewer</DialogTitle>
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {type === 'image' ? (
            <img
              src={url}
              alt={title}
              className="w-full h-full object-contain"
            />
          ) : (
            <video
              src={url}
              controls
              className="w-full h-full"
              autoPlay
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ContentViewModal({ 
  isOpen, 
  onClose, 
  contentId, 
  onNavigate, 
  showNavigation = true 
}: ContentViewModalProps) {
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<{type: 'image' | 'video', url: string} | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [vocabularyWords, setVocabularyWords] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && contentId) {
      fetchContent();
    }
  }, [isOpen, contentId]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      console.log('Fetching content for ID:', contentId);
      const response = await fetch(`/api/admin/content/${contentId}`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Content data received:', data);
        setContent(data);
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        toast({
          title: 'Error',
          description: `Failed to load content: ${response.status}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: 'Error',
        description: `Failed to load content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openMediaModal = (type: 'image' | 'video', url: string) => {
    setSelectedMedia({ type, url });
  };

  const closeMediaModal = () => {
    setSelectedMedia(null);
  };

  const formatContentForTTS = (content: ContentData) => {
    const fullContent = [content.infor1, content.infor2].filter(Boolean).join(' ');
    return `${content.title}. ${fullContent}`;
  };

  const handleOpenFlashcards = () => {
    if (!content?.infor1) {
      toast({
        title: 'No Content',
        description: 'No content available to extract vocabulary from.',
        variant: 'destructive',
      });
      return;
    }

    const words = extractVocabularyWords(content.infor1);
    if (words.length === 0) {
      toast({
        title: 'No Vocabulary Found',
        description: 'No vocabulary words found in the content. Words should be separated by commas (,) or forward slashes (/).',
        variant: 'default',
      });
      return;
    }

    setVocabularyWords(words);
    setShowFlashcards(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
          <DialogTitle className="sr-only">Content Viewer</DialogTitle>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white">
              <div className="flex items-center gap-6">
                {showNavigation && onNavigate && (
                  <>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="text-white hover:bg-white/20 border-2 border-white/30 hover:border-white/50 rounded-full px-6 py-3 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      onClick={() => onNavigate('prev')}
                    >
                      <ChevronLeft className="h-6 w-6 mr-2" />
                      Back
                    </Button>
                    <span className="text-lg font-bold bg-white/20 px-4 py-2 rounded-full border border-white/30">1/1</span>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="text-white hover:bg-white/20 border-2 border-white/30 hover:border-white/50 rounded-full px-6 py-3 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      onClick={() => onNavigate('next')}
                    >
                      Next
                      <ChevronRight className="h-6 w-6 ml-2" />
                    </Button>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-yellow-400 text-purple-800 hover:bg-yellow-300 border-2 border-yellow-300 font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  onClick={() => setShowQuiz(true)}
                  disabled={!content?.questions || content.questions.length === 0}
                >
                  🎯 Quiz ({content?.questions?.length || 0})
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full p-3"
                  onClick={onClose}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : content ? (
                <div className="flex h-full">
                  {/* Left Content Panel */}
                  <div className="flex-1 p-6 overflow-y-auto max-h-full">
                    {/* Title with TTS - Smaller but still prominent */}
                    <div className="flex items-start gap-4 mb-8 p-6 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-2xl border-4 border-purple-200 shadow-lg">
                      <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 flex-1 leading-tight">
                        {content.title}
                      </h1>
                      <TextToSpeechButton
                        text={formatContentForTTS(content)}
                        variant="outline"
                        size="lg"
                        iconOnly={true}
                        className="mt-2 bg-yellow-400 hover:bg-yellow-300 border-2 border-yellow-500 rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                      />
                    </div>

                    {/* Content Sections with Enhanced Vocabulary Display */}
                    <div className="space-y-8">
                      {content.infor1 && (
                        <div className="space-y-4">
                          {/* Enhanced Vocabulary Words Display */}
                          <div className="p-6 bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 rounded-2xl border-4 border-orange-200 shadow-lg">
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <div className="leading-relaxed">
                                  {content.infor1.split(',').map((word, index) => (
                                    <span key={index} className="inline-block mr-4 mb-2 px-6 py-3 bg-white rounded-full border-4 border-orange-400 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-2xl font-black text-gray-800">
                                      {word.trim()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <TextToSpeechButton
                                  text={content.infor1}
                                  variant="outline"
                                  size="lg"
                                  iconOnly={true}
                                  className="bg-blue-400 hover:bg-blue-300 border-2 border-blue-500 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                                />
                                <Button
                                  variant="outline"
                                  size="lg"
                                  className="bg-purple-400 hover:bg-purple-300 text-white border-2 border-purple-500 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                                  onClick={handleOpenFlashcards}
                                  title="Open vocabulary flashcards"
                                >
                                  <BookOpen className="h-6 w-6" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {content.infor2 && (
                        <div className="space-y-2 border-t pt-4">
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <MarkdownRenderer 
                                content={content.infor2} 
                                className="text-gray-700"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 mt-1"
                                onClick={() => {
                                  // Trigger text-to-speech for this section
                                  const utterance = new SpeechSynthesisUtterance(content.infor2!);
                                  speechSynthesis.speak(utterance);
                                }}
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                              <TextToSpeechButton
                                text={content.infor2}
                                variant="ghost"
                                size="sm"
                                iconOnly={true}
                                className="h-6 w-6 mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Media Gallery */}
                  <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
                    <h3 className="font-semibold text-gray-800 mb-4">Media Gallery</h3>
                    
                    <div className="space-y-4">
                      {/* Images */}
                      {content.image1 && (
                        <div className="space-y-2">
                          <div 
                            className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors"
                            onClick={() => openMediaModal('image', content.image1!)}
                          >
                            <img
                              src={content.image1}
                              alt={content.title}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <Expand className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </div>
                      )}

                      {content.image2 && (
                        <div 
                          className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors"
                          onClick={() => openMediaModal('image', content.image2!)}
                        >
                          <img
                            src={content.image2}
                            alt={`${content.title} - Image 2`}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Expand className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      )}

                      {/* Videos */}
                      {content.video1 && (
                        <div 
                          className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors"
                          onClick={() => openMediaModal('video', content.video1!)}
                        >
                          <video
                            src={content.video1}
                            className="w-full h-48 object-cover"
                            muted
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Play className="h-12 w-12 text-white" />
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <Badge variant="secondary" className="bg-black/70 text-white">
                              Video
                            </Badge>
                          </div>
                        </div>
                      )}

                      {content.video2 && (
                        <div 
                          className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors"
                          onClick={() => openMediaModal('video', content.video2!)}
                        >
                          <video
                            src={content.video2}
                            className="w-full h-48 object-cover"
                            muted
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Play className="h-12 w-12 text-white" />
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <Badge variant="secondary" className="bg-black/70 text-white">
                              Video 2
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Media Gallery TTS */}
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Listen to content</span>
                        <TextToSpeechButton
                          text={formatContentForTTS(content)}
                          variant="outline"
                          size="sm"
                          className="ml-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Content not found</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Modal */}
      {selectedMedia && (
        <MediaModal
          isOpen={!!selectedMedia}
          onClose={closeMediaModal}
          type={selectedMedia.type}
          url={selectedMedia.url}
          title={content?.title || 'Media'}
        />
      )}

      {/* Quiz Modal */}
      {content && (
        <ContentQuizModal
          isOpen={showQuiz}
          onClose={() => setShowQuiz(false)}
          questions={content.questions || []}
          contentTitle={content.title}
        />
      )}

      {/* Vocabulary Flashcard Modal */}
      <VocabularyFlashcardModal
        isOpen={showFlashcards}
        onClose={() => setShowFlashcards(false)}
        words={vocabularyWords}
      />
    </>
  );
}
