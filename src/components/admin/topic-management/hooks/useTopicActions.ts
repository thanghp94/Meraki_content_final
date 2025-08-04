'use client';

import { useState } from 'react';
import { Topic, Content } from '../types';
import { ModalActions } from './useModalState';

export const useTopicActions = (
  content: Content[],
  modalActions: ModalActions,
  populateTopicForm: (topic: Topic) => void,
  populateContentForm: (content: Content, topicId?: string) => void
) => {
  const [selectedTopicForView, setSelectedTopicForView] = useState<string>('');

  // Topic action handlers
  const handleEditTopic = (topic: Topic) => {
    populateTopicForm(topic);
    modalActions.openTopicDialog(topic);
  };

  const handleAddContentToTopic = (topicId: string) => {
    populateContentForm({} as Content, topicId);
    modalActions.openContentDialog();
  };

  const handleAIGenerateContent = (topicId: string, topicName: string, summary?: string) => {
    modalActions.openContentGenerator(topicId, topicName, summary);
  };

  // Content action handlers
  const handleViewContent = (content: Content) => {
    modalActions.openContentView(content);
  };

  const handleViewQuestions = (content: Content) => {
    modalActions.openContentQuestions(content);
  };

  const handleAddQuestion = (contentId: string) => {
    // Find the content to get its title
    const contentItem = content.find(c => c.id === contentId);
    if (contentItem) {
      modalActions.openManualQuestionDialog(contentItem);
    }
  };

  const handleAIGenerate = (contentId: string, contentTitle: string) => {
    modalActions.openQuizGenerator(contentId, contentTitle);
  };

  const handleEditContent = (content: Content) => {
    populateContentForm(content);
    modalActions.openContentDialog(content);
  };

  return {
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
  };
};
