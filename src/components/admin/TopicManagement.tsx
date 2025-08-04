'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  UnitSelector, 
  useTopicManagement,
  Topic,
  Content
} from './topic-management';

// Import the new refactored components
import TopicList from './topic-management/components/TopicList';
import ContentList from './topic-management/components/ContentList';
import TopicFormModal from './topic-management/components/TopicFormModal';
import ContentFormModal from './topic-management/components/ContentFormModal';

// Import existing modals
import { QuizGeneratorModal } from './QuizGeneratorModal';
import { ContentGeneratorModal } from './ContentGeneratorModal';
import { ImageSearchModal } from './ImageSearchModal';
import { YouTubeSearchModal } from './YouTubeSearchModal';
import AdminQuestionDialog from './AdminQuestionDialog';
import ContentViewModal from '@/components/ui/content-view-modal-fixed';
import { ContentQuestionsModal } from './topic-management/components/questions/ContentQuestionsModal';
import { ManualQuestionModal } from './ManualQuestionModal';

export default function TopicManagement() {
  const { toast } = useToast();
  
  // Use the extracted hook for all state and operations
  const {
    topics,
    content,
    questions,
    selectedProgram,
    selectedUnit,
    searchTerm,
    isLoading,
    expandedTopics,
    setSelectedProgram,
    setSelectedUnit,
    setSearchTerm,
    handleMoveTopicUp,
    handleMoveTopicDown,
    handleToggleTopicVisibility,
    handleDeleteTopic,
    handleMoveContentUp,
    handleMoveContentDown,
    handleToggleContentVisibility,
    handleDeleteContent,
    toggleTopicExpansion,
    getFilteredTopics,
    fetchTopics,
    fetchContent,
  } = useTopicManagement();

  // Modal states
  const [selectedContentForView, setSelectedContentForView] = useState<Content | null>(null);
  const [selectedContentForQuestions, setSelectedContentForQuestions] = useState<Content | null>(null);
  const [selectedContentForManualQuestion, setSelectedContentForManualQuestion] = useState<Content | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  
  // Additional state for modal interactions
  const [selectedContentForAI, setSelectedContentForAI] = useState<{ id: string; title: string } | null>(null);
  const [selectedTopicForAI, setSelectedTopicForAI] = useState<{ id: string; name: string; summary: string } | null>(null);
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [isQuizGeneratorOpen, setIsQuizGeneratorOpen] = useState(false);
  const [isContentGeneratorOpen, setIsContentGeneratorOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [selectedTopicForView, setSelectedTopicForView] = useState<string>('');

  // Form data states
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

  // Form submission handlers
  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  // Form reset functions
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

  // Handler functions for actions that need modal interactions
  const handleAddContentToTopic = (topicId: string) => {
    setContentFormData(prev => ({ ...prev, topicid: topicId }));
    setIsContentDialogOpen(true);
  };

  const handleAIGenerateContent = (topicId: string, topicName: string, summary?: string) => {
    setSelectedTopicForAI({ id: topicId, name: topicName, summary: summary || '' });
    setIsContentGeneratorOpen(true);
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setTopicFormData({
      topic: topic.topic,
      short_summary: topic.short_summary || '',
      unit: topic.unit || '',
      image: topic.image || '',
      showstudent: topic.showstudent || true,
      program: topic.program || ''
    });
    setIsTopicDialogOpen(true);
  };

  const handleViewContent = (content: Content) => {
    setSelectedContentForView(content);
  };

  const handleViewQuestions = (content: Content) => {
    setSelectedContentForQuestions(content);
  };

  const handleAddQuestion = (contentId: string) => {
    // Find the content to get its title
    const contentItem = content.find(c => c.id === contentId);
    if (contentItem) {
      setSelectedContentForManualQuestion(contentItem);
    }
  };

  const handleAIGenerate = (contentId: string, contentTitle: string) => {
    setSelectedContentForAI({ id: contentId, title: contentTitle });
    setIsQuizGeneratorOpen(true);
  };

  const handleEditContent = (content: Content) => {
    setEditingContent(content);
    setContentFormData({
      title: content.title,
      infor1: content.infor1 || '',
      infor2: content.infor2 || '',
      image1: content.image1 || '',
      image2: content.image2 || '',
      video1: content.video1 || '',
      video2: content.video2 || '',
      topicid: content.topicid || content.topic_id || ''
    });
    setIsContentDialogOpen(true);
  };

  // Get filtered topics using the hook
  const filteredTopics = getFilteredTopics();

  // Group topics by unit for display
  const getTopicsByUnit = () => {
    const grouped: { [key: string]: Topic[] } = {};
    
    filteredTopics.forEach(topic => {
      const unit = topic.unit || 'No Unit';
      if (!grouped[unit]) {
        grouped[unit] = [];
      }
      grouped[unit].push(topic);
    });

    // Sort topics within each unit by order_index
    Object.keys(grouped).forEach(unit => {
      grouped[unit].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    });

    return grouped;
  };

  const topicsByUnit = getTopicsByUnit();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-3xl font-bold">Topic Management</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="program-select">Program:</Label>
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Grapeseed">Grapeseed</SelectItem>
                <SelectItem value="TATH">TATH</SelectItem>
                <SelectItem value="WSC">WSC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={() => setIsTopicDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
          </Button>
        </div>
      </div>

      {/* Unit Selector */}
      <UnitSelector
        topics={topics}
        selectedProgram={selectedProgram}
        selectedUnit={selectedUnit}
        setSelectedUnit={setSelectedUnit}
      />

      {/* Topics Display */}
      {selectedUnit ? (
        <div className="space-y-6">
          <TopicList
            topicsByUnit={topicsByUnit}
            content={content}
            selectedTopicForView={selectedTopicForView}
            setSelectedTopicForView={setSelectedTopicForView}
            handleMoveTopicUp={handleMoveTopicUp}
            handleMoveTopicDown={handleMoveTopicDown}
            handleToggleTopicVisibility={handleToggleTopicVisibility}
            handleDeleteTopic={handleDeleteTopic}
            handleAddContentToTopic={handleAddContentToTopic}
            handleAIGenerateContent={handleAIGenerateContent}
            handleEditTopic={handleEditTopic}
          />

          {/* Content Display Area - Shows when topic is selected */}
          {selectedTopicForView && (
            <ContentList
              content={content}
              questions={questions}
              selectedTopicForView={selectedTopicForView}
              handleMoveContentUp={handleMoveContentUp}
              handleMoveContentDown={handleMoveContentDown}
              handleToggleContentVisibility={handleToggleContentVisibility}
              handleViewContent={handleViewContent}
              handleViewQuestions={handleViewQuestions}
              handleAddQuestion={handleAddQuestion}
              handleAIGenerate={handleAIGenerate}
              handleEditContent={handleEditContent}
              handleDeleteContent={handleDeleteContent}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Unit to View Topics</h3>
          <p className="text-gray-500">Choose a unit from the selector above to see all topics and content for that unit.</p>
        </div>
      )}

      {/* Topic Form Modal */}
      <TopicFormModal
        isOpen={isTopicDialogOpen}
        onOpenChange={(open) => {
          setIsTopicDialogOpen(open);
          if (!open) resetTopicForm();
        }}
        editingTopic={editingTopic}
        topicFormData={topicFormData}
        setTopicFormData={setTopicFormData}
        handleTopicSubmit={handleTopicSubmit}
        resetTopicForm={resetTopicForm}
      />

      {/* Content Form Modal */}
      <ContentFormModal
        isOpen={isContentDialogOpen}
        onOpenChange={(open) => {
          setIsContentDialogOpen(open);
          if (!open) resetContentForm();
        }}
        editingContent={editingContent}
        contentFormData={contentFormData}
        setContentFormData={setContentFormData}
        handleContentSubmit={handleContentSubmit}
        resetContentForm={resetContentForm}
      />

      {/* Other Modals */}
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
          onContentGenerated={fetchContent}
        />
      )}

      {selectedQuestion && (
        <AdminQuestionDialog
          isOpen={!!selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
          question={selectedQuestion}
        />
      )}

      {selectedContentForView && (
        <ContentViewModal
          isOpen={!!selectedContentForView}
          onClose={() => setSelectedContentForView(null)}
          contentId={selectedContentForView.id}
          showNavigation={false}
        />
      )}

      {selectedContentForQuestions && (
        <ContentQuestionsModal
          isOpen={!!selectedContentForQuestions}
          onClose={() => setSelectedContentForQuestions(null)}
          content={selectedContentForQuestions}
          onAddQuestion={() => {
            handleAddQuestion(selectedContentForQuestions.id);
            setSelectedContentForQuestions(null);
          }}
          onEditQuestion={(question) => {
            setEditingQuestion(question);
            setSelectedContentForQuestions(null);
          }}
        />
      )}

      {(selectedContentForManualQuestion || editingQuestion) && (
        <ManualQuestionModal
          isOpen={!!(selectedContentForManualQuestion || editingQuestion)}
          onClose={() => {
            setSelectedContentForManualQuestion(null);
            setEditingQuestion(null);
          }}
          contentId={selectedContentForManualQuestion?.id || editingQuestion?.contentid}
          contentTitle={selectedContentForManualQuestion?.title || 'Edit Question'}
          editingQuestion={editingQuestion}
          onQuestionCreated={() => {
            setSelectedContentForManualQuestion(null);
            setEditingQuestion(null);
            // Optionally refresh questions or show success message
            toast({
              title: 'Success',
              description: editingQuestion ? 'Question updated successfully!' : 'Question created successfully!',
            });
          }}
        />
      )}
    </div>
  );
}
