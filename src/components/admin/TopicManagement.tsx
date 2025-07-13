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
import AdminQuestionDialog from './AdminQuestionDialog';
import ContentViewModal from '@/components/ui/content-view-modal-fixed';
import { ContentData, EnhancedFormData, parseContentData, stringifyContentData } from '@/types/question';

// Constants for better maintainability
const CONSTANTS = {
  GRAPESEED_UNITS_COUNT: 40,
  GRID_COLUMNS: 4,
  ANIMATION_DURATION: 200,
  MAX_HEIGHT: {
    EXPANDED_TOPIC: '2000px',
    EXPANDED_CONTENT: '1000px',
    COLLAPSED: '0',
  },
  DISPLAY_LABELS: {
    HIDDEN: 'H',
    MULTIPLE_CHOICE: 'Multiple Choice',
    TEXT: 'Text',
    NOT_AVAILABLE: 'N/A',
  },
} as const;

// Utility functions
const getDisplayNumber = (item: { visible?: boolean }, allItems: any[], unit?: string) => {
  const unitItems = unit ? allItems.filter(i => i.unit === unit) : allItems;
  const visibleItems = unitItems.filter(item => item.visible !== false);
  
  if (item.visible === false) {
    return CONSTANTS.DISPLAY_LABELS.HIDDEN;
  }
  
  const sortedVisibleItems = visibleItems.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  const visibleIndex = sortedVisibleItems.findIndex(i => i.id === (item as any).id);
  return visibleIndex + 1;
};

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
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedContentForView, setSelectedContentForView] = useState<Content | null>(null);
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
      
      // Replace the entire questions array for this content
      setQuestions(prev => {
        const newQuestions = { ...prev };
        newQuestions[contentId] = data.questions || [];
        return newQuestions;
      });
      
      // Ensure the content is expanded to show updated questions
      setExpandedContent(prev => {
        const newExpanded = new Set(prev);
        newExpanded.add(contentId);
        return newExpanded;
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh questions',
        variant: 'destructive',
      });
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

  // Get display order for content (visible items first, then hidden)
  const getContentDisplayOrder = (topicId: string) => {
    const topicContent = getContentForTopic(topicId);
    
    // Separate visible and hidden content
    const visibleContent = topicContent.filter(item => item.visible !== false);
    const hiddenContent = topicContent.filter(item => item.visible === false);
    
    // Return visible content first, then hidden content
    return [...visibleContent, ...hiddenContent];
  };

  // Get display number for content item
  const getContentDisplayNumber = (contentItem: Content, topicId: string) => {
    const displayOrder = getContentDisplayOrder(topicId);
    return getDisplayNumber(contentItem, displayOrder);
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
        // eslint-disable-next-line no-console
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
      // Get the contentId before we reset the form
      const contentId = editingQuestion?.contentid || selectedContentForQuestion;
      if (!contentId) {
        throw new Error('Content ID is required');
      }
      
      const url = editingQuestion 
        ? `/api/admin/questions/${editingQuestion.id}`
        : '/api/admin/questions';
      
      // Transform enhanced form data back to API format
      const apiData = {
        ...questionFormData,
        contentid: contentId, // Use the stored contentId
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

      const result = await response.json();
      
      // Show success message
      toast({
        title: editingQuestion ? 'Question Updated' : 'Question Created',
        description: `Successfully ${editingQuestion ? 'updated' : 'created'} the question.`,
      });

      // Force refresh the questions for this content
      await fetchQuestionsForContent(contentId);
      
      // Close dialog and reset form after successful update
      setIsQuestionDialogOpen(false);
      resetQuestionForm();
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
      showstudent: true,
      program: ''
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
      image2: '',
      video1: '',
      video2: '',
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
      showstudent: topic.showstudent,
      program: topic.program || ''
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
      image2: content.image2 || '',
      video1: content.video1,
      video2: content.video2 || '',
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

  const handleAIGenerateContent = (topicId: string, topicName: string, topicSummary: string) => {
    setSelectedTopicForAI({ id: topicId, name: topicName, summary: topicSummary });
    setIsContentGeneratorOpen(true);
  };

  const handleContentGenerated = () => {
    fetchContent();
  };

  const handleAddQuestion = (contentId: string) => {
    setSelectedContentForQuestion(contentId);
    setQuestionFormData(prev => ({ ...prev, contentid: contentId }));
    setIsQuestionDialogOpen(true);
  };

  const handleToggleContentVisibility = async (contentId: string) => {
    const contentItem = content.find(c => c.id === contentId);
    if (!contentItem) return;

    // Handle undefined visible property - default to true if undefined, but respect false values
    const currentVisibility = contentItem.visible !== false;
    const newVisibility = !currentVisibility;

    // Update local state immediately for instant UI feedback
    const updatedContent = content.map(item => 
      item.id === contentId 
        ? { ...item, visible: newVisibility }
        : item
    );
    setContent(updatedContent);

    try {
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contentItem,
          visible: newVisibility
        }),
      });

      if (!response.ok) throw new Error('Failed to update content visibility');

      toast({
        title: 'Content Updated',
        description: `Content is now ${newVisibility ? 'visible' : 'hidden'}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update content visibility',
        variant: 'destructive',
      });
      // Revert local state on error
      fetchContent();
    }
  };

  const handleStartDrag = (e: React.MouseEvent, item: Content | Topic) => {
    e.preventDefault();
    // Simple reordering with up/down buttons instead of complex drag-and-drop
    // This is a placeholder for now
  };

  const handleMoveContentUp = async (contentId: string, topicId: string) => {
    const topicContent = getContentForTopic(topicId);
    const currentIndex = topicContent.findIndex(c => c.id === contentId);
    if (currentIndex <= 0) return;

    const currentItem = topicContent[currentIndex];
    const previousItem = topicContent[currentIndex - 1];
    
    // Assign proper sequential order indices
    const currentNewOrder = currentIndex - 1;
    const previousNewOrder = currentIndex;
    
    // Update local state immediately for instant UI feedback
    const updatedContent = content.map(item => {
      if (item.id === currentItem.id) {
        return { ...item, order_index: currentNewOrder };
      }
      if (item.id === previousItem.id) {
        return { ...item, order_index: previousNewOrder };
      }
      return item;
    });
    setContent(updatedContent);
    
    try {
      await Promise.all([
        fetch(`/api/admin/content/${currentItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...currentItem, 
            order_index: currentNewOrder
          }),
        }),
        fetch(`/api/admin/content/${previousItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...previousItem, 
            order_index: previousNewOrder
          }),
        })
      ]);
      
      toast({
        title: 'Content Moved',
        description: 'Content moved up successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reorder content',
        variant: 'destructive',
      });
      // Revert local state on error
      fetchContent();
    }
  };

  const handleMoveContentDown = async (contentId: string, topicId: string) => {
    const topicContent = getContentForTopic(topicId);
    const currentIndex = topicContent.findIndex(c => c.id === contentId);
    if (currentIndex >= topicContent.length - 1) return;

    const currentItem = topicContent[currentIndex];
    const nextItem = topicContent[currentIndex + 1];
    
    // Assign proper sequential order indices
    const currentNewOrder = currentIndex + 1;
    const nextNewOrder = currentIndex;
    
    // Update local state immediately for instant UI feedback
    const updatedContent = content.map(item => {
      if (item.id === currentItem.id) {
        return { ...item, order_index: currentNewOrder };
      }
      if (item.id === nextItem.id) {
        return { ...item, order_index: nextNewOrder };
      }
      return item;
    });
    setContent(updatedContent);
    
    try {
      await Promise.all([
        fetch(`/api/admin/content/${currentItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...currentItem, 
            order_index: currentNewOrder
          }),
        }),
        fetch(`/api/admin/content/${nextItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...nextItem, 
            order_index: nextNewOrder
          }),
        })
      ]);
      
      toast({
        title: 'Content Moved',
        description: 'Content moved down successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reorder content',
        variant: 'destructive',
      });
      // Revert local state on error
      fetchContent();
    }
  };

  // Topic visibility and ordering functions
  const handleToggleTopicVisibility = async (topicId: string) => {
    const topicItem = topics.find(t => t.id === topicId);
    if (!topicItem) return;

    // Handle undefined visible property - default to true if undefined, but respect false values
    const currentVisibility = topicItem.visible !== false;
    const newVisibility = !currentVisibility;

    // Update local state immediately for instant UI feedback
    const updatedTopics = topics.map(item => 
      item.id === topicId 
        ? { ...item, visible: newVisibility }
        : item
    );
    setTopics(updatedTopics);

    try {
      const response = await fetch(`/api/admin/topics/${topicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...topicItem,
          visible: newVisibility
        }),
      });

      if (!response.ok) throw new Error('Failed to update topic visibility');

      toast({
        title: 'Topic Updated',
        description: `Topic is now ${newVisibility ? 'visible' : 'hidden'}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update topic visibility',
        variant: 'destructive',
      });
      // Revert local state on error
      fetchTopics();
    }
  };

  const handleMoveTopicUp = async (topicId: string, unit: string) => {
    const unitTopics = topics.filter(t => t.unit === unit).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    const currentIndex = unitTopics.findIndex(t => t.id === topicId);
    if (currentIndex <= 0) return;

    const currentItem = unitTopics[currentIndex];
    const previousItem = unitTopics[currentIndex - 1];
    
    // Swap order indices
    const currentNewOrder = previousItem.order_index || 0;
    const previousNewOrder = currentItem.order_index || 0;
    
    // Update local state immediately for instant UI feedback
    const updatedTopics = topics.map(item => {
      if (item.id === currentItem.id) {
        return { ...item, order_index: currentNewOrder };
      }
      if (item.id === previousItem.id) {
        return { ...item, order_index: previousNewOrder };
      }
      return item;
    });
    setTopics(updatedTopics);
    
    try {
      const responses = await Promise.all([
        fetch(`/api/admin/topics/${currentItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            topic: currentItem.topic,
            short_summary: currentItem.short_summary,
            unit: currentItem.unit,
            image: currentItem.image,
            showstudent: currentItem.showstudent,
            visible: currentItem.visible,
            order_index: currentNewOrder
          }),
        }),
        fetch(`/api/admin/topics/${previousItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            topic: previousItem.topic,
            short_summary: previousItem.short_summary,
            unit: previousItem.unit,
            image: previousItem.image,
            showstudent: previousItem.showstudent,
            visible: previousItem.visible,
            order_index: previousNewOrder
          }),
        })
      ]);
      
      // Check if both requests were successful
      const allSuccessful = responses.every(response => response.ok);
      
      if (allSuccessful) {
        toast({
          title: 'Topic Moved',
          description: 'Topic moved up successfully.',
        });
      } else {
        throw new Error('One or more API calls failed');
      }
    } catch (error) {
      console.error('Error reordering topic:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder topic',
        variant: 'destructive',
      });
      // Revert local state on error
      fetchTopics();
    }
  };

  const handleMoveTopicDown = async (topicId: string, unit: string) => {
    const unitTopics = topics.filter(t => t.unit === unit).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    const currentIndex = unitTopics.findIndex(t => t.id === topicId);
    if (currentIndex >= unitTopics.length - 1) return;

    const currentItem = unitTopics[currentIndex];
    const nextItem = unitTopics[currentIndex + 1];
    
    // Swap order indices
    const currentNewOrder = nextItem.order_index || 0;
    const nextNewOrder = currentItem.order_index || 0;
    
    // Update local state immediately for instant UI feedback
    const updatedTopics = topics.map(item => {
      if (item.id === currentItem.id) {
        return { ...item, order_index: currentNewOrder };
      }
      if (item.id === nextItem.id) {
        return { ...item, order_index: nextNewOrder };
      }
      return item;
    });
    setTopics(updatedTopics);
    
    try {
      const responses = await Promise.all([
        fetch(`/api/admin/topics/${currentItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            topic: currentItem.topic,
            short_summary: currentItem.short_summary,
            unit: currentItem.unit,
            image: currentItem.image,
            showstudent: currentItem.showstudent,
            visible: currentItem.visible,
            order_index: currentNewOrder
          }),
        }),
        fetch(`/api/admin/topics/${nextItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            topic: nextItem.topic,
            short_summary: nextItem.short_summary,
            unit: nextItem.unit,
            image: nextItem.image,
            showstudent: nextItem.showstudent,
            visible: nextItem.visible,
            order_index: nextNewOrder
          }),
        })
      ]);
      
      // Check if both requests were successful
      const allSuccessful = responses.every(response => response.ok);
      
      if (allSuccessful) {
        toast({
          title: 'Topic Moved',
          description: 'Topic moved down successfully.',
        });
      } else {
        throw new Error('One or more API calls failed');
      }
    } catch (error) {
      console.error('Error reordering topic:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder topic',
        variant: 'destructive',
      });
      // Revert local state on error
      fetchTopics();
    }
  };

  // Get display number for topic item
  const getTopicDisplayNumber = (topicItem: Topic, unit: string) => {
    return getDisplayNumber(topicItem, topics, unit);
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
                        {Array.from({ length: CONSTANTS.GRAPESEED_UNITS_COUNT }, (_, i) => (
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

            {/* Media Gallery Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Media Gallery</h3>
              
              {/* Images Section */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Images</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Image 1 */}
                  <div className="space-y-2">
                    <Label htmlFor="content-image1" className="text-sm">Image 1</Label>
                    <div className="flex gap-2">
                      <Input
                        id="content-image1"
                        value={contentFormData.image1}
                        onChange={(e) => setContentFormData(prev => ({ ...prev, image1: e.target.value }))}
                        placeholder="Enter image URL or search..."
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setCurrentImageField('image1');
                          setIsImageSearchOpen(true);
                        }}
                      >
                        <Search className="h-4 w-4 mr-1" />
                        Search
                      </Button>
                    </div>
                    {/* Image 1 Preview */}
                    {contentFormData.image1 && (
                      <div className="mt-2">
                        <img
                          src={contentFormData.image1}
                          alt="Image 1 Preview"
                          className="w-full max-h-32 object-contain border rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Image 2 */}
                  <div className="space-y-2">
                    <Label htmlFor="content-image2" className="text-sm">Image 2</Label>
                    <div className="flex gap-2">
                      <Input
                        id="content-image2"
                        value={contentFormData.image2}
                        onChange={(e) => setContentFormData(prev => ({ ...prev, image2: e.target.value }))}
                        placeholder="Enter image URL or search..."
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setCurrentImageField('image2');
                          setIsImageSearchOpen(true);
                        }}
                      >
                        <Search className="h-4 w-4 mr-1" />
                        Search
                      </Button>
                    </div>
                    {/* Image 2 Preview */}
                    {contentFormData.image2 && (
                      <div className="mt-2">
                        <img
                          src={contentFormData.image2}
                          alt="Image 2 Preview"
                          className="w-full max-h-32 object-contain border rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Videos Section */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Videos</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Video 1 */}
                  <div className="space-y-2">
                    <Label htmlFor="content-video1" className="text-sm">Video 1</Label>
                    <div className="flex gap-2">
                      <Input
                        id="content-video1"
                        value={contentFormData.video1}
                        onChange={(e) => setContentFormData(prev => ({ ...prev, video1: e.target.value }))}
                        placeholder="Enter YouTube URL or search..."
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setCurrentVideoField('video1');
                          setIsYouTubeSearchOpen(true);
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Search
                      </Button>
                    </div>
                    {/* Video 1 Preview */}
                    {contentFormData.video1 && contentFormData.video1.includes('youtube.com') && (
                      <div className="mt-2">
                        <div className="w-full">
                          <div className="aspect-video bg-gray-100 rounded border flex items-center justify-center">
                            <Play className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-600 mt-1 truncate">{contentFormData.video1}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video 2 */}
                  <div className="space-y-2">
                    <Label htmlFor="content-video2" className="text-sm">Video 2</Label>
                    <div className="flex gap-2">
                      <Input
                        id="content-video2"
                        value={contentFormData.video2}
                        onChange={(e) => setContentFormData(prev => ({ ...prev, video2: e.target.value }))}
                        placeholder="Enter YouTube URL or search..."
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setCurrentVideoField('video2');
                          setIsYouTubeSearchOpen(true);
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Search
                      </Button>
                    </div>
                    {/* Video 2 Preview */}
                    {contentFormData.video2 && contentFormData.video2.includes('youtube.com') && (
                      <div className="mt-2">
                        <div className="w-full">
                          <div className="aspect-video bg-gray-100 rounded border flex items-center justify-center">
                            <Play className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-600 mt-1 truncate">{contentFormData.video2}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
              {/* Check if any topic is expanded */}
              {expandedTopics.size > 0 ? (
                // Show only expanded topics in full width
                <div className="space-y-3">
                  {unitTopics
                    .filter(topic => expandedTopics.has(topic.id))
                    .map((topic) => {
                      const topicContent = getContentForTopic(topic.id);
                      const isExpanded = true; // Always true in this context
                      
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
                                    <div 
                                      className="flex items-center justify-center w-5 h-5 text-xs font-medium border border-gray-300 rounded bg-white text-gray-700"
                                      title={`Topic order: ${topic.visible === false ? 'Hidden' : getTopicDisplayNumber(topic, unit)}`}
                                    >
                                      {getTopicDisplayNumber(topic, unit)}
                                    </div>
                                    <GripVertical className="h-4 w-4 text-gray-400" />
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-gray-600" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-600" />
                                    )}
                                  </div>
                                  <div>
                                        <div className="flex items-center gap-2">
                                          <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-base">{topic.topic}</h3>
                                            <Badge variant="outline" className="text-xs">
                                              {topicContent.length} items
                                            </Badge>
                                          </div>
                                         
                                        </div>
                                    {topic.short_summary && (
                                      <p className="text-sm text-gray-600 mt-1 truncate">{topic.short_summary}...</p>
                                      )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="grid grid-cols-4 gap-0.5">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveTopicUp(topic.id, unit);
                                      }}
                                      className="h-4 w-4 p-0"
                                      title="Move Topic Up"
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveTopicDown(topic.id, unit);
                                      }}
                                      className="h-8 w-8 p-0"
                                      title="Move Topic Down"
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleTopicVisibility(topic.id);
                                      }}
                                      className="h-8 w-8 p-0"
                                      title={(topic.visible !== false) ? "Hide Topic" : "Show Topic"}
                                    >
                                      {(topic.visible !== false) ? (
                                        <Eye className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                      )}
                                    </Button>
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
                                        handleAIGenerateContent(topic.id, topic.topic, topic.short_summary);
                                      }}
                                      className="h-8 w-8 p-0 text-purple-600"
                                      title="AI Generate Content"
                                    >
                                      <Sparkles className="h-4 w-4" />
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
                          <CardContent className="pt-0 pl-8">
                            {topicContent.length === 0 ? (
                              <div className="text-center py-6 text-gray-500">
                                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No content items yet</p>
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
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {getContentDisplayOrder(topic.id).map((contentItem) => {
                                  const contentQuestions = questions[contentItem.id] || [];
                                  const isContentExpanded = expandedContent.has(contentItem.id);
                                  
                                  return (
                                    <Card key={contentItem.id} className="border border-gray-100 bg-gray-50">
                                      <Collapsible 
                                        open={isContentExpanded}
                                      >
                                        <CollapsibleTrigger className="w-full">
                                          <CardHeader 
                                            className="py-1.5 px-2 cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => toggleContentExpansion(contentItem.id)}
                                          >
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                  <div 
                                                    className="flex items-center justify-center w-5 h-5 text-xs font-medium border border-gray-300 rounded bg-white text-gray-700"
                                                    title={`Content order: ${contentItem.visible === false ? 'Hidden' : getContentDisplayNumber(contentItem, topic.id)}`}
                                                  >
                                                    {getContentDisplayNumber(contentItem, topic.id)}
                                                  </div>
                                                  {isContentExpanded ? (
                                                    <ChevronDown className="h-3 w-3 text-gray-600" />
                                                  ) : (
                                                    <ChevronRight className="h-3 w-3 text-gray-600" />
                                                  )}
                                                  <FileText className="h-3 w-3 text-blue-600" />
                                                </div>
                                                <div>
                                                <h4 className="font-medium text-sm truncate">{contentItem.title}...</h4>
                                                <p className="text-xs text-gray-500 truncate">{contentItem.infor1}...</p>                                                </div>
                                              </div>
                                                <div className="grid grid-cols-4 gap-0.5">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMoveContentUp(contentItem.id, topic.id);
                                                  }}
                                                  className="h-4 w-4 p-0"
                                                  title="Move Up"
                                                >
                                                  <ArrowUp className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMoveContentDown(contentItem.id, topic.id);
                                                  }}
                                                  className="h-4 w-4 p-0"
                                                  title="Move Down"
                                                >
                                                  <ArrowDown className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Toggle visibility
                                                    handleToggleContentVisibility(contentItem.id);
                                                  }}
                                                  className="h-4 w-4 p-0"
                                                  title={(contentItem.visible !== false) ? "Hide Content" : "Show Content"}
                                                >
                                                  {(contentItem.visible !== false) ? (
                                                    <Eye className="h-3 w-3 text-green-600" />
                                                  ) : (
                                                    <EyeOff className="h-3 w-3 text-gray-400" />
                                                  )}
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedContentForView(contentItem);
                                                  }}
                                                  className="h-4 w-4 p-0"
                                                  title="View Content"
                                                >
                                                  <FileText className="h-3 w-3 text-blue-600" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddQuestion(contentItem.id);
                                                  }}
                                                  className="h-4 w-4 p-0"
                                                  title="Add Question"
                                                >
                                                  <Plus className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAIGenerate(contentItem.id, contentItem.title);
                                                  }}
                                                  className="h-4 w-4 p-0 text-purple-600"
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
                                                  className="h-4 w-4 p-0 text-red-600 hover:text-red-700"
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
                                          <CardContent className="pt-0 pl-6">
                                            {contentQuestions.length === 0 ? (
                                              <div className="text-center py-4 text-gray-500">
                                                <HelpCircle className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                                                <p className="text-xs">No questions yet</p>
                                                <div className="flex gap-2 justify-center mt-2">
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAddQuestion(contentItem.id)}
                                                    className="text-xs h-7"
                                                  >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Add Question
                                                  </Button>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAIGenerate(contentItem.id, contentItem.title)}
                                                    className="text-xs h-7 text-purple-600 border-purple-200"
                                                  >
                                                    <Sparkles className="h-3 w-3 mr-1" />
                                                    AI Generate
                                                  </Button>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="space-y-1">
                                                {contentQuestions.map((question, index) => (
                                                  <div 
                                                  key={question.id} 
                                                  className="flex items-center justify-between p-2 bg-white rounded border border-gray-100 cursor-pointer hover:bg-gray-50"
                                                  onClick={() => setSelectedQuestion(question)}
                                                >
                                                    <div className="flex items-center gap-2 flex-1">
                                                      <div className="flex items-center gap-1">
                                                        <GripVertical className="h-3 w-3 text-gray-400" />
                                                        <HelpCircle className="h-3 w-3 text-green-600" />
                                                      </div>
                                                      <div className="flex-1">
                                                      <p className="text-xs font-medium line-clamp-2">
                                                          {(() => {
                                                            try {
                                                              const parsed = parseContentData(question.noi_dung);
                                                              return parsed.text || question.noi_dung;
                                                            } catch {
                                                              return question.noi_dung;
                                                            }
                                                          })()}
                                                        </p>
                                                                  <p className="text-xs text-gray-500 mt-1">
                                                                    {question.cau_tra_loi_1 ? CONSTANTS.DISPLAY_LABELS.MULTIPLE_CHOICE : CONSTANTS.DISPLAY_LABELS.TEXT} • Answer: {question.correct_choice || CONSTANTS.DISPLAY_LABELS.NOT_AVAILABLE}
                                                                  </p>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setEditingQuestion(question);
                                                          setSelectedContentForQuestion(question.contentid);
                                                          setQuestionFormData({
                                                            chuong_trinh: question.chuong_trinh || '',
                                                            questionlevel: question.questionlevel || '',
                                                            contentid: question.contentid,
                                                            question_type: question.cau_tra_loi_1 ? 'multiple_choice' : 'text',
                                                            questionContent: parseContentData(question.noi_dung),
                                                            choice1Content: parseContentData(question.cau_tra_loi_1 || ''),
                                                            choice2Content: parseContentData(question.cau_tra_loi_2 || ''),
                                                            choice3Content: parseContentData(question.cau_tra_loi_3 || ''),
                                                            choice4Content: parseContentData(question.cau_tra_loi_4 || ''),
                                                            correct_choice: question.correct_choice || '',
                                                            time: question.time || '',
                                                            explanation: question.explanation || '',
                                                            answer: question.answer || '',
                                                            video: question.video || '',
                                                            picture: question.picture || ''
                                                          });
                                                          
                                                          // Ensure content section stays expanded
                                                          setExpandedContent(prev => {
                                                            const newExpanded = new Set(prev);
                                                            newExpanded.add(question.contentid);
                                                            return newExpanded;
                                                          });
                                                          
                                                          setIsQuestionDialogOpen(true);
                                                        }}
                                                                                                                className="h-5 w-5 p-0"
                                                        title="Edit Question"
                                                      >
                                                        <Pencil className="h-3 w-3" />
                                                      </Button>
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={async () => {
                                                          if (!confirm('Are you sure you want to delete this question?')) return;
                                                          
                                                          try {
                                                            const response = await fetch(`/api/admin/questions/${question.id}`, {
                                                              method: 'DELETE',
                                                            });
                                                        
                                                            if (!response.ok) throw new Error('Failed to delete question');
                                                        
                                                            toast({
                                                              title: 'Question Deleted',
                                                              description: 'Successfully deleted the question.',
                                                            });
                                                        
                                                            // Refresh questions for this content
                                                            await fetchQuestionsForContent(contentItem.id);
                                                          } catch (error) {
                                                            toast({
                                                              title: 'Error',
                                                              description: 'Failed to delete question',
                                                              variant: 'destructive',
                                                            });
                                                          }
                                                        }}                                                        className="h-5 w-5 p-0 text-red-600 hover:text-red-700"
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
                  
                  {/* Collapsed topics - 2 column grid */}
                  <div className="topic-grid">
                    {unitTopics
                      .filter(topic => !expandedTopics.has(topic.id))
                      .map((topic) => {
                        const topicContent = getContentForTopic(topic.id);
                        const isExpanded = false;
                        
                        return (
                          <Card key={topic.id} className="border border-gray-200 topic-card">
                            <Collapsible open={isExpanded}>
                              <CollapsibleTrigger>
                                <CardHeader 
                                  className="pb-2 cursor-pointer hover:bg-gray-50 transition-colors"
                                  onClick={() => toggleTopicExpansion(topic.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1">
                                        <div 
                                          className="flex items-center justify-center w-5 h-5 text-xs font-medium border border-gray-300 rounded bg-white text-gray-700"
                                          title={`Topic order: ${topic.visible === false ? 'Hidden' : getTopicDisplayNumber(topic, unit)}`}
                                        >
                                          {getTopicDisplayNumber(topic, unit)}
                                        </div>
                                        <GripVertical className="h-4 w-4 text-gray-400" />
                                        <ChevronRight className="h-4 w-4 text-gray-600" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-base">{topic.topic}</h3>
                                            <Badge variant="outline" className="text-xs">
                                              {topicContent.length} items
                                            </Badge>
                                          </div>
                                        </div>
                                        {topic.short_summary && (
                                          <p className="text-sm text-gray-600 mt-1">{topic.short_summary}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                  <div className="grid grid-cols-4 gap-0.5">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveTopicUp(topic.id, unit);
                                      }}
                                      className="h-4 w-4 p-0"
                                      title="Move Topic Up"
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleMoveTopicDown(topic.id, unit);
                                          }}
                                          className="h-4 w-4 p-0"
                                          title="Move Topic Down"
                                        >
                                          <ArrowDown className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleTopicVisibility(topic.id);
                                          }}
                                          className="h-4 w-4 p-0"
                                          title={(topic.visible !== false) ? "Hide Topic" : "Show Topic"}
                                        >
                                          {(topic.visible !== false) ? (
                                            <Eye className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <EyeOff className="h-3 w-3 text-gray-400" />
                                          )}
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddContentToTopic(topic.id);
                                          }}
                                          className="h-4 w-4 p-0"
                                          title="Add Content"
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAIGenerateContent(topic.id, topic.topic, topic.short_summary);
                                          }}
                                          className="h-4 w-4 p-0 text-purple-600"
                                          title="AI Generate Content"
                                        >
                                          <Sparkles className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditTopic(topic);
                                          }}
                                          className="h-4 w-4 p-0"
                                          title="Edit Topic"
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTopic(topic.id);
                                          }}
                                          className="h-4 w-4 p-0 text-red-600 hover:text-red-700"
                                          title="Delete Topic"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </CardHeader>
                              </CollapsibleTrigger>
                            </Collapsible>
                          </Card>
                        );
                      })}
                  </div>
                </div>
              ) : (
                // No topics expanded - show normal 2-column grid
                <div className="topic-grid">
                  {unitTopics.map((topic) => {
                    const topicContent = getContentForTopic(topic.id);
                    const isExpanded = false;
                    
                    return (
                      <Card key={topic.id} className="border border-gray-200 topic-card">
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
                                    <ChevronRight className="h-4 w-4 text-gray-600" />
                                  </div>
                                  <div>
                                        <div className="flex items-center gap-2">
                                          <h3 className="font-semibold text-base">{topic.topic}</h3>
                                        </div>
                                    {topic.short_summary && (
                                      <p className="text-sm text-gray-600 mt-1">{topic.short_summary}</p>
                                    )}
                                  </div>
                                </div>
                                    <div className="flex items-center gap-1">
                                    <div className="grid grid-rows-2 grid-cols-4 gap-1">
                                      {/* Row 1 */}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMoveTopicUp(topic.id, unit);
                                        }}
                                        className="h-8 w-8 p-0"
                                        title="Move Topic Up"
                                      >
                                        <ArrowUp className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMoveTopicDown(topic.id, unit);
                                        }}
                                        className="h-8 w-8 p-0"
                                        title="Move Topic Down"
                                      >
                                        <ArrowDown className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleTopicVisibility(topic.id);
                                        }}
                                        className="h-8 w-8 p-0"
                                        title={(topic.visible !== false) ? "Hide Topic" : "Show Topic"}
                                      >
                                        {(topic.visible !== false) ? (
                                          <Eye className="h-4 w-4 text-green-600" />
                                        ) : (
                                          <EyeOff className="h-4 w-4 text-gray-400" />
                                        )}
                                      </Button>
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

                                      {/* Row 2 */}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAIGenerateContent(topic.id, topic.topic, topic.short_summary);
                                        }}
                                        className="h-8 w-8 p-0 text-purple-600"
                                        title="AI Generate Content"
                                      >
                                        <Sparkles className="h-4 w-4" />
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
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Don't try to view topic as content
                                        return;
                                      }}
                                        className="h-8 w-8 p-0"
                                        title="View Topic"
                                      >
                                        <FileText className="h-4 w-4 text-blue-600" />
                                      </Button>
                                    </div>
                                </div>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                        </Collapsible>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Quiz Generator Modal */}
      {selectedContentForAI && (
        <QuizGeneratorModal
          isOpen={isQuizGeneratorOpen}
          onClose={() => {
            setIsQuizGeneratorOpen(false);
            setSelectedContentForAI(null);
          }}
          contentId={selectedContentForAI.id}
          contentTitle={selectedContentForAI.title}
        />
      )}

      {/* AI Content Generator Modal */}
      {selectedTopicForAI && (
        <ContentGeneratorModal
          isOpen={isContentGeneratorOpen}
          onClose={() => {
            setIsContentGeneratorOpen(false);
            setSelectedTopicForAI(null);
          }}
          topicId={selectedTopicForAI.id}
          topicName={selectedTopicForAI.name}
          topicSummary={selectedTopicForAI.summary}
          onContentGenerated={handleContentGenerated}
        />
      )}

      {/* Image Search Modal */}
      <ImageSearchModal
        isOpen={isImageSearchOpen}
        onClose={() => setIsImageSearchOpen(false)}
        onSelect={(url) => {
          setContentFormData(prev => ({ ...prev, [currentImageField]: url }));
          setIsImageSearchOpen(false);
        }}
      />

      {/* YouTube Search Modal */}
      <YouTubeSearchModal
        isOpen={isYouTubeSearchOpen}
        onClose={() => setIsYouTubeSearchOpen(false)}
        onSelect={(url) => {
          setContentFormData(prev => ({ ...prev, [currentVideoField]: url }));
          setIsYouTubeSearchOpen(false);
        }}
      />

      {/* Question Dialog */}
      {selectedQuestion && (
        <AdminQuestionDialog
          isOpen={!!selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
          question={selectedQuestion}
        />
      )}

      {/* Content View Modal */}
      {selectedContentForView && (
        <ContentViewModal
          isOpen={!!selectedContentForView}
          onClose={() => setSelectedContentForView(null)}
          contentId={selectedContentForView.id}
          showNavigation={false}
        />
      )}
    </div>
  );
}
