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
// import { QuizGeneratorModal } from './QuizGeneratorModal';
// import { ContentGeneratorModal } from './ContentGeneratorModal';
// import { ImageSearchModal } from './ImageSearchModal';
// import { YouTubeSearchModal } from './YouTubeSearchModal';
// import AdminQuestionDialog from './AdminQuestionDialog';

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

  // Handler functions for actions that need modal interactions
  const handleAddContentToTopic = (topicId: string) => {
    // Implementation for adding content
    console.log('Add content to topic:', topicId);
  };

  const handleAIGenerateContent = (topicId: string, topicName: string, summary?: string) => {
    // Implementation for AI content generation
    console.log('AI generate content for topic:', topicId, topicName, summary);
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
  };

  const handleViewContent = (content: Content) => {
    setSelectedContentForView(content);
  };

  const handleAddQuestion = (contentId: string) => {
    // Implementation for adding questions
    console.log('Add question to content:', contentId);
  };

  const handleAIGenerate = (contentId: string, contentTitle: string) => {
    // Implementation for AI question generation
    console.log('AI generate questions for content:', contentId, contentTitle);
  };

  const handleEditContent = (content: Content) => {
    setEditingContent(content);
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

      {/* Modals - TODO: Extract these to separate modal components */}
      {/* 
      {showQuizGenerator && (
        <QuizGeneratorModal
          isOpen={showQuizGenerator}
          onClose={() => setShowQuizGenerator(false)}
          onGenerated={fetchTopics}
        />
      )}

      {showContentGenerator && (
        <ContentGeneratorModal
          isOpen={showContentGenerator}
          onClose={() => setShowContentGenerator(false)}
          onGenerated={fetchContent}
        />
      )}

      {showImageSearch && (
        <ImageSearchModal
          isOpen={showImageSearch}
          onClose={() => setShowImageSearch(false)}
        />
      )}

      {showYouTubeSearch && (
        <YouTubeSearchModal
          isOpen={showYouTubeSearch}
          onClose={() => setShowYouTubeSearch(false)}
        />
      )}

      {showQuestionDialog && (
        <AdminQuestionDialog
          isOpen={showQuestionDialog}
          onClose={() => setShowQuestionDialog(false)}
        />
      )}
      */}
    </div>
  );
}
