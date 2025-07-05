'use client';

import { useState, useEffect } from 'react';
import '@/styles/topic-management.css';
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
  ArrowUp, ArrowDown, Sparkles, BookOpen, Search, Play
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QuizGeneratorModal } from './QuizGeneratorModal';
import { ContentGeneratorModal } from './ContentGeneratorModal';
import { ImageSearchModal } from './ImageSearchModal';
import { YouTubeSearchModal } from './YouTubeSearchModal';
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
  program?: string;
  visible?: boolean;
  order_index?: number;
}

interface Content {
  id: string;
  title: string;
  infor1: string;
  infor2: string;
  image1: string;
  image2?: string;
  video1: string;
  video2?: string;
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
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  
  // Dialog states
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isQuizGeneratorOpen, setIsQuizGeneratorOpen] = useState(false);
  const [isContentGeneratorOpen, setIsContentGeneratorOpen] = useState(false);
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);
  const [isYouTubeSearchOpen, setIsYouTubeSearchOpen] = useState(false);
  const [currentImageField, setCurrentImageField] = useState<'image1' | 'image2'>('image1');
  const [currentVideoField, setCurrentVideoField] = useState<'video1' | 'video2'>('video1');
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedTopicForContent, setSelectedTopicForContent] = useState<string>('');
  const [selectedContentForQuestion, setSelectedContentForQuestion] = useState<string>('');
  const [selectedContentForAI, setSelectedContentForAI] = useState<{ id: string; title: string } | null>(null);
  const [selectedTopicForAI, setSelectedTopicForAI] = useState<{ id: string; name: string; summary: string } | null>(null);

  // Form data
  const [topicFormData, setTopicFormData] = useState({
    topic: '',
    short_summary: '',
    unit: '',
    image: '',
    showstudent: true,
    program: ''
  });

  const [contentFormData, setContentFormData] = useState({
    title: '',
    infor1: '',
    infor2: '',
    image1: '',
    image2: '',
    video1: '',
    video2: '',
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
    // Only fetch topics initially - content will be loaded on demand
    fetchTopicsOnly();
  }, []);

  const fetchTopicsOnly = async () => {
    setIsLoading(true);
    try {
      await fetchTopics();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load topics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      
      // Ensure all content items have proper order_index values
      const contentWithOrder = data.map((item: Content, index: number) => ({
        ...item,
        order_index: item.order_index !== undefined ? item.order_index : index
      }));
      
      setContent(contentWithOrder);
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

  const toggleUnitSelection = async (unit: string) => {
    if (selectedUnit === unit) {
      setSelectedUnit('');
    } else {
      setSelectedUnit(unit);
      
      // Fetch content on first unit selection if not already loaded
      if (content.length === 0) {
        try {
          await fetchContent();
        } catch (error) {
          console.error('Error fetching content:', error);
          toast({
            title: 'Error',
            description: 'Failed to load content',
            variant: 'destructive',
          });
        }
      }
    }
  };

  const toggleTopicExpansion = async (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
      
      // Fetch content on first expansion if not already loaded
      if (content.length === 0) {
        try {
          await fetchContent();
        } catch (error) {
          console.error('Error fetching content:', error);
          toast({
            title: 'Error',
            description: 'Failed to load content',
            variant: 'destructive',
          });
        }
      }
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
    const topicContent = content.filter(c => c.topicid === topicId);
    
    // Assign default order_index based on array position if not set
    const contentWithOrder = topicContent.map((item, index) => ({
      ...item,
      order_index: item.order_index !== undefined ? item.order_index : index
    }));
    
    return contentWithOrder.sort((a, b) => a.order_index - b.order_index);
  };

  // Group topics by unit with program filtering
  const getTopicsByUnit = () => {
    // Filter topics by selected program
    const filteredTopics = selectedProgram === 'all' 
      ? topics 
      : topics.filter(topic => topic.program === selectedProgram);

    const grouped = filteredTopics.reduce((acc, topic) => {
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

  // Get topics for selected unit
  const getTopicsForSelectedUnit = () => {
    if (!selectedUnit) return [];
    const topicsByUnit = getTopicsByUnit();
    return topicsByUnit[selectedUnit] || [];
  };

  // Handle topic operations
  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingTopic 
        ? `/api/admin/topics/${editingTopic.id}`
        : '/api/admin/topics';
      
      // For updates, include all existing fields to avoid missing data
      const requestData = editingTopic 
        ? {
            ...topicFormData,
            visible: editingTopic.visible,
            order_index: editingTopic.order_index
          }
        : topicFormData;
      
      const response = await fetch(url, {
        method: editingTopic ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error('Failed to save topic');
      }

      toast({
        title: editingTopic ? 'Topic Updated' : 'Topic Created',
        description: `Successfully ${editingTopic ? 'updated' : 'created'} the topic.`,
      });

      setIsTopicDialogOpen(false);
      resetTopicForm();
      fetchTopics();
    } catch (error) {
      console.error('Topic submit error:', error);
      toast({
        title: 'Error',
        description: `Failed to ${editingTopic ? 'update' : 'create'} topic`,
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
      showstudent: true,
      program: ''
    });
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setTopicFormData({
      topic: topic.topic,
      short_summary: topic.short_summary,
      unit: topic.unit,
      image: topic.image,
      showstudent: topic.showstudent,
      program: topic.program || ''
    });
    setIsTopicDialogOpen(true);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const topicsByUnit = getTopicsByUnit();
  const selectedUnitTopics = getTopicsForSelectedUnit();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Topic Management</h1>
          <div className="flex items-center gap-4 mt-3">
            <Label className="text-sm font-medium">Filter by Program:</Label>
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                <SelectItem value="Grapeseed">Grapeseed</SelectItem>
                <SelectItem value="TATH">TATH</SelectItem>
                <SelectItem value="WSC">WSC</SelectItem>
                <SelectItem value="pre_WSC">pre_WSC</SelectItem>
                <SelectItem value="Debate">Debate</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                  <Label htmlFor="program">Program</Label>
                  <Select
                    value={topicFormData.program}
                    onValueChange={(value) => setTopicFormData(prev => ({ ...prev, program: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Grapeseed">Grapeseed</SelectItem>
                      <SelectItem value="TATH">TATH</SelectItem>
                      <SelectItem value="WSC">WSC</SelectItem>
                      <SelectItem value="pre_WSC">pre_WSC</SelectItem>
                      <SelectItem value="Debate">Debate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  {topicFormData.program === 'Grapeseed' ? (
                    <Select
                      value={topicFormData.unit}
                      onValueChange={(value) => setTopicFormData(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 40 }, (_, i) => (
                          <SelectItem key={i + 1} value={`Unit ${i + 1}`}>
                            Unit {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="unit"
                      value={topicFormData.unit}
                      onChange={(e) => setTopicFormData(prev => ({ ...prev, unit: e.target.value }))}
                      required
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={topicFormData.image}
                    onChange={(e) => setTopicFormData(prev => ({ ...prev, image: e.target.value }))}
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

      {/* Main Content with Sidebar Layout */}
      <div className="box-border flex relative w-full max-w-[1440px] min-h-[600px] bg-white border-2 border-gray-300 rounded-lg mx-auto">
        {/* Sidebar for units */}
        <div className="w-48 border-r border-gray-200 bg-gray-50">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Units</h3>
            <div className="space-y-1">
              {Object.entries(topicsByUnit).map(([unit, unitTopics]) => {
                const isSelected = selectedUnit === unit;
                
                return (
                  <div
                    key={unit}
                    className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => toggleUnitSelection(unit)}
                  >
                    <span className="text-sm font-medium truncate">
                      {unit}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {unitTopics.length}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 p-6">
          {!selectedUnit ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Unit</h3>
              <p>Choose a unit from the sidebar to view its topics.</p>
            </div>
          ) : (
            <div className="w-full">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-blue-700">{selectedUnit}</h2>
                <p className="text-gray-600 mt-1">Topics for this unit</p>
              </div>
              
              <div className="space-y-4">
                {selectedUnitTopics.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No topics in this unit yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedUnitTopics.map((topic) => {
                      const topicContent = getContentForTopic(topic.id);
                      const isExpanded = expandedTopics.has(topic.id);
                      
                      return (
                        <Card key={topic.id} className="border border-gray-200">
                          <Collapsible open={isExpanded}>
                            <CollapsibleTrigger>
                              <CardHeader 
                                className="pb-2 cursor-pointer hover:bg-gray-50 transition-colors"
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
                                        <h3 className="font-semibold text-base">{topic.topic}</h3>
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
                                      {topicContent.length} content
                                    </Badge>
                                    <div className="flex items-center gap-1">
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
                              <CardContent className="pt-0 pl-8">
                                {topicContent.length === 0 ? (
                                  <div className="text-center py-6 text-gray-500">
                                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No content items yet</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {topicContent.map((contentItem) => (
                                      <div key={contentItem.id} className="p-2 bg-gray-50 rounded border">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium">{contentItem.title}</span>
                                          </div>
                                          <Badge variant="secondary" className="text-xs">
                                            {contentItem.question_count} questions
                                          </Badge>
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
