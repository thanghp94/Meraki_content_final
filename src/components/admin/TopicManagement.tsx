'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Search } from 'lucide-react';
import { 
  TopicCard, 
  UnitSelector, 
  useTopicManagement,
  Topic,
  Content
} from './topic-management';

// Import existing modals (these would need to be extracted too, but keeping them for now)
import { QuizGeneratorModal } from './QuizGeneratorModal';
import { ContentGeneratorModal } from './ContentGeneratorModal';
import { ImageSearchModal } from './ImageSearchModal';
import { YouTubeSearchModal } from './YouTubeSearchModal';
import AdminQuestionDialog from './AdminQuestionDialog';
import ContentViewModal from '@/components/ui/content-view-modal-fixed';

export default function TopicManagement() {
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

  // Modal states (these could also be extracted to a separate hook)
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [showContentGenerator, setShowContentGenerator] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [showYouTubeSearch, setShowYouTubeSearch] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [selectedContentForView, setSelectedContentForView] = useState<Content | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  
  // Additional state for modal interactions
  const [selectedTopicForContent, setSelectedTopicForContent] = useState<string>('');
  const [selectedContentForQuestion, setSelectedContentForQuestion] = useState<string>('');
  const [selectedContentForAI, setSelectedContentForAI] = useState<{ id: string; title: string } | null>(null);
  const [selectedTopicForAI, setSelectedTopicForAI] = useState<{ id: string; name: string; summary: string } | null>(null);
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isQuizGeneratorOpen, setIsQuizGeneratorOpen] = useState(false);
  const [isContentGeneratorOpen, setIsContentGeneratorOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

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

  const [questionFormData, setQuestionFormData] = useState({
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

  // Handler functions for actions that need modal interactions
  const handleAddContentToTopic = (topicId: string) => {
    setSelectedTopicForContent(topicId);
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

  const handleAddQuestion = (contentId: string) => {
    setSelectedContentForQuestion(contentId);
    setQuestionFormData(prev => ({ ...prev, contentid: contentId }));
    setIsQuestionDialogOpen(true);
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
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Topic Management</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="program-select">Filter by Program:</Label>
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
          <Button onClick={() => setShowQuizGenerator(true)}>
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

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Topics Display */}
      <div className="space-y-6">
        {Object.entries(topicsByUnit).map(([unit, unitTopics]) => (
          <div key={unit}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              📚 {unit}
              <span className="text-sm text-gray-500">({unitTopics.length} topics)</span>
            </h2>
            <div className="space-y-4">
              {unitTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  unit={unit}
                  content={content}
                  expandedTopics={expandedTopics}
                  onToggleExpanded={toggleTopicExpansion}
                  onMoveTopicUp={handleMoveTopicUp}
                  onMoveTopicDown={handleMoveTopicDown}
                  onToggleTopicVisibility={handleToggleTopicVisibility}
                  onAddContentToTopic={handleAddContentToTopic}
                  onAIGenerateContent={handleAIGenerateContent}
                  onEditTopic={handleEditTopic}
                  onDeleteTopic={handleDeleteTopic}
                  onMoveContentUp={handleMoveContentUp}
                  onMoveContentDown={handleMoveContentDown}
                  onToggleContentVisibility={handleToggleContentVisibility}
                  onViewContent={handleViewContent}
                  onAddQuestion={handleAddQuestion}
                  onAIGenerate={handleAIGenerate}
                  onEditContent={handleEditContent}
                  onDeleteContent={handleDeleteContent}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
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

      {showImageSearch && (
        <ImageSearchModal
          isOpen={showImageSearch}
          onClose={() => setShowImageSearch(false)}
          onSelect={(url) => {
            // Handle image selection - this would need proper implementation
            setShowImageSearch(false);
          }}
        />
      )}

      {showYouTubeSearch && (
        <YouTubeSearchModal
          isOpen={showYouTubeSearch}
          onClose={() => setShowYouTubeSearch(false)}
          onSelect={(url) => {
            // Handle video selection - this would need proper implementation
            setShowYouTubeSearch(false);
          }}
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
    </div>
  );
}
