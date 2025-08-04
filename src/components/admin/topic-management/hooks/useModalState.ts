'use client';

import { useState } from 'react';
import { Topic, Content } from '../types';

export interface ModalState {
  // Topic modals
  isTopicDialogOpen: boolean;
  editingTopic: Topic | null;
  
  // Content modals
  isContentDialogOpen: boolean;
  editingContent: Content | null;
  
  // AI Generation modals
  isQuizGeneratorOpen: boolean;
  isContentGeneratorOpen: boolean;
  selectedContentForAI: { id: string; title: string } | null;
  selectedTopicForAI: { id: string; name: string; summary: string } | null;
  
  // Question modals
  selectedQuestion: any;
  editingQuestion: any;
  selectedContentForManualQuestion: Content | null;
  
  // View modals
  selectedContentForView: Content | null;
  selectedContentForQuestions: Content | null;
}

export interface ModalActions {
  // Topic actions
  openTopicDialog: (topic?: Topic) => void;
  closeTopicDialog: () => void;
  
  // Content actions
  openContentDialog: (content?: Content, topicId?: string) => void;
  closeContentDialog: () => void;
  
  // AI Generation actions
  openQuizGenerator: (contentId: string, contentTitle: string) => void;
  closeQuizGenerator: () => void;
  openContentGenerator: (topicId: string, topicName: string, summary?: string) => void;
  closeContentGenerator: () => void;
  
  // Question actions
  openQuestionDialog: (question: any) => void;
  closeQuestionDialog: () => void;
  openManualQuestionDialog: (content: Content) => void;
  closeManualQuestionDialog: () => void;
  setEditingQuestion: (question: any) => void;
  
  // View actions
  openContentView: (content: Content) => void;
  closeContentView: () => void;
  openContentQuestions: (content: Content) => void;
  closeContentQuestions: () => void;
}

export const useModalState = (): [ModalState, ModalActions] => {
  // Topic modal state
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  
  // Content modal state
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  
  // AI Generation modal state
  const [isQuizGeneratorOpen, setIsQuizGeneratorOpen] = useState(false);
  const [isContentGeneratorOpen, setIsContentGeneratorOpen] = useState(false);
  const [selectedContentForAI, setSelectedContentForAI] = useState<{ id: string; title: string } | null>(null);
  const [selectedTopicForAI, setSelectedTopicForAI] = useState<{ id: string; name: string; summary: string } | null>(null);
  
  // Question modal state
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [selectedContentForManualQuestion, setSelectedContentForManualQuestion] = useState<Content | null>(null);
  
  // View modal state
  const [selectedContentForView, setSelectedContentForView] = useState<Content | null>(null);
  const [selectedContentForQuestions, setSelectedContentForQuestions] = useState<Content | null>(null);

  const modalState: ModalState = {
    isTopicDialogOpen,
    editingTopic,
    isContentDialogOpen,
    editingContent,
    isQuizGeneratorOpen,
    isContentGeneratorOpen,
    selectedContentForAI,
    selectedTopicForAI,
    selectedQuestion,
    editingQuestion,
    selectedContentForManualQuestion,
    selectedContentForView,
    selectedContentForQuestions,
  };

  const modalActions: ModalActions = {
    // Topic actions
    openTopicDialog: (topic?: Topic) => {
      setEditingTopic(topic || null);
      setIsTopicDialogOpen(true);
    },
    closeTopicDialog: () => {
      setIsTopicDialogOpen(false);
      setEditingTopic(null);
    },
    
    // Content actions
    openContentDialog: (content?: Content, topicId?: string) => {
      setEditingContent(content || null);
      setIsContentDialogOpen(true);
    },
    closeContentDialog: () => {
      setIsContentDialogOpen(false);
      setEditingContent(null);
    },
    
    // AI Generation actions
    openQuizGenerator: (contentId: string, contentTitle: string) => {
      setSelectedContentForAI({ id: contentId, title: contentTitle });
      setIsQuizGeneratorOpen(true);
    },
    closeQuizGenerator: () => {
      setIsQuizGeneratorOpen(false);
      setSelectedContentForAI(null);
    },
    openContentGenerator: (topicId: string, topicName: string, summary?: string) => {
      setSelectedTopicForAI({ id: topicId, name: topicName, summary: summary || '' });
      setIsContentGeneratorOpen(true);
    },
    closeContentGenerator: () => {
      setIsContentGeneratorOpen(false);
      setSelectedTopicForAI(null);
    },
    
    // Question actions
    openQuestionDialog: (question: any) => {
      setSelectedQuestion(question);
    },
    closeQuestionDialog: () => {
      setSelectedQuestion(null);
    },
    openManualQuestionDialog: (content: Content) => {
      setSelectedContentForManualQuestion(content);
    },
    closeManualQuestionDialog: () => {
      setSelectedContentForManualQuestion(null);
      setEditingQuestion(null);
    },
    setEditingQuestion: (question: any) => {
      setEditingQuestion(question);
    },
    
    // View actions
    openContentView: (content: Content) => {
      setSelectedContentForView(content);
    },
    closeContentView: () => {
      setSelectedContentForView(null);
    },
    openContentQuestions: (content: Content) => {
      setSelectedContentForQuestions(content);
    },
    closeContentQuestions: () => {
      setSelectedContentForQuestions(null);
    },
  };

  return [modalState, modalActions];
};
