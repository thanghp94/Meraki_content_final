'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ContentInput from './ContentInput';
import { ContentData, EnhancedFormData, parseContentData, stringifyContentData } from '@/types/question';

interface Question {
  id: string;
  chuong_trinh: string;
  questionlevel: string;
  contentid: string;
  question_type: string;
  noi_dung: string;
  video: string;
  picture: string;
  cau_tra_loi_1: string;
  cau_tra_loi_2: string;
  cau_tra_loi_3: string;
  cau_tra_loi_4: string;
  correct_choice: string;
  time: string;
  explanation: string;
  answer: string;
  tg_tao: string;
}

interface Content {
  id: string;
  title: string;
}

export default function QuestionAdmin() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState<EnhancedFormData>({
    chuong_trinh: '',
    questionlevel: '',
    contentid: '',
    question_type: 'multiple_choice',
    questionContent: { type: 'text', text: '' },
    choice1Content: { type: 'text', text: '' },
    choice2Content: { type: 'text', text: '' },
    choice3Content: { type: 'text', text: '' },
    choice4Content: { type: 'text', text: '' },
    correct_choice: '',
    time: '',
    explanation: '',
    answer: '',
    video: '',
    picture: ''
  });

  useEffect(() => {
    fetchQuestions();
    fetchContents();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/admin/questions');
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load questions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContents = async () => {
    try {
      const response = await fetch('/api/admin/content');
      if (!response.ok) throw new Error('Failed to fetch contents');
      const data = await response.json();
      setContents(data);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingQuestion 
        ? `/api/admin/questions/${editingQuestion.id}`
        : '/api/admin/questions';
      
      // Transform enhanced form data back to API format
      const apiData = {
        ...formData,
        noi_dung: stringifyContentData(formData.questionContent),
        cau_tra_loi_1: stringifyContentData(formData.choice1Content),
        cau_tra_loi_2: stringifyContentData(formData.choice2Content),
        cau_tra_loi_3: stringifyContentData(formData.choice3Content),
        cau_tra_loi_4: stringifyContentData(formData.choice4Content),
      };
      
      const response = await fetch(url, {
        method: editingQuestion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) throw new Error('Failed to save question');

      toast({
        title: editingQuestion ? 'Question Updated' : 'Question Created',
        description: `Successfully ${editingQuestion ? 'updated' : 'created'} the question.`,
      });

      setIsDialogOpen(false);
      fetchQuestions();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingQuestion ? 'update' : 'create'} question`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      chuong_trinh: question.chuong_trinh || '',
      questionlevel: question.questionlevel || '',
      contentid: question.contentid || '',
      question_type: question.question_type || 'multiple_choice',
      questionContent: parseContentData(question.noi_dung),
      choice1Content: parseContentData(question.cau_tra_loi_1),
      choice2Content: parseContentData(question.cau_tra_loi_2),
      choice3Content: parseContentData(question.cau_tra_loi_3),
      choice4Content: parseContentData(question.cau_tra_loi_4),
      correct_choice: question.correct_choice || '',
      time: question.time || '',
      explanation: question.explanation || '',
      answer: question.answer || '',
      video: question.video || '',
      picture: question.picture || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete question');

      toast({
        title: 'Question Deleted',
        description: 'Successfully deleted the question.',
      });

      fetchQuestions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete question',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setFormData({
      chuong_trinh: '',
      questionlevel: '',
      contentid: '',
      question_type: 'multiple_choice',
      questionContent: { type: 'text', text: '' },
      choice1Content: { type: 'text', text: '' },
      choice2Content: { type: 'text', text: '' },
      choice3Content: { type: 'text', text: '' },
      choice4Content: { type: 'text', text: '' },
      correct_choice: '',
      time: '',
      explanation: '',
      answer: '',
      video: '',
      picture: ''
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Questions</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contentid">Content</Label>
                  <Select
                    value={formData.contentid}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, contentid: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select content" />
                    </SelectTrigger>
                    <SelectContent>
                      {contents.map((content) => (
                        <SelectItem key={content.id} value={content.id}>
                          {content.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question_type">Question Type</Label>
                  <Select
                    value={formData.question_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, question_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ContentInput
                label="Question Text"
                value={formData.questionContent}
                onChange={(content) => setFormData(prev => ({ ...prev, questionContent: content }))}
                isTextArea={true}
                required={true}
              />

              {formData.question_type === 'multiple_choice' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ContentInput
                      label="Choice 1"
                      value={formData.choice1Content}
                      onChange={(content) => setFormData(prev => ({ ...prev, choice1Content: content }))}
                    />
                    <ContentInput
                      label="Choice 2"
                      value={formData.choice2Content}
                      onChange={(content) => setFormData(prev => ({ ...prev, choice2Content: content }))}
                    />
                    <ContentInput
                      label="Choice 3"
                      value={formData.choice3Content}
                      onChange={(content) => setFormData(prev => ({ ...prev, choice3Content: content }))}
                    />
                    <ContentInput
                      label="Choice 4"
                      value={formData.choice4Content}
                      onChange={(content) => setFormData(prev => ({ ...prev, choice4Content: content }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correct_choice">Correct Choice (1-4)</Label>
                    <Input
                      id="correct_choice"
                      value={formData.correct_choice}
                      onChange={(e) => setFormData(prev => ({ ...prev, correct_choice: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {formData.question_type === 'text' && (
                <div className="space-y-2">
                  <Label htmlFor="answer">Answer</Label>
                  <Input
                    id="answer"
                    value={formData.answer}
                    onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="picture">Picture URL</Label>
                  <Input
                    id="picture"
                    value={formData.picture}
                    onChange={(e) => setFormData(prev => ({ ...prev, picture: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video">Video URL</Label>
                  <Input
                    id="video"
                    value={formData.video}
                    onChange={(e) => setFormData(prev => ({ ...prev, video: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation</Label>
                <Textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    editingQuestion ? 'Update Question' : 'Create Question'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Content</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="max-w-xs truncate">{question.noi_dung}</TableCell>
                <TableCell>{question.question_type}</TableCell>
                <TableCell>
                  {contents.find(c => c.id === question.contentid)?.title || 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(question)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
