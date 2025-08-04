'use client';

import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import ContentViewModal from '@/components/ui/content-view-modal-fixed';
import GameSetupModal from '@/components/library/GameSetupModal';
import UnifiedReviewModal from '@/components/quiz/UnifiedReviewModal';

// Import refactored components
import { TopicsByUnitLayout } from './components/layout/TopicsByUnitLayout';
import { LoadingState } from './components/layout/LoadingState';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';

// Import custom hook
import { useTopicsByUnit } from './hooks/useTopicsByUnit';

// Import types
import { TopicsByUnitProps, GameSetupData, Topic, Content } from './types';

export default function TopicsByUnit({ programFilter, onProgramChange }: TopicsByUnitProps) {
  // Core state and logic from custom hook
  const {
    unitGroups,
    content,
    expandedUnits,
    expandedTopics,
    isLoading,
    isMounted,
    loadingTopics,
    isLoadingUnitQuestions,
    toggleUnit,
    toggleTopic,
    handleUnitPlayClick,
    handleTopicPlayClick,
    getContentForTopic,
  } = useTopicsByUnit(programFilter);

  // Modal states
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isGameSetupModalOpen, setIsGameSetupModalOpen] = useState(false);
  const [gameSetupData, setGameSetupData] = useState<GameSetupData>({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewContent, setReviewContent] = useState<Content | null>(null);
  const [topicContentItems, setTopicContentItems] = useState<Content[]>([]);

  // Prevent hydration issues by not rendering until mounted
  if (!isMounted) {
    return <LoadingState message="Loading..." submessage="Initializing..." />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (unitGroups.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Topics Found</h3>
        <p className="text-muted-foreground">No topics are available to display by unit.</p>
      </div>
    );
  }

  // Event handlers
  const handleViewContent = (contentId: string) => {
    console.log('Attempting to view content with ID:', contentId);
    setSelectedContentId(contentId);
    setIsContentModalOpen(true);
  };

  const closeContentModal = () => {
    setIsContentModalOpen(false);
    setSelectedContentId(null);
  };

  const handleContentNavigation = (direction: 'prev' | 'next') => {
    const currentIndex = content.findIndex(item => item.id === selectedContentId);
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : content.length - 1;
    } else {
      newIndex = currentIndex < content.length - 1 ? currentIndex + 1 : 0;
    }

    setSelectedContentId(content[newIndex].id);
  };

  const handleUnitPlay = async (unitGroup: any) => {
    try {
      const setupData = await handleUnitPlayClick(unitGroup);
      setGameSetupData(setupData);
      setIsGameSetupModalOpen(true);
    } catch (error) {
      console.error('Error setting up unit game:', error);
    }
  };

  const handleTopicPlay = async (topic: Topic, topicContent: Content[]) => {
    try {
      const setupData = await handleTopicPlayClick(topic);
      setGameSetupData(setupData);
      setIsGameSetupModalOpen(true);
    } catch (error) {
      console.error('Error setting up topic game:', error);
    }
  };

  const handleContentPlay = (content: Content) => {
    setGameSetupData({
      contentIds: [content.id],
      topicName: content.title
    });
    setIsGameSetupModalOpen(true);
  };

  const handleContentReview = (content: Content) => {
    console.log('Opening review modal for content:', content.title);
    setReviewContent(content);
    setIsReviewModalOpen(true);
  };

  const handleTopicReview = (topic: Topic, topicContent: Content[]) => {
    console.log('Opening review modal for topic:', topic.topic, 'with', topicContent.length, 'content items');
    
    // Create a combined content object that represents the entire topic
    const combinedContent: Content = {
      id: `topic-${topic.id}`,
      title: topic.topic || 'Topic Review',
      infor1: '', // We'll pass individual content items instead
      infor2: '',
      image1: topicContent.find(c => c.image1)?.image1 || '',
      image2: topicContent.find(c => c.image2)?.image2 || '',
      video1: topicContent.find(c => c.video1)?.video1 || '',
      video2: topicContent.find(c => c.video2)?.video2 || '',
      topicid: topic.id,
      date_created: new Date().toISOString(),
      question_count: topicContent.reduce((sum, c) => sum + (c.question_count || 0), 0),
      visible: true,
      order_index: 0
    };

    setReviewContent(combinedContent);
    // Store the individual content items for the modal
    setTopicContentItems(topicContent);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewContent(null);
    setTopicContentItems([]);
  };

  // Render sidebar
  const sidebar = (
    <Sidebar
      programFilter={programFilter}
      onProgramChange={onProgramChange}
      unitGroups={unitGroups}
      expandedUnits={expandedUnits}
      isLoadingUnitQuestions={isLoadingUnitQuestions}
      onUnitClick={toggleUnit}
      onUnitPlayClick={handleUnitPlay}
    />
  );

  // Render main content
  const mainContent = (
    <MainContent
      unitGroups={unitGroups}
      expandedUnits={expandedUnits}
      expandedTopics={expandedTopics}
      loadingTopics={loadingTopics}
      getContentForTopic={getContentForTopic}
      onTopicClick={toggleTopic}
      onTopicPlayClick={handleTopicPlay}
      onTopicReviewClick={handleTopicReview}
      onContentClick={handleViewContent}
      onContentPlayClick={handleContentPlay}
      onContentReviewClick={handleContentReview}
    />
  );

  return (
    <>
      <TopicsByUnitLayout
        sidebar={sidebar}
        mainContent={mainContent}
      />

      {/* Content View Modal */}
      {selectedContentId && (
        <ContentViewModal
          isOpen={isContentModalOpen}
          onClose={closeContentModal}
          contentId={selectedContentId}
          onNavigate={handleContentNavigation}
        />
      )}

      {/* Game Setup Modal */}
      <GameSetupModal
        isOpen={isGameSetupModalOpen}
        onClose={() => setIsGameSetupModalOpen(false)}
        selectedContentIds={gameSetupData.contentIds}
        selectedUnit={gameSetupData.unit}
        selectedTopicId={gameSetupData.topicId}
        selectedTopicName={gameSetupData.topicName}
        unitTopics={gameSetupData.unitTopics}
      />

      {/* Review Modal */}
      {reviewContent && (
        <UnifiedReviewModal
          isOpen={isReviewModalOpen}
          onClose={closeReviewModal}
          content={reviewContent}
          contentItems={topicContentItems}
        />
      )}
    </>
  );
}
