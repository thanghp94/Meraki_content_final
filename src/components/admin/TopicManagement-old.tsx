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

  const handleAddContentToTopic = (topicId: string) => {
    setSelectedTopicForContent(topicId);
    setContentFormData(prev => ({ ...prev, topicid: topicId }));
    setIsContentDialogOpen(true);
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

  // Group content by topic
  const getContentForTopic = (topicId: string): Content[] => {
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

  const topicsByUnit = getTopicsByUnit();

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

      {/* Main Content */}
      <div className="space-y-4">
        {Object.entries(topicsByUnit).map(([unit, unitTopics]) => (
          <Card key={unit} className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-blue-700 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {unit}
                <Badge variant="secondary" className="ml-auto">
                  {unitTopics.length} topics
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {unitTopics.map((topic) => {
                const topicContent = getContentForTopic(topic.id);
                const isExpanded = expandedTopics.has(topic.id);
                
                return (
                  <Card key={topic.id} className="border border-gray-200">
                    <Collapsible open={isExpanded}>
                      <CollapsibleTrigger>
                        <CardHeader 
                          className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleTopicExpansion(topic.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-gray-400" />
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-gray-600" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-600" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-lg">{topic.topic}</h3>
                                  {topic.showstudent ? (
                                    <Eye className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                                {topic.short_summary && (
                                  <p className="text-sm text-gray-600 mt-1">{topic.short_summary}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {topicContent.length} content items
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddContentToTopic(topic.id);
                                  }}
                                  className="h-8 w-8 p-0"
                                  title="Add Content"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTopic(topic);
                                  }}
                                  className="h-8 w-8 p-0"
                                  title="Edit Topic"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTopic(topic.id);
                                  }}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  title="Delete Topic"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent 
                        className="transition-all duration-200 overflow-hidden"
                        style={{ 
                          maxHeight: isExpanded ? '2000px' : '0',
                          opacity: isExpanded ? 1 : 0
                        }}
                      >
                        <CardContent className="pt-0 pl-12">
                          {topicContent.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                              <p>No content items yet</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddContentToTopic(topic.id)}
                                className="mt-2"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add First Content
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {topicContent.map((contentItem) => {
                                const contentQuestions = questions[contentItem.id] || [];
                                const isContentExpanded = expandedContent.has(contentItem.id);
                                
                                return (
                                  <Card key={contentItem.id} className="border border-gray-100 bg-gray-50">
                                    <Collapsible open={isContentExpanded}>
                                      <CollapsibleTrigger>
                                        <CardHeader 
                                          className="pb-2 cursor-pointer hover:bg-gray-100 transition-colors"
                                          onClick={() => toggleContentExpansion(contentItem.id)}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <div className="flex items-center gap-2">
                                                <GripVertical className="h-3 w-3 text-gray-400" />
                                                {isContentExpanded ? (
                                                  <ChevronDown className="h-3 w-3 text-gray-600" />
                                                ) : (
                                                  <ChevronRight className="h-3 w-3 text-gray-600" />
                                                )}
                                                <FileText className="h-4 w-4 text-blue-600" />
                                              </div>
                                              <div>
                                                <h4 className="font-medium">{contentItem.title}</h4>
                                                <p className="text-xs text-gray-500 mt-1">
                                                  Content • {contentItem.question_count} questions
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Badge variant="secondary" className="text-xs">
                                                {contentItem.question_count} questions
                                              </Badge>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  // Add question functionality
                                                }}
                                                className="h-6 w-6 p-0"
                                                title="Add Question"
                                              >
                                                <Plus className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  // AI generate questions
                                                }}
                                                className="h-6 w-6 p-0 text-purple-600"
                                                title="AI Generate Questions"
                                              >
                                                <Sparkles className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleEditContent(contentItem);
                                                }}
                                                className="h-6 w-6 p-0"
                                                title="Edit Content"
                                              >
                                                <Pencil className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteContent(contentItem.id);
                                                }}
                                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                                title="Delete Content"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        </CardHeader>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent 
                                        className="transition-all duration-200 overflow-hidden"
                                        style={{ 
                                          maxHeight: isContentExpanded ? '1000px' : '0',
                                          opacity: isContentExpanded ? 1 : 0
                                        }}
                                      >
                                        <CardContent className="pt-0 pl-8">
                                          {contentQuestions.length === 0 ? (
                                            <div className="text-center py-6 text-gray-500">
                                              <HelpCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                              <p className="text-sm">No questions yet</p>
                                              <div className="flex gap-2 justify-center mt-2">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => {
                                                    // Add question manually
                                                  }}
                                                  className="text-xs"
                                                >
                                                  <Plus className="h-3 w-3 mr-1" />
                                                  Add Question
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => {
                                                    // AI generate questions
                                                  }}
                                                  className="text-xs text-purple-600 border-purple-200"
                                                >
                                                  <Sparkles className="h-3 w-3 mr-1" />
                                                  AI Generate
                                                </Button>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="space-y-2">
                                              {contentQuestions.map((question, index) => (
                                                <div key={question.id} className="flex items-center justify-between p-3 bg-white rounded border border-gray-100">
                                                  <div className="flex items-center gap-3 flex-1">
                                                    <div className="flex items-center gap-2">
                                                      <GripVertical className="h-3 w-3 text-gray-400" />
                                                      <HelpCircle className="h-3 w-3 text-green-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                      <p className="text-sm font-medium line-clamp-2">
                                                        {question.noi_dung}
                                                      </p>
                                                      <p className="text-xs text-gray-500 mt-1">
                                                        Multiple Choice • Answer: {question.correct_choice}
                                                      </p>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-1">
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => {
                                                        // Edit question
                                                      }}
                                                      className="h-6 w-6 p-0"
                                                      title="Edit Question"
                                                    >
                                                      <Pencil className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => {
                                                        // Delete question
                                                      }}
                                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                                      title="Delete Question"
                                                    >
                                                      <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </CardContent>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  </Card>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
