import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Topic, Content, Question } from '../types';

export const useTopicManagement = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('Grapeseed');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Fetch data functions
  const fetchTopics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/topics');
      if (response.ok) {
        const data = await response.json();
        setTopics(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch topics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/admin/content');
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch content",
        variant: "destructive",
      });
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/admin/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive",
      });
    }
  };

  // Topic CRUD operations
  const handleMoveTopicUp = async (topicId: string, unit: string) => {
    try {
      const response = await fetch(`/api/admin/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'move_up', unit }),
      });
      
      if (response.ok) {
        await fetchTopics();
        toast({
          title: "Success",
          description: "Topic moved up successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move topic up",
        variant: "destructive",
      });
    }
  };

  const handleMoveTopicDown = async (topicId: string, unit: string) => {
    try {
      const response = await fetch(`/api/admin/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'move_down', unit }),
      });
      
      if (response.ok) {
        await fetchTopics();
        toast({
          title: "Success",
          description: "Topic moved down successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move topic down",
        variant: "destructive",
      });
    }
  };

  const handleToggleTopicVisibility = async (topicId: string) => {
    try {
      const response = await fetch(`/api/admin/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_visibility' }),
      });
      
      if (response.ok) {
        await fetchTopics();
        toast({
          title: "Success",
          description: "Topic visibility updated",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update topic visibility",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    
    try {
      const response = await fetch(`/api/admin/topics/${topicId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchTopics();
        toast({
          title: "Success",
          description: "Topic deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete topic",
        variant: "destructive",
      });
    }
  };

  // Content CRUD operations
  const handleMoveContentUp = async (contentId: string, topicId: string) => {
    try {
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'move_up', topic_id: topicId }),
      });
      
      if (response.ok) {
        await fetchContent();
        toast({
          title: "Success",
          description: "Content moved up successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move content up",
        variant: "destructive",
      });
    }
  };

  const handleMoveContentDown = async (contentId: string, topicId: string) => {
    try {
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'move_down', topic_id: topicId }),
      });
      
      if (response.ok) {
        await fetchContent();
        toast({
          title: "Success",
          description: "Content moved down successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move content down",
        variant: "destructive",
      });
    }
  };

  const handleToggleContentVisibility = async (contentId: string) => {
    try {
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_visibility' }),
      });
      
      if (response.ok) {
        await fetchContent();
        toast({
          title: "Success",
          description: "Content visibility updated",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update content visibility",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    try {
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchContent();
        toast({
          title: "Success",
          description: "Content deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    }
  };

  // Utility functions
  const toggleTopicExpansion = (topicId: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  const getFilteredTopics = () => {
    let filtered = topics.filter(topic => topic.program === selectedProgram);
    
    if (selectedUnit) {
      filtered = filtered.filter(topic => topic.unit === selectedUnit);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(topic => 
        topic.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (topic.short_summary && topic.short_summary.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  // Initialize data
  useEffect(() => {
    fetchTopics();
    fetchContent();
    fetchQuestions();
  }, []);

  // Reset unit selection when program changes
  useEffect(() => {
    if (selectedProgram !== 'Grapeseed') {
      setSelectedUnit(null);
    }
  }, [selectedProgram]);

  return {
    // State
    topics,
    content,
    questions,
    selectedProgram,
    selectedUnit,
    searchTerm,
    isLoading,
    expandedTopics,
    
    // Setters
    setSelectedProgram,
    setSelectedUnit,
    setSearchTerm,
    
    // Topic operations
    handleMoveTopicUp,
    handleMoveTopicDown,
    handleToggleTopicVisibility,
    handleDeleteTopic,
    
    // Content operations
    handleMoveContentUp,
    handleMoveContentDown,
    handleToggleContentVisibility,
    handleDeleteContent,
    
    // Utility functions
    toggleTopicExpansion,
    getFilteredTopics,
    
    // Refresh functions
    fetchTopics,
    fetchContent,
    fetchQuestions,
  };
};
