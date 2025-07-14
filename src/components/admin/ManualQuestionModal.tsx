'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageSearchModal } from './ImageSearchModal';
import ContentRenderer from '@/components/quiz/ContentRenderer';
import { ContentData, ContentType, stringifyContentData } from '@/types/question';
import { Search, Image, X, Type } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ManualQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentTitle: string;
  onQuestionCreated?: () => void;
  editingQuestion?: any; // Question data for editing
}

interface RichContentInput {
  type: ContentType;
  text: string;
  image?: string;
}

export function ManualQuestionModal({ 
  isOpen, 
  onClose, 
  contentId, 
  contentTitle, 
  onQuestionCreated,
  editingQuestion 
}: ManualQuestionModalProps) {
  const { toast } = useToast();
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);
  const [currentImageTarget, setCurrentImageTarget] = useState<'question' | 'choice1' | 'choice2' | 'choice3' | 'choice4' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [questionData, setQuestionData] = useState({
    question_type: 'multiple_choice' as 'multiple_choice' | 'single_choice' | 'text',
    questionlevel: 'easy' as 'easy' | 'medium' | 'hard',
    correct_choice: '1' as '1' | '2' | '3' | '4',
    giai_thich: '',
    points: 100,
    type: 'WSC' as 'WSC' | 'TAHN' | 'Grapeseed'
  });

  const [questionContent, setQuestionContent] = useState<RichContentInput>({
    type: 'text',
    text: '',
    image: undefined
  });

  const [choiceContents, setChoiceContents] = useState<{
    choice1: RichContentInput;
    choice2: RichContentInput;
    choice3: RichContentInput;
    choice4: RichContentInput;
  }>({
    choice1: { type: 'text', text: '', image: undefined },
    choice2: { type: 'text', text: '', image: undefined },
    choice3: { type: 'text', text: '', image: undefined },
    choice4: { type: 'text', text: '', image: undefined }
  });

  // Populate form when editing a question
  useEffect(() => {
    if (editingQuestion && isOpen) {
      console.log('Editing question data:', editingQuestion); // Debug log
      
      // Populate question content
      setQuestionContent({
        type: editingQuestion.picture ? (editingQuestion.noi_dung ? 'mixed' : 'image') : 'text',
        text: editingQuestion.noi_dung || '',
        image: editingQuestion.picture || undefined
      });

      // Populate choice contents - choices don't have separate images in current schema
      setChoiceContents({
        choice1: {
          type: 'text',
          text: editingQuestion.cau_tra_loi_1 || '',
          image: undefined
        },
        choice2: {
          type: 'text',
          text: editingQuestion.cau_tra_loi_2 || '',
          image: undefined
        },
        choice3: {
          type: 'text',
          text: editingQuestion.cau_tra_loi_3 || '',
          image: undefined
        },
        choice4: {
          type: 'text',
          text: editingQuestion.cau_tra_loi_4 || '',
          image: undefined
        }
      });

      // Populate question data
      setQuestionData({
        question_type: editingQuestion.question_type || 'multiple_choice',
        questionlevel: editingQuestion.questionlevel || 'easy',
        correct_choice: editingQuestion.correct_choice || '1',
        giai_thich: editingQuestion.explanation || '',
        points: 100, // Default points since not in schema
        type: editingQuestion.chuong_trinh || 'WSC'
      });
    }
  }, [editingQuestion, isOpen]);

  const resetForm = () => {
    setQuestionData({
      question_type: 'multiple_choice',
      questionlevel: 'easy',
      correct_choice: '1',
      giai_thich: '',
      points: 100,
      type: 'WSC'
    });
    setQuestionContent({ type: 'text', text: '', image: undefined });
    setChoiceContents({
      choice1: { type: 'text', text: '', image: undefined },
      choice2: { type: 'text', text: '', image: undefined },
      choice3: { type: 'text', text: '', image: undefined },
      choice4: { type: 'text', text: '', image: undefined }
    });
  };

  const handleImageSearch = (target: 'question' | 'choice1' | 'choice2' | 'choice3' | 'choice4') => {
    setCurrentImageTarget(target);
    setIsImageSearchOpen(true);
  };

  const getCurrentTextForSearch = () => {
    if (currentImageTarget === 'question') {
      return questionContent.text;
    } else if (currentImageTarget) {
      return choiceContents[currentImageTarget].text;
    }
    return '';
  };

  const handleImageSelect = (imageUrl: string) => {
    if (currentImageTarget === 'question') {
      setQuestionContent(prev => ({
        ...prev,
        image: imageUrl,
        type: prev.text ? 'mixed' : 'image'
      }));
    } else if (currentImageTarget) {
      setChoiceContents(prev => ({
        ...prev,
        [currentImageTarget]: {
          ...prev[currentImageTarget],
          image: imageUrl,
          type: prev[currentImageTarget].text ? 'mixed' : 'image'
        }
      }));
    }
    setIsImageSearchOpen(false);
    setCurrentImageTarget(null);
  };

  const updateContentText = (target: 'question' | 'choice1' | 'choice2' | 'choice3' | 'choice4', text: string) => {
    if (target === 'question') {
      setQuestionContent(prev => ({
        ...prev,
        text,
        type: prev.image ? (text ? 'mixed' : 'image') : 'text'
      }));
    } else {
      setChoiceContents(prev => ({
        ...prev,
        [target]: {
          ...prev[target],
          text,
          type: prev[target].image ? (text ? 'mixed' : 'image') : 'text'
        }
      }));
    }
  };

  const removeImage = (target: 'question' | 'choice1' | 'choice2' | 'choice3' | 'choice4') => {
    if (target === 'question') {
      setQuestionContent(prev => ({
        ...prev,
        image: undefined,
        type: 'text'
      }));
    } else {
      setChoiceContents(prev => ({
        ...prev,
        [target]: {
          ...prev[target],
          image: undefined,
          type: 'text'
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionContent.text.trim() && !questionContent.image) {
      toast({
        title: 'Error',
        description: 'Please provide question content (text or image).',
        variant: 'destructive',
      });
      return;
    }

    if (questionData.question_type === 'multiple_choice' || questionData.question_type === 'single_choice') {
      if ((!choiceContents.choice1.text.trim() && !choiceContents.choice1.image) ||
          (!choiceContents.choice2.text.trim() && !choiceContents.choice2.image)) {
        toast({
          title: 'Error',
          description: 'Please provide at least two answer choices.',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        chuong_trinh: questionData.type,
        questionlevel: questionData.questionlevel,
        contentid: contentId,
        question_type: questionData.question_type,
        noi_dung: questionContent.text || '',
        video: '', // Not used in current form
        picture: questionContent.image || '',
        cau_tra_loi_1: choiceContents.choice1.text || '',
        cau_tra_loi_2: choiceContents.choice2.text || '',
        cau_tra_loi_3: choiceContents.choice3.text || '',
        cau_tra_loi_4: choiceContents.choice4.text || '',
        correct_choice: questionData.correct_choice,
        time: '30', // Default time
        explanation: questionData.giai_thich || '',
        answer: '' // Not used in current form
      };

      const url = editingQuestion 
        ? `/api/admin/questions/${editingQuestion.id}`
        : '/api/admin/questions';
      
      const method = editingQuestion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingQuestion ? 'update' : 'create'} question`);
      }

      toast({
        title: 'Success',
        description: `Question ${editingQuestion ? 'updated' : 'created'} successfully!`,
      });

      resetForm();
      onClose();
      onQuestionCreated?.();
    } catch (error) {
      console.error('Error creating question:', error);
      toast({
        title: 'Error',
        description: 'Failed to create question. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <DialogTitle>
                {editingQuestion ? 'Edit Question' : 'Create Question'} for: {contentTitle}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  form="question-form"
                >
                  {isSubmitting 
                    ? (editingQuestion ? 'Updating...' : 'Creating...') 
                    : (editingQuestion ? 'Update Question' : 'Create Question')
                  }
                </Button>
              </div>
            </div>
          </DialogHeader>

          <form id="question-form" onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label htmlFor="question_type">Question Type</Label>
                <Select 
                  value={questionData.question_type} 
                  onValueChange={(value: any) => setQuestionData(prev => ({ ...prev, question_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="single_choice">Single Choice</SelectItem>
                    <SelectItem value="text">Text Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="questionlevel">Difficulty Level</Label>
                <Select 
                  value={questionData.questionlevel} 
                  onValueChange={(value: any) => setQuestionData(prev => ({ ...prev, questionlevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Program</Label>
                <Select 
                  value={questionData.type} 
                  onValueChange={(value: any) => setQuestionData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WSC">WSC</SelectItem>
                    <SelectItem value="TAHN">TAHN</SelectItem>
                    <SelectItem value="Grapeseed">Grapeseed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  min="10"
                  max="500"
                  value={questionData.points}
                  onChange={(e) => setQuestionData(prev => ({ ...prev, points: parseInt(e.target.value) || 100 }))}
                />
              </div>
            </div>

            {/* Rich Question Content */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Question Content *</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={questionContent.type === 'text' ? 'default' : 'secondary'} className="text-xs">
                    {questionContent.type === 'text' ? 'Text' : questionContent.type === 'image' ? 'Image' : 'Text + Image'}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleImageSearch('question')}
                    className="h-7 px-2"
                  >
                    <Image className="h-3 w-3 mr-1" />
                    Add Image
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                {questionContent.image && (
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage('question')}
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 text-red-500 hover:text-red-700 z-10 bg-white rounded-full shadow-sm border"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <img
                        src={questionContent.image}
                        alt="Question preview"
                        className="max-h-20 max-w-28 object-contain rounded border"
                      />
                    </div>
                  </div>
                )}
                <div className="flex-1">
                  <Textarea
                    placeholder="Enter your question here..."
                    value={questionContent.text}
                    onChange={(e) => updateContentText('question', e.target.value)}
                    className="min-h-[40px]"
                    required={!questionContent.image}
                  />
                </div>
              </div>
            </div>

            {/* Rich Answer Choices */}
            {(questionData.question_type === 'multiple_choice' || questionData.question_type === 'single_choice') && (
              <div className="space-y-2">
                <Label className="text-base font-medium">Answer Choices</Label>
                
                <div className="grid grid-cols-2 gap-3">
                  {(['choice1', 'choice2', 'choice3', 'choice4'] as const).map((choiceKey, index) => {
                    const choice = choiceContents[choiceKey];
                    const choiceLabel = String.fromCharCode(65 + index); // A, B, C, D
                    const choiceNumber = (index + 1).toString();
                    const isRequired = index < 2; // A and B are required
                    
                    return (
                      <div key={choiceKey} className="border rounded-lg p-2">
                        <div className="flex gap-3 min-h-[80px]">
                          {/* Left side: Radio, Label, Badge, and Text input */}
                          <div className="flex-1 space-y-1">
                            {/* Header with radio, label, and controls */}
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="correct_choice"
                                value={choiceNumber}
                                checked={questionData.correct_choice === choiceNumber}
                                onChange={() => setQuestionData(prev => ({ ...prev, correct_choice: choiceNumber as '1' | '2' | '3' | '4' }))}
                              />
                              <Label className="text-sm font-bold text-blue-600 min-w-[20px]">{choiceLabel}.</Label>
                              <Badge variant={choice.type === 'text' ? 'default' : 'secondary'} className="text-xs">
                                {choice.type === 'text' ? 'Text' : choice.type === 'image' ? 'Image' : 'Mixed'}
                              </Badge>
                              <div className="flex-1 flex justify-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleImageSearch(choiceKey)}
                                  className="h-6 px-2"
                                >
                                  <Image className="h-3 w-3 mr-1" />
                                  Add Image
                                </Button>
                              </div>
                            </div>

                            {/* Text input */}
                            <Textarea
                              placeholder={`Enter choice ${choiceLabel}...${isRequired ? ' (Required)' : ''}`}
                              value={choice.text}
                              onChange={(e) => updateContentText(choiceKey, e.target.value)}
                              className="min-h-[50px] text-sm resize-none"
                              required={isRequired && !choice.image}
                            />
                          </div>

                          {/* Right side: Image taking full height */}
                          {choice.image && (
                            <div className="flex-shrink-0 w-32 self-stretch">
                              <div className="relative h-full">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeImage(choiceKey)}
                                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-red-500 hover:text-red-700 z-10 bg-white rounded-full shadow-sm border"
                                >
                                  <X className="h-2 w-2" />
                                </Button>
                                <img
                                  src={choice.image}
                                  alt={`Choice ${choiceLabel} preview`}
                                  className="w-full h-full object-cover rounded border bg-gray-50"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="giai_thich">Explanation (Optional)</Label>
              <Textarea
                id="giai_thich"
                placeholder="Provide an explanation for the answer..."
                value={questionData.giai_thich}
                onChange={(e) => setQuestionData(prev => ({ ...prev, giai_thich: e.target.value }))}
                className="min-h-[60px]"
              />
            </div>

          </form>
        </DialogContent>
      </Dialog>

      <ImageSearchModal
        isOpen={isImageSearchOpen}
        onClose={() => {
          setIsImageSearchOpen(false);
          setCurrentImageTarget(null);
        }}
        onSelect={handleImageSelect}
        initialSearchText={getCurrentTextForSearch()}
      />
    </>
  );
}
