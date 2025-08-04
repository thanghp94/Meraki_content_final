'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Search, Settings, BookOpen, Users, Target } from 'lucide-react';
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

interface TopicFormData {
  topic: string;
  short_summary: string;
  unit: string;
  image: string;
  parentid: string | null;
  showstudent: boolean;
  program: string;
}

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
  const [topicFormData, setTopicFormData] = useState<TopicFormData>({
    topic: '',
    short_summary: '',
    unit: '',
    image: '',
    parentid: null,
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
      parentid: null,
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
      parentid: topic.parentid || null,
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
      <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-4 border-purple-200">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
        <p className="text-lg font-semibold text-purple-700">Loading amazing content...</p>
        <p className="text-sm text-purple-500">Please wait while we fetch your topics</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 mt-8">
      {/* Enhanced Header with Gradient Background - Reduced Padding */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl shadow-xl py-2 px-4 mb-6 border-4 border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">📚 Content</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2">
              <Label htmlFor="program-select" className="text-white font-medium">📚 Program:</Label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger className="w-48 bg-white/20 border-white/30 text-white backdrop-blur-sm">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grapeseed">🍇 Grapeseed</SelectItem>
                  <SelectItem value="TATH">🎯 TATH</SelectItem>
                  <SelectItem value="WSC">🌟 WSC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
              <Input
                placeholder="🔍 Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-white/20 border-white/30 text-white placeholder:text-white/70 backdrop-blur-sm"
              />
            </div>
            <Button 
              onClick={() => setIsTopicDialogOpen(true)}
              className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              ✨ Add Topic
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Unit Selector */}
      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl shadow-lg p-4 mb-6 border-4 border-yellow-300">
        <UnitSelector
          topics={topics}
          selectedProgram={selectedProgram}
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
        />
      </div>

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
        <div className="text-center py-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl border-4 border-dashed border-purple-300">
          <div className="text-8xl mb-4 animate-bounce">📚</div>
          <h3 className="text-2xl font-bold text-purple-700 mb-4">Select a Unit to View Topics</h3>
          <p className="text-lg text-purple-600 bg-white/70 px-6 py-2 rounded-full inline-block">
            🌟 Choose a unit from the selector above to see all topics and content! 🌟
          </p>
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
