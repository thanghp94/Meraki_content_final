'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2, Plus, Pencil, Trash2, FileText, HelpCircle, 
  ChevronDown, ChevronRight, Eye, EyeOff, GripVertical,
  ArrowUp, ArrowDown, Sparkles, BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QuizGeneratorModal } from './QuizGeneratorModal';
import ContentInput from './ContentInput';
import { ContentData, EnhancedFormData, parseContentData, stringifyContentData } from '@/types/question';

interface Topic {
  id: string;
  topic: string;
  short_summary: string;
  unit: string;
  image: string;
  parentid: string | null;
  showstudent: boolean;
  order_index?: number;
}

interface Content {
  id: string;
  title: string;
  infor1: string;
  infor2: string;
  image1: string;
  video1: string;
  topicid: string;
  topic_name: string;
  topic_unit: string;
  question_count: number;
  date_created: string;
  visible?: boolean;
  order_index?: number;
}

interface Question {
  id: string;
  noi_dung: string;
  cau_tra_loi_1: string;
  cau_tra_loi_2: string;
  cau_tra_loi_3: string;
  cau_tra_loi_4: string;
  correct_choice: string;
  explanation: string;
  contentid: string;
  visible?: boolean;
  order_index?: number;
}

export default function TopicManagement() {
  const { toast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [questions, setQuestions] = useState<{ [contentId: string]: Question[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedContent, setExpandedContent] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isQuizGeneratorOpen, setIsQuizGeneratorOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedTopicForContent, setSelectedTopicForContent] = useState<string>('');
  const [selectedContentForQuestion, setSelectedContentForQuestion] = useState<string>('');
  const [selectedContentForAI, setSelectedContentForAI] = useState<{ id: string; title: string } | null>(null);

  // Form data
  const [topicFormData, setTopicFormData] = useState({
    topic: '',
    short_summary: '',
    unit: '',
    image: '',
    showstudent: true
  });

  const [contentFormData, setContentFormData] = useState({
    title: '',
    infor1: '',
    infor2: '',
    image1: '',
    video1: '',
    topicid: ''
  });

  const [questionFormData, setQuestionFormData] = useState<EnhancedFormData>({
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
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchTopics(),
        fetchContent()
      ]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/admin/topics');
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/admin/content');
      if (!response.ok) throw new Error('Failed to fetch content');
      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const fetchQuestionsForContent = async (contentId: string) => {
    try {
      const response = await fetch(`/api/admin/content/${contentId}`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(prev => ({
        ...prev,
        [contentId]: data.questions || []
      }));
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const toggleTopicExpansion = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const toggleContentExpansion = async (contentId: string) => {
    const newExpanded = new Set(expandedContent);
    if (newExpanded.has(contentId)) {
      newExpanded.delete(contentId);
    } else {
      newExpanded.add(contentId);
      // Fetch questions if not already loaded
      if (!questions[contentId]) {
        await fetchQuestionsForContent(contentId);
      }
    }
    setExpandedContent(newExpanded);
  };

  // Group content by topic
  const getContentForTopic = (topicId: string) => {
    return content.filter(c => c.topicid === topicId);
  };

  // Group topics by unit
  const getTopicsByUnit = () => {
    const grouped = topics.reduce((acc, topic) => {
      const unit = topic.unit || 'Uncategorized';
      if (!acc[unit]) acc[unit] = [];
      acc[unit].push(topic);
      return acc;
    }, {} as { [unit: string]: Topic[] });

    // Sort topics within each unit
    Object.keys(grouped).forEach(unit => {
      grouped[unit].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    });

    return grouped;
  };

  // Handle topic operations
  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingTopic 
        ? `/api/admin/topics/${editingTopic.id}`
        : '/api/admin/topics';
      
      const response = await fetch(url, {
        method: editingTopic ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicFormData),
      });

      if (!response.ok) throw new Error('Failed to save topic');

      toast({
        title: editingTopic ? 'Topic Updated' : 'Topic Created',
        description: `Successfully ${editingTopic ? 'updated' : 'created'} the topic.`,
      });

      setIsTopicDialogOpen(false);
      resetTopicForm();
      fetchTopics();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingTopic ? 'update' : 'create'} topic`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingContent 
        ? `/api/admin/content/${editingContent.id}`
        : '/api/admin/content';
      
      const response = await fetch(url, {
        method: editingContent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentFormData),
      });

      if (!response.ok) throw new Error('Failed to save content');

      toast({
        title: editingContent ? 'Content Updated' : 'Content Created',
        description: `Successfully ${editingContent ? 'updated' : 'created'} the content.`,
      });

      setIsContentDialogOpen(false);
      resetContentForm();
      fetchContent();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingContent ? 'update' : 'create'} content`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingQuestion 
        ? `/api/admin/questions/${editingQuestion.id}`
        : '/api/admin/questions';
      
      // Transform enhanced form data back to API format
      const apiData = {
        ...questionFormData,
        noi_dung: stringifyContentData(questionFormData.questionContent),
        cau_tra_loi_1: stringifyContentData(questionFormData.choice1Content),
        cau_tra_loi_2: stringifyContentData(questionFormData.choice2Content),
        cau_tra_loi_3: stringifyContentData(questionFormData.choice3Content),
        cau_tra_loi_4: stringifyContentData(questionFormData.choice4Content),
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

      setIsQuestionDialogOpen(false);
      resetQuestionForm();
      // Refresh the questions for the content
      if (selectedContentForQuestion) {
        await fetchQuestionsForContent(selectedContentForQuestion);
      }
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

  const resetTopicForm = () => {
    setEditingTopic(null);
    setTopicFormData({
      topic: '',
      short_summary: '',
      unit: '',
      image: '',
      showstudent: true
    });
  };

  const resetContentForm = () => {
    setEditingContent(null);
    setSelectedTopicForContent('');
    setContentFormData({
      title: '',
      infor1: '',
      infor2: '',
      image1: '',
      video1: '',
      topicid: ''
    });
  };

  const resetQuestionForm = () => {
    setEditingQuestion(null);
    setSelectedContentForQuestion('');
    setQuestionFormData({
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

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setTopicFormData({
      topic: topic.topic,
      short_summary: topic.short_summary,
      unit: topic.unit,
      image: topic.image,
      showstudent: topic.showstudent
    });
    setIsTopicDialogOpen(true);
  };

  const handleEditContent = (content: Content) => {
    setEditingContent(content);
    setContentFormData({
      title: content.title,
      infor1: content.infor1,
      infor2: content.infor2,
      image1: content.image1,
      video1: content.video1,
      topicid: content.topicid
    });
    setIsContentDialogOpen(true);
  };

  const handleAddContentToTopic = (topicId: string) => {
    setSelectedTopicForContent(topicId);
    setContentFormData(prev => ({ ...prev, topicid: topicId }));
    setIsContentDialogOpen(true);
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Are you sure you want to delete this topic? This will also delete all associated content and questions.')) return;

    try {
      const response = await fetch(`/api/admin/topics/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete topic');

      toast({
        title: 'Topic Deleted',
        description: 'Successfully deleted the topic and all associated content.',
      });

      fetchAllData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete topic',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content? This will also delete all associated questions.')) return;

    try {
      const response = await fetch(`/api/admin/content/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete content');

      toast({
        title: 'Content Deleted',
        description: 'Successfully deleted the content and all associated questions.',
      });

      fetchContent();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete content',
        variant: 'destructive',
      });
    }
  };

  // Add handlers for AI generation and question management
  const handleAIGenerate = (contentId: string, contentTitle: string) => {
    setSelectedContentForAI({ id: contentId, title: contentTitle });
    setIsQuizGeneratorOpen(true);
  };

  const handleAddQuestion = (contentId: string) => {
    setSelectedContentForQuestion(contentId);
    setQuestionFormData(prev => ({ ...prev, contentid: contentId }));
    setIsQuestionDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const topicsByUnit = getTopicsByUnit();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Topic Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage topics, content, and questions in a hierarchical structure
          </p>
        </div>
        <Dialog open={isTopicDialogOpen} onOpenChange={(open) => {
          setIsTopicDialogOpen(open);
          if (!open) resetTopicForm();
        }}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-5 w-5 mr-2" />
              Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTopic ? 'Edit Topic' : 'Add New Topic'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleTopicSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic Name</Label>
                  <Input
                    id="topic"
                    value={topicFormData.topic}
                    onChange={(e) => setTopicFormData(prev => ({ ...prev, topic: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={topicFormData.unit}
                    onChange={(e) => setTopicFormData(prev => ({ ...prev, unit: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_summary">Summary</Label>
                <Textarea
                  id="short_summary"
                  value={topicFormData.short_summary}
                  onChange={(e) => setTopicFormData(prev => ({ ...prev, short_summary: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={topicFormData.image}
                  onChange={(e) => setTopicFormData(prev => ({ ...prev, image: e.target.value }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showstudent"
                  checked={topicFormData.showstudent}
                  onCheckedChange={(checked) => setTopicFormData(prev => ({ ...prev, showstudent: checked }))}
                />
                <Label htmlFor="showstudent">Visible to students</Label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsTopicDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {editingTopic ? 'Update Topic' : 'Create Topic'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content Creation Dialog */}
      <Dialog open={isContentDialogOpen} onOpenChange={(open) => {
        setIsContentDialogOpen(open);
        if (!open) resetContentForm();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? 'Edit Content' : 'Add New Content'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleContentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content-title">Title</Label>
              <Input
                id="content-title"
                value={contentFormData.title}
                onChange={(e) => setContentFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content-infor1">Description</Label>
                <Textarea
                  id="content-infor1"
                  value={contentFormData.infor1}
                  onChange={(e) => setContentFormData(prev => ({ ...prev, infor1: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content-infor2">Additional Information</Label>
                <Textarea
                  id="content-infor2"
                  value={contentFormData.infor2}
                  onChange={(e) => setContentFormData(prev => ({ ...prev, infor2: e.target.value }))}
                  rows={4}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content-image1">Image URL</Label>
                <Input
                  id="content-image1"
                  value={contentFormData.image1}
                  onChange={(e) => setContentFormData(prev => ({ ...prev, image1: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content-video1">Video URL</Label>
                <Input
                  id="content-video1"
                  value={contentFormData.video1}
                  onChange={(e) => setContentFormData(prev => ({ ...prev, video1: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsContentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {editingContent ? 'Update Content' : 'Create Content'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Question Creation Dialog */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={(open) => {
        setIsQuestionDialogOpen(open);
        if (!open) resetQuestionForm();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleQuestionSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="question_type">Question Type</Label>
                <Select
                  value={questionFormData.question_type}
                  onValueChange={(value) => setQuestionFormData(prev => ({ ...prev, question_type: value }))}
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
              <div className="space-y-2">
                <Label htmlFor="time">Time (seconds)</Label>
                <Input
                  id="time"
                  type="number"
                  value={questionFormData.time}
                  onChange={(e) => setQuestionFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <ContentInput
              label="Question Text"
              value={questionFormData.questionContent}
              onChange={(content) => setQuestionFormData(prev => ({ ...prev, questionContent: content }))}
              isTextArea={true}
              required={true}
            />

            {questionFormData.question_type === 'multiple_choice' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ContentInput
                    label="Choice 1"
                    value={questionFormData.choice1Content}
                    onChange={(content) => setQuestionFormData(prev => ({ ...prev, choice1Content: content }))}
                  />
                  <ContentInput
                    label="Choice 2"
                    value={questionFormData.choice2Content}
                    onChange={(content) => setQuestionFormData(prev => ({ ...prev, choice2Content: content }))}
                  />
                  <ContentInput
                    label="Choice 3"
                    value={questionFormData.choice3Content}
                    onChange={(content) => setQuestionFormData(prev => ({ ...prev, choice3Content: content }))}
                  />
                  <ContentInput
                    label="Choice 4"
                    value={questionFormData.choice4Content}
                    onChange={(content) => setQuestionFormData(prev => ({ ...prev, choice4Content: content }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correct_choice">Correct Choice (1-4)</Label>
                  <Input
                    id="correct_choice"
                    value={questionFormData.correct_choice}
                    onChange={(e) => setQuestionFormData(prev => ({ ...prev, correct_choice: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {questionFormData.question_type === 'text' && (
              <div className="space-y-2">
                <Label htmlFor="answer">Answer</Label>
                <Input
                  id="answer"
                  value={questionFormData.answer}
                  onChange={(e) => setQuestionFormData(prev => ({ ...prev, answer: e.target.value }))}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="explanation">Explanation</Label>
              <Textarea
                id="explanation"
                value={questionFormData.explanation}
                onChange={(e) => setQuestionFormData(prev => ({ ...prev, explanation: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsQuestionDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {editingQuestion ? 'Update Question' : 'Create Question'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="space-y-4">
        {Object.entries(topicsByUnit).map(([unit, unitTopics]) => (
          <Card key={unit} className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-blue-700 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {unit}
                <Badge variant="secondary" className="ml-auto">
                  {unitTopics.length} topics
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Conditional layout based on expanded state */}
              {expandedTopics.size > 0 ? (
                // When topics are expanded, show them in a different layout
                <div className="space-y-3">
                  {/* Expanded topics first - full width */}
                  {unitTopics
                    .filter(topic => expandedTopics.has(topic.id))
                    .map((topic) => {
                      const topicContent = getContentForTopic(topic.id);
                      
                      return (
                        <Card key={topic.id} className="border border-gray-200">
                          <Collapsible open={true}>
                            <CollapsibleTrigger>
                              <CardHeader 
                                className="pb-2 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleTopicExpansion(topic.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <GripVertical className="h-4 w-4 text-gray-400" />
                                      <ChevronDown className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-base">{topic.topic}</h3>
                                        {topic.showstudent ? (
                                          <Eye className="h-4 w-4 text-green-600" />
                                        ) : (
                                          <EyeOff className="h-4 w-4 text-gray-400" />
                                        )}
                                      </div>
                                      {topic.short_summary && (
                                        <p className="text-sm
