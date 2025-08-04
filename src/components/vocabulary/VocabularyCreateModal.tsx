'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Search, Save, Loader2, AlertTriangle, CheckCircle, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageSearchModal } from '@/components/admin/ImageSearchModal';

interface VocabularyCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const PARTS_OF_SPEECH = [
  'noun', 'verb', 'adjective', 'adverb', 'pronoun', 
  'preposition', 'conjunction', 'interjection', 'article'
];

export default function VocabularyCreateModal({
  isOpen,
  onClose,
  onSave
}: VocabularyCreateModalProps) {
  const [formData, setFormData] = useState({
    word: '',
    partOfSpeech: '',
    definition: '',
    exampleSentence: '',
    phoneticTranscription: '',
    imageUrl: '',
    videoUrl: '',
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    isDuplicate: boolean;
    existingWord?: {
      id: string;
      word: string;
      partOfSpeech: string;
      definition: string;
    };
  } | null>(null);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const { toast } = useToast();

  // Debounced duplicate check function
  const checkForDuplicate = useCallback(async (word: string) => {
    if (!word.trim()) {
      setDuplicateInfo(null);
      return;
    }

    try {
      setCheckingDuplicate(true);
      const response = await fetch(`/api/vocabulary/check-duplicate?word=${encodeURIComponent(word.trim())}`);
      
      if (response.ok) {
        const data = await response.json();
        setDuplicateInfo(data);
      } else {
        console.error('Failed to check for duplicate');
        setDuplicateInfo(null);
      }
    } catch (error) {
      console.error('Error checking for duplicate:', error);
      setDuplicateInfo(null);
    } finally {
      setCheckingDuplicate(false);
    }
  }, []);

  // Debounce the duplicate check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.word) {
        checkForDuplicate(formData.word);
      } else {
        setDuplicateInfo(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.word, checkForDuplicate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset duplicate confirmation if word changes
    if (field === 'word') {
      setShowDuplicateConfirm(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageSelect = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl
    }));
    setShowImageSearch(false);
  };

  const handleAIGenerate = async () => {
    if (!formData.word.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a word first before using AI generation.',
        variant: 'destructive',
      });
      return;
    }

    // Check if word already exists
    if (duplicateInfo?.isDuplicate) {
      toast({
        title: 'Word Already Exists',
        description: 'This word already exists in the vocabulary. Please try a different word.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setGeneratingAI(true);
      toast({
        title: 'AI Generating...',
        description: 'Please wait while AI generates vocabulary data for your word.',
      });

      const response = await fetch('/api/vocabulary/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: formData.word.trim() }),
      });

      if (response.ok) {
        const aiData = await response.json();
        
        // Update form with AI-generated data, but keep the original word
        setFormData(prev => ({
          ...prev,
          partOfSpeech: aiData.partOfSpeech || prev.partOfSpeech,
          definition: aiData.definition || prev.definition,
          exampleSentence: aiData.exampleSentence || prev.exampleSentence,
          phoneticTranscription: aiData.phoneticTranscription || prev.phoneticTranscription,
          tags: [...new Set([...prev.tags, ...aiData.tags])] // Merge tags without duplicates
        }));

        toast({
          title: 'AI Generation Complete!',
          description: 'Vocabulary data has been generated. Please review and edit as needed.',
        });

        // Auto-search for images if word is available
        if (formData.word && !formData.imageUrl) {
          setShowImageSearch(true);
        }
      } else {
        throw new Error('Failed to generate vocabulary data');
      }
    } catch (error) {
      console.error('Error generating AI vocabulary:', error);
      toast({
        title: 'AI Generation Failed',
        description: 'Failed to generate vocabulary data. Please fill in the fields manually.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSave = async (forceSave: boolean = false) => {
    if (!formData.word || !formData.partOfSpeech || !formData.definition) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // Check for duplicates if not forcing save
    if (!forceSave && duplicateInfo?.isDuplicate) {
      setShowDuplicateConfirm(true);
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Vocabulary item created successfully.',
        });
        // Reset form
        setFormData({
          word: '',
          partOfSpeech: '',
          definition: '',
          exampleSentence: '',
          phoneticTranscription: '',
          imageUrl: '',
          videoUrl: '',
          tags: []
        });
        setDuplicateInfo(null);
        setShowDuplicateConfirm(false);
        onSave();
      } else {
        throw new Error('Failed to create vocabulary item');
      }
    } catch (error) {
      console.error('Error creating vocabulary:', error);
      toast({
        title: 'Error',
        description: 'Failed to create vocabulary item.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDuplicate = () => {
    setShowDuplicateConfirm(false);
    handleSave(true); // Force save despite duplicate
  };

  const handleClose = () => {
    setFormData({
      word: '',
      partOfSpeech: '',
      definition: '',
      exampleSentence: '',
      phoneticTranscription: '',
      imageUrl: '',
      videoUrl: '',
      tags: []
    });
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-600" />
              Add New Vocabulary Word
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Word and AI Generate Button */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="word">Word *</Label>
                <div className="relative">
                  <Input
                    id="word"
                    value={formData.word}
                    onChange={(e) => handleInputChange('word', e.target.value)}
                    placeholder="Enter the word"
                    className={`pr-10 ${
                      duplicateInfo?.isDuplicate 
                        ? 'border-orange-300 focus:border-orange-500' 
                        : duplicateInfo && !duplicateInfo.isDuplicate && formData.word
                        ? 'border-green-300 focus:border-green-500'
                        : ''
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {checkingDuplicate ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : duplicateInfo?.isDuplicate ? (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    ) : duplicateInfo && !duplicateInfo.isDuplicate && formData.word ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : null}
                  </div>
                </div>
                {duplicateInfo?.isDuplicate && (
                  <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-orange-800">Word already exists</p>
                        <p className="text-orange-700 mt-1">
                          <strong>"{duplicateInfo.existingWord?.word}"</strong> ({duplicateInfo.existingWord?.partOfSpeech})
                        </p>
                        <p className="text-orange-600 mt-1 text-xs">
                          {duplicateInfo.existingWord?.definition}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {duplicateInfo && !duplicateInfo.isDuplicate && formData.word && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Word is available</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-end">
                <Button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={!formData.word.trim() || generatingAI || duplicateInfo?.isDuplicate}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg transition-all duration-200 hover:scale-105"
                >
                  {generatingAI ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      AI Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      ✨ AI Generate
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Let AI fill all fields for you!
                </p>
              </div>
            </div>

            {/* Phonetic Transcription */}
            <div>
              <Label htmlFor="phonetic">Phonetic Transcription</Label>
              <Input
                id="phonetic"
                value={formData.phoneticTranscription}
                onChange={(e) => handleInputChange('phoneticTranscription', e.target.value)}
                placeholder="e.g., /həˈloʊ/"
              />
            </div>

            {/* Part of Speech */}
            <div>
              <Label htmlFor="partOfSpeech">Part of Speech *</Label>
              <select
                id="partOfSpeech"
                value={formData.partOfSpeech}
                onChange={(e) => handleInputChange('partOfSpeech', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select part of speech</option>
                {PARTS_OF_SPEECH.map(pos => (
                  <option key={pos} value={pos}>
                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Definition */}
            <div>
              <Label htmlFor="definition">Definition *</Label>
              <Textarea
                id="definition"
                value={formData.definition}
                onChange={(e) => handleInputChange('definition', e.target.value)}
                placeholder="Enter the definition"
                rows={3}
              />
            </div>

            {/* Example Sentence */}
            <div>
              <Label htmlFor="example">Example Sentence</Label>
              <Textarea
                id="example"
                value={formData.exampleSentence}
                onChange={(e) => handleInputChange('exampleSentence', e.target.value)}
                placeholder="Enter an example sentence"
                rows={2}
              />
            </div>

            {/* Image */}
            <div>
              <Label>Image</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    placeholder="Enter image URL or search for images"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowImageSearch(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {formData.imageUrl && (
                  <div className="relative">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2"
                      onClick={() => handleInputChange('imageUrl', '')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Video URL */}
            <div>
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                placeholder="Enter video URL (YouTube, etc.)"
              />
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => handleSave()} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Word
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Search Modal */}
      {showImageSearch && (
        <ImageSearchModal
          isOpen={showImageSearch}
          onClose={() => setShowImageSearch(false)}
          onSelect={handleImageSelect}
          initialSearchText={formData.word}
        />
      )}
    </>
  );
}
