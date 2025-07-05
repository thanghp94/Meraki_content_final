'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Library, Trash2 } from 'lucide-react';
import QuestionBrowser from './QuestionBrowser';
import type { Question } from '@/types/quiz';

interface QuestionEditorFormProps {
  gameId: string;
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
}

export default function QuestionEditorForm({ gameId, questions, onQuestionsChange }: QuestionEditorFormProps) {
  const [showBrowser, setShowBrowser] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    answerText: '',
    points: 10,
    mediaUrl: '',
    mediaType: 'image' as 'image' | 'video' | 'gif',
    mediaAlt: '',
    questionType: 'text' as 'text' | 'multiple_choice' | 'one_choice',
    type: 'WSC' as 'WSC' | 'TAHN' | 'Grapeseed',
    cauTraLoi1: '',
    cauTraLoi2: '',
    cauTraLoi3: '',
    cauTraLoi4: '',
    correctChoice: 'A' as 'A' | 'B' | 'C' | 'D',
    topic: ''
  });

  const addQuestion = async () => {
    if (!newQuestion.questionText.trim()) {
      alert('Please fill in the question field.');
      return;
    }

    if (newQuestion.questionType === 'text' && !newQuestion.answerText.trim()) {
      alert('Please fill in the answer field for text questions.');
      return;
    }

    if (newQuestion.questionType === 'multiple_choice') {
      if (!newQuestion.cauTraLoi1.trim() || !newQuestion.cauTraLoi2.trim()) {
        alert('Please fill in at least two answer choices for multiple choice questions.');
        return;
      }
    }

    try {
      const questionData = {
        questionText: newQuestion.questionText,
        answerText: newQuestion.answerText,
        answer: newQuestion.answerText,
        points: newQuestion.points,
        questionType: newQuestion.questionType,
        type: newQuestion.type,
        topic: newQuestion.topic,
        cauTraLoi1: newQuestion.cauTraLoi1,
        cauTraLoi2: newQuestion.cauTraLoi2,
        cauTraLoi3: newQuestion.cauTraLoi3,
        cauTraLoi4: newQuestion.cauTraLoi4,
        correctChoice: newQuestion.correctChoice,
        mediaUrl: newQuestion.mediaUrl,
        mediaType: newQuestion.mediaType,
        mediaAlt: newQuestion.mediaAlt,
        media: newQuestion.mediaUrl ? {
          url: newQuestion.mediaUrl,
          type: newQuestion.mediaType,
          alt: newQuestion.mediaAlt
        } : undefined
      };

      const response = await fetch(`/api/games/${gameId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
      });

      if (response.ok) {
        // Reset form
        setNewQuestion({
          questionText: '',
          answerText: '',
          points: 10,
          mediaUrl: '',
          mediaType: 'image',
          mediaAlt: '',
          questionType: 'text',
          type: 'WSC',
          cauTraLoi1: '',
          cauTraLoi2: '',
          cauTraLoi3: '',
          cauTraLoi4: '',
          correctChoice: 'A',
          topic: ''
        });

        // Refresh questions list
        refreshQuestions();
      } else {
        alert('Failed to add question. Please try again.');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      alert('An error occurred while adding the question.');
    }
  };

  const refreshQuestions = async () => {
    try {
      const questionsResponse = await fetch(`/api/games/${gameId}/questions`);
      if (questionsResponse.ok) {
        const updatedQuestions = await questionsResponse.json();
        onQuestionsChange(updatedQuestions);
      }
    } catch (error) {
      console.error('Error refreshing questions:', error);
    }
  };

  const unlinkQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to remove this question from the game?')) {
      return;
    }

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unlink',
          gameId,
          questionId
        })
      });

      if (response.ok) {
        refreshQuestions();
      } else {
        alert('Failed to remove question. Please try again.');
      }
    } catch (error) {
      console.error('Error removing question:', error);
      alert('An error occurred while removing the question.');
    }
  };

  const getQuestionTypeDisplay = (question: Question) => {
    if (question.questionType === 'multiple_choice') {
      return 'Multiple Choice';
    } else if (question.questionType === 'one_choice') {
      return 'Single Choice';
    }
    return 'Text Answer';
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Button onClick={() => setShowBrowser(true)} variant="outline" className="flex-1">
          <Library className="h-4 w-4 mr-2" />
          Browse Question Library
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Question
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="questionType">Question Type</Label>
              <Select value={newQuestion.questionType} onValueChange={(value: any) => setNewQuestion(prev => ({ ...prev, questionType: value }))}>
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
              <Select value={newQuestion.type} onValueChange={(value: any) => setNewQuestion(prev => ({ ...prev, type: value }))}>
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
            <Label htmlFor="topic">Topic (optional)</Label>
            <Input
              id="topic"
              placeholder="Enter topic..."
              value={newQuestion.topic}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, topic: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="questionText">Question</Label>
            <Textarea
              id="questionText"
              placeholder="Enter your question here..."
              value={newQuestion.questionText}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, questionText: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          {newQuestion.questionType === 'multiple_choice' && (
            <div className="space-y-3">
              <Label>Answer Choices</Label>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctChoice"
                    value="A"
                    checked={newQuestion.correctChoice === 'A'}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, correctChoice: 'A' }))}
                  />
                  <Label className="w-4">A.</Label>
                  <Input
                    placeholder="Choice A"
                    value={newQuestion.cauTraLoi1}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, cauTraLoi1: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctChoice"
                    value="B"
                    checked={newQuestion.correctChoice === 'B'}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, correctChoice: 'B' }))}
                  />
                  <Label className="w-4">B.</Label>
                  <Input
                    placeholder="Choice B"
                    value={newQuestion.cauTraLoi2}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, cauTraLoi2: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctChoice"
                    value="C"
                    checked={newQuestion.correctChoice === 'C'}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, correctChoice: 'C' }))}
                  />
                  <Label className="w-4">C.</Label>
                  <Input
                    placeholder="Choice C (optional)"
                    value={newQuestion.cauTraLoi3}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, cauTraLoi3: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctChoice"
                    value="D"
                    checked={newQuestion.correctChoice === 'D'}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, correctChoice: 'D' }))}
                  />
                  <Label className="w-4">D.</Label>
                  <Input
                    placeholder="Choice D (optional)"
                    value={newQuestion.cauTraLoi4}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, cauTraLoi4: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {newQuestion.questionType === 'text' && (
            <div>
              <Label htmlFor="answerText">Answer</Label>
              <Textarea
                id="answerText"
                placeholder="Enter the correct answer..."
                value={newQuestion.answerText}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, answerText: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
          )}

          <div>
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              min="1"
              max="100"
              value={newQuestion.points}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 10 }))}
              className="w-24"
            />
          </div>

          <div>
            <Label htmlFor="mediaUrl">Media URL (optional)</Label>
            <Input
              id="mediaUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={newQuestion.mediaUrl}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, mediaUrl: e.target.value }))}
            />
          </div>

          {newQuestion.mediaUrl && (
            <>
              <div>
                <Label htmlFor="mediaType">Media Type</Label>
                <Select value={newQuestion.mediaType} onValueChange={(value: any) => setNewQuestion(prev => ({ ...prev, mediaType: value }))}>
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
                <Label htmlFor="mediaAlt">Media Description (optional)</Label>
                <Input
                  id="mediaAlt"
                  placeholder="Describe the media content..."
                  value={newQuestion.mediaAlt}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, mediaAlt: e.target.value }))}
                />
              </div>
            </>
          )}

          <Button onClick={addQuestion} className="w-full">
            Add Question
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No questions added yet.</p>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      <Badge variant="secondary">{question.type}</Badge>
                      <Badge variant="outline">{getQuestionTypeDisplay(question)}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{question.points} points</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => unlinkQuestion(question.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {question.topic && (
                    <p className="text-sm text-gray-600 mb-2">Topic: {question.topic}</p>
                  )}
                  
                  <p className="text-gray-700 mb-2">{question.questionText}</p>
                  
                  {question.questionType === 'multiple_choice' && (
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      {question.cauTraLoi1 && (
                        <div className={`p-2 rounded ${question.correctChoice === 'A' ? 'bg-green-100' : 'bg-gray-50'}`}>
                          A. {question.cauTraLoi1}
                        </div>
                      )}
                      {question.cauTraLoi2 && (
                        <div className={`p-2 rounded ${question.correctChoice === 'B' ? 'bg-green-100' : 'bg-gray-50'}`}>
                          B. {question.cauTraLoi2}
                        </div>
                      )}
                      {question.cauTraLoi3 && (
                        <div className={`p-2 rounded ${question.correctChoice === 'C' ? 'bg-green-100' : 'bg-gray-50'}`}>
                          C. {question.cauTraLoi3}
                        </div>
                      )}
                      {question.cauTraLoi4 && (
                        <div className={`p-2 rounded ${question.correctChoice === 'D' ? 'bg-green-100' : 'bg-gray-50'}`}>
                          D. {question.cauTraLoi4}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {question.questionType === 'text' && (question.answer || question.answerText) && (
                    <p className="text-green-600 text-sm">
                      <strong>Answer:</strong> {question.answer || question.answerText}
                    </p>
                  )}
                  
                  {question.media && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">
                        Media: {question.media.type} - {question.media.url}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showBrowser && (
        <QuestionBrowser
          gameId={gameId}
          onQuestionLinked={refreshQuestions}
          onClose={() => setShowBrowser(false)}
        />
      )}
    </div>
  );
}
