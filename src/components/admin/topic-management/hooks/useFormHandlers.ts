'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Topic, Content } from '../types';

interface TopicFormData {
  topic: string;
  short_summary: string;
  unit: string;
  image: string;
  parentid: string | null;
  showstudent: boolean;
  program: string;
}

interface ContentFormData {
  title: string;
  infor1: string;
  infor2: string;
  image1: string;
  image2: string;
  video1: string;
  video2: string;
  topicid: string;
}

export const useFormHandlers = (
  fetchTopics: () => void,
  fetchContent: () => void
) => {
  const { toast } = useToast();

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

  const [contentFormData, setContentFormData] = useState<ContentFormData>({
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
  const handleTopicSubmit = async (e: React.FormEvent, editingTopic: Topic | null) => {
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

      resetTopicForm();
      fetchTopics();
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingTopic ? 'update' : 'create'} topic`,
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleContentSubmit = async (e: React.FormEvent, editingContent: Content | null) => {
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

      resetContentForm();
      fetchContent();
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingContent ? 'update' : 'create'} content`,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Form reset functions
  const resetTopicForm = () => {
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

  // Form population functions
  const populateTopicForm = (topic: Topic) => {
    setTopicFormData({
      topic: topic.topic,
      short_summary: topic.short_summary || '',
      unit: topic.unit || '',
      image: topic.image || '',
      parentid: topic.parentid || null,
      showstudent: topic.showstudent || true,
      program: topic.program || ''
    });
  };

  const populateContentForm = (content: Content, topicId?: string) => {
    setContentFormData({
      title: content?.title || '',
      infor1: content?.infor1 || '',
      infor2: content?.infor2 || '',
      image1: content?.image1 || '',
      image2: content?.image2 || '',
      video1: content?.video1 || '',
      video2: content?.video2 || '',
      topicid: topicId || content?.topicid || content?.topic_id || ''
    });
  };

  return {
    // Form data
    topicFormData,
    setTopicFormData,
    contentFormData,
    setContentFormData,
    
    // Form handlers
    handleTopicSubmit,
    handleContentSubmit,
    
    // Form reset
    resetTopicForm,
    resetContentForm,
    
    // Form population
    populateTopicForm,
    populateContentForm,
  };
};
