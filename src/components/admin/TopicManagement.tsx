'use client';

import React from 'react';
import { UnitSelector } from './topic-management';
import { useTopicManagement } from './topic-management/hooks/useTopicManagement';

// Import refactored components
import { TopicManagementHeader } from './topic-management/components/layout/TopicManagementHeader';
import { LoadingState } from './topic-management/components/layout/LoadingState';
import { EmptyState } from './topic-management/components/layout/EmptyState';
import { ModalManager } from './topic-management/components/modals/ModalManager';
import TopicList from './topic-management/components/TopicList';
import ContentList from './topic-management/components/ContentList';

// Import custom hooks
import { useModalState } from './topic-management/hooks/useModalState';
import { useFormHandlers } from './topic-management/hooks/useFormHandlers';
import { useTopicActions } from './topic-management/hooks/useTopicActions';

// Import utilities
import { getTopicsByUnit } from './topic-management/utils/topicUtils';

export default function TopicManagement() {
  // Core topic management state and operations
  const {
    topics,
    content,
    questions,
    selectedProgram,
    selectedUnit,
    searchTerm,
    isLoading,
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
    getFilteredTopics,
    fetchTopics,
    fetchContent,
  } = useTopicManagement();

  // Modal state management
  const [modalState, modalActions] = useModalState();

  // Form handling
  const {
    topicFormData,
    setTopicFormData,
    contentFormData,
    setContentFormData,
    handleTopicSubmit,
    handleContentSubmit,
    resetTopicForm,
    resetContentForm,
    populateTopicForm,
    populateContentForm,
  } = useFormHandlers(fetchTopics, fetchContent);

  // Action handlers
  const {
    selectedTopicForView,
    setSelectedTopicForView,
    handleEditTopic,
    handleAddContentToTopic,
    handleAIGenerateContent,
    handleViewContent,
    handleViewQuestions,
    handleAddQuestion,
    handleAIGenerate,
    handleEditContent,
  } = useTopicActions(content, modalActions, populateTopicForm, populateContentForm);

  // Derived data
  const filteredTopics = getFilteredTopics();
  const topicsByUnit = getTopicsByUnit(filteredTopics);

  // Wrapper functions for form submission
  const wrappedHandleTopicSubmit = async (e: React.FormEvent) => {
    const success = await handleTopicSubmit(e, modalState.editingTopic);
    if (success) {
      modalActions.closeTopicDialog();
    }
  };

  const wrappedHandleContentSubmit = async (e: React.FormEvent) => {
    const success = await handleContentSubmit(e, modalState.editingContent);
    if (success) {
      modalActions.closeContentDialog();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-3 mt-8">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 mt-8">
      {/* Header */}
      <TopicManagementHeader
        selectedProgram={selectedProgram}
        setSelectedProgram={setSelectedProgram}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddTopic={() => modalActions.openTopicDialog()}
      />

      {/* Unit Selector */}
      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl shadow-lg p-4 mb-2 border-4 border-yellow-300">
        <UnitSelector
          topics={topics}
          selectedProgram={selectedProgram}
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
        />
      </div>

      {/* Main Content */}
      {selectedUnit ? (
        <div className="space-y-3">
          {/* Topics Display */}
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

          {/* Content Display - Shows when topic is selected */}
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
        <EmptyState />
      )}

      {/* Modal Manager - Handles all modals */}
      <ModalManager
        modalState={modalState}
        modalActions={modalActions}
        topicFormData={topicFormData}
        setTopicFormData={setTopicFormData}
        contentFormData={contentFormData}
        setContentFormData={setContentFormData}
        handleTopicSubmit={wrappedHandleTopicSubmit}
        handleContentSubmit={wrappedHandleContentSubmit}
        resetTopicForm={resetTopicForm}
        resetContentForm={resetContentForm}
        fetchContent={fetchContent}
        onAddQuestion={handleAddQuestion}
      />
    </div>
  );
}
