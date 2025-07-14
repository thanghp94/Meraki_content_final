'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Search, Plus, Eye, Edit, Trash2, Filter, Download, 
  ChevronLeft, ChevronRight, MoreHorizontal 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  noi_dung?: string;
  question_type?: string;
  questionlevel?: string;
  contentid?: string;
  tg_tao?: string;
  correct_choice?: string;
  cau_tra_loi_1?: string;
  cau_tra_loi_2?: string;
  cau_tra_loi_3?: string;
  cau_tra_loi_4?: string;
}

interface Content {
  id: string;
  title: string;
}

interface ContentQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content;
  onAddQuestion?: () => void;
  onEditQuestion?: (question: Question) => void;
}

export const ContentQuestionsModal: React.FC<ContentQuestionsModalProps> = ({
  isOpen,
  onClose,
  content,
  onAddQuestion,
  onEditQuestion
}) => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  // Fetch questions for this content
  useEffect(() => {
    if (isOpen && content.id) {
      fetchQuestions();
    }
  }, [isOpen, content.id]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/questions?contentId=${content.id}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        throw new Error('Failed to fetch questions');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load questions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
        toast({
          title: 'Success',
          description: 'Question deleted successfully',
        });
      } else {
        throw new Error('Failed to delete question');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete question',
        variant: 'destructive',
      });
    }
  };

  // Filter questions based on search term
  const filteredQuestions = questions.filter(question =>
    question.noi_dung?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.question_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.questionlevel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + questionsPerPage);

  const getQuestionTypeLabel = (type?: string) => {
    switch (type) {
      case 'multiple_choice': return 'MC';
      case 'true_false': return 'TF';
      case 'short_answer': return 'SA';
      default: return type || 'Unknown';
    }
  };

  const getLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            Questions for "{content.title}"
          </DialogTitle>
        </DialogHeader>

        {/* Header Actions */}
        <div className="flex items-center justify-between gap-4 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary" className="text-sm">
              {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={onAddQuestion}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>All Types</DropdownMenuItem>
                <DropdownMenuItem>Multiple Choice</DropdownMenuItem>
                <DropdownMenuItem>True/False</DropdownMenuItem>
                <DropdownMenuItem>Short Answer</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Questions Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading questions...</div>
            </div>
          ) : paginatedQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <div className="text-lg font-medium mb-2">No questions found</div>
              <div className="text-sm mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first question'}
              </div>
              <Button onClick={onAddQuestion} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                <div className="col-span-6">Question</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Level</div>
                <div className="col-span-1">Created</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Table Rows */}
              {paginatedQuestions.map((question) => (
                <Card key={question.id} className="p-3 hover:shadow-sm transition-shadow">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-6">
                      <div className="font-medium text-sm">
                        {truncateText(question.noi_dung || 'No question text')}
                      </div>
                      {question.correct_choice && (
                        <div className="text-xs text-gray-500 mt-1">
                          Correct: {question.correct_choice}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <Badge variant="outline" className="text-xs">
                        {getQuestionTypeLabel(question.question_type)}
                      </Badge>
                    </div>
                    
                    <div className="col-span-2">
                      <Badge className={`text-xs ${getLevelColor(question.questionlevel)}`}>
                        {question.questionlevel || 'Unknown'}
                      </Badge>
                    </div>
                    
                    <div className="col-span-1 text-xs text-gray-500">
                      {question.tg_tao ? new Date(question.tg_tao).toLocaleDateString() : '-'}
                    </div>
                    
                    <div className="col-span-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditQuestion?.(question)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditQuestion?.(question)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t flex-shrink-0">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + questionsPerPage, filteredQuestions.length)} of {filteredQuestions.length} questions
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
