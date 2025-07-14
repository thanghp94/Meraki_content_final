'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface QuestionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  onQuestionCreated?: () => void;
}

export default function QuestionCreateModal({ 
  isOpen, 
  onClose, 
  contentId, 
  onQuestionCreated 
}: QuestionCreateModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [questionData, setQuestionData] = useState({
    questionText: '',
    answerText: '',
    points: 100,
    questionType: 'multiple_choice' as 'text' | 'multiple_choice' | 'one_choice',
    type: 'WSC' as 'WSC' | 'TAHN' | 'Grapeseed',
    cauTraLoi1: '',
    cauTraLoi2: '',
    cauTraLoi3: '',
    cauTraLoi4: '',
    correctChoice: '1' as '1' | '2' | '3' | '4',
    mediaUrl: '',
    mediaType: 'image' as 'image' | 'video' | 'gif',
    mediaAlt: ''
  });

  const resetForm = () => {
    setQuestionData({
      questionText: '',
      answerText: '',
      points: 100,
      questionType: 'multiple_choice',
      type: 'WSC',
      cauTraLoi1: '',
      cauTraLoi2: '',
      cauTraLoi3: '',
      cauTraLoi4: '',
      correctChoice: '1',
      mediaUrl: '',
      mediaType: 'image',
      mediaAlt: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionData.questionText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a question.',
        variant: 'destructive',
      });
      return;
    }

    if (questionData.questionType === 'text' && !questionData.answerText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an answer for text questions.',
        variant: 'destructive',
      });
      return;
    }

    if (questionData.questionType === 'multiple_choice') {
      if (!questionData.cauTraLoi1.trim() || !questionData.cauTraLoi2.trim()) {
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
        contentId: contentId,
        questionText: questionData.questionText,
        questionType: questionData.questionType,
        type: questionData.type,
        points: questionData.points,
        answer: questionData.questionType === 'text' ? questionData.answerText : questionData.correctChoice,
        cauTraLoi1: questionData.cauTraLoi1,
        cauTraLoi2: questionData.cauTraLoi2,
        cauTraLoi3: questionData.cauTraLoi3,
        cauTraLoi4: questionData.cauTraLoi4,
        correctChoice: questionData.correctChoice,
        mediaUrl: questionData.mediaUrl || undefined,
        mediaType: questionData.mediaUrl ? questionData.mediaType : undefined,
        mediaAlt: questionData.mediaUrl ? questionData.mediaAlt : undefined
      };

      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create question');
      }

      toast({
        title: 'Success',
        description: 'Question created successfully!',
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Question</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="questionType">Question Type</Label>
              <Select 
                value={questionData.questionType} 
                onValueChange={(value: any) => setQuestionData(prev => ({ ...prev, questionType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Answer</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="one_choice">Single Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Category</Label>
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
          </div>

          <div>
            <Label htmlFor="questionText">Question *</Label>
            <Textarea
              id="questionText"
              placeholder="Enter your question here..."
              value={questionData.questionText}
              onChange={(e) => setQuestionData(prev => ({ ...prev, questionText: e.target.value }))}
              className="min-h-[100px]"
              required
            />
          </div>

          {questionData.questionType === 'multiple_choice' && (
            <div className="space-y-3">
              <Label>Answer Choices *</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctChoice"
                    value="1"
                    checked={questionData.correctChoice === '1'}
                    onChange={() => setQuestionData(prev => ({ ...prev, correctChoice: '1' }))}
                  />
                  <Label className="w-4">A.</Label>
                  <Input
                    placeholder="Choice A *"
                    value={questionData.cauTraLoi1}
                    onChange={(e) => setQuestionData(prev => ({ ...prev, cauTraLoi1: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctChoice"
                    value="2"
                    checked={questionData.correctChoice === '2'}
                    onChange={() => setQuestionData(prev => ({ ...prev, correctChoice: '2' }))}
                  />
                  <Label className="w-4">B.</Label>
                  <Input
                    placeholder="Choice B *"
                    value={questionData.cauTraLoi2}
                    onChange={(e) => setQuestionData(prev => ({ ...prev, cauTraLoi2: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctChoice"
                    value="3"
                    checked={questionData.correctChoice === '3'}
                    onChange={() => setQuestionData(prev => ({ ...prev, correctChoice: '3' }))}
                  />
                  <Label className="w-4">C.</Label>
                  <Input
                    placeholder="Choice C (optional)"
                    value={questionData.cauTraLoi3}
                    onChange={(e) => setQuestionData(prev => ({ ...prev, cauTraLoi3: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctChoice"
                    value="4"
                    checked={questionData.correctChoice === '4'}
                    onChange={() => setQuestionData(prev => ({ ...prev, correctChoice: '4' }))}
                  />
                  <Label className="w-4">D.</Label>
                  <Input
                    placeholder="Choice D (optional)"
                    value={questionData.cauTraLoi4}
                    onChange={(e) => setQuestionData(prev => ({ ...prev, cauTraLoi4: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {questionData.questionType === 'text' && (
            <div>
              <Label htmlFor="answerText">Answer *</Label>
              <Textarea
                id="answerText"
                placeholder="Enter the correct answer..."
                value={questionData.answerText}
                onChange={(e) => setQuestionData(prev => ({ ...prev, answerText: e.target.value }))}
                className="min-h-[80px]"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              min="1"
              max="1000"
              value={questionData.points}
              onChange={(e) => setQuestionData(prev => ({ ...prev, points: parseInt(e.target.value) || 100 }))}
              className="w-24"
            />
          </div>

          <div>
            <Label htmlFor="mediaUrl">Media URL (optional)</Label>
            <Input
              id="mediaUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={questionData.mediaUrl}
              onChange={(e) => setQuestionData(prev => ({ ...prev, mediaUrl: e.target.value }))}
            />
          </div>

          {questionData.mediaUrl && (
            <>
              <div>
                <Label htmlFor="mediaType">Media Type</Label>
                <Select 
                  value={questionData.mediaType} 
                  onValueChange={(value: any) => setQuestionData(prev => ({ ...prev, mediaType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="gif">GIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mediaAlt">Media Description</Label>
                <Input
                  id="mediaAlt"
                  placeholder="Describe the media content..."
                  value={questionData.mediaAlt}
                  onChange={(e) => setQuestionData(prev => ({ ...prev, mediaAlt: e.target.value }))}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Question'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
