'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, X } from 'lucide-react';
import type { Question } from '@/types/quiz';

interface QuestionBrowserProps {
  gameId: string;
  onQuestionLinked: () => void;
  onClose: () => void;
}

export default function QuestionBrowser({ gameId, onQuestionLinked, onClose }: QuestionBrowserProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'WSC' | 'TAHN' | 'Grapeseed'>('all');
  const [linkingQuestions, setLinkingQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchQuestions();
  }, [selectedType]);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, selectedType]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const typeParam = selectedType === 'all' ? '' : `?type=${selectedType}`;
      const response = await fetch(`/api/questions${typeParam}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.topic && q.topic.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredQuestions(filtered);
  };

  const linkQuestionToGame = async (questionId: string) => {
    try {
      setLinkingQuestions(prev => new Set(prev).add(questionId));
      
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'link',
          gameId,
          questionId,
          orderInGame: 0
        })
      });

      if (response.ok) {
        onQuestionLinked();
      } else {
        console.error('Failed to link question');
      }
    } catch (error) {
      console.error('Error linking question:', error);
    } finally {
      setLinkingQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Question Library</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="WSC">WSC</SelectItem>
                <SelectItem value="TAHN">TAHN</SelectItem>
                <SelectItem value="Grapeseed">Grapeseed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">Loading questions...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No questions found. Try adjusting your search or filter.
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredQuestions.map((question) => (
                <Card key={question.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{question.questionText}</CardTitle>
                        <div className="flex gap-2 mb-2">
                          <Badge variant="secondary">{question.type}</Badge>
                          <Badge variant="outline">{getQuestionTypeDisplay(question)}</Badge>
                          <Badge variant="outline">{question.points} pts</Badge>
                        </div>
                        {question.topic && (
                          <p className="text-sm text-gray-600">Topic: {question.topic}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => linkQuestionToGame(question.id)}
                        disabled={linkingQuestions.has(question.id)}
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {linkingQuestions.has(question.id) ? 'Adding...' : 'Add to Game'}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  {question.questionType === 'multiple_choice' && (
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-2 text-sm">
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
                    </CardContent>
                  )}
                  
                  {question.questionType === 'text' && question.answer && (
                    <CardContent className="pt-0">
                      <div className="text-sm bg-green-50 p-2 rounded">
                        <strong>Answer:</strong> {question.answer}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
