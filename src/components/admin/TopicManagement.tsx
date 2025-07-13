'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Search, ChevronRight, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  TopicCard, 
  UnitSelector, 
  useTopicManagement,
  Topic,
  Content
} from './topic-management';
import { TopicActionsMenu } from './topic-management/components/actions/TopicActionsMenu';
import { ContentActionsMenu } from './topic-management/components/actions/ContentActionsMenu';

// Import existing modals (these would need to be extracted too, but keeping them for now)
import { QuizGeneratorModal } from './QuizGeneratorModal';
import { ContentGeneratorModal } from './ContentGeneratorModal';
import { ImageSearchModal } from './ImageSearchModal';
import { YouTubeSearchModal } from './YouTubeSearchModal';
import AdminQuestionDialog from './AdminQuestionDialog';
import ContentViewModal from '@/components/ui/content-view-modal-fixed';

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
    setSelectedTopicForContent('');
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
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold">Topic Management</h1>
          <div className="flex items-center gap-4">
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Grapeseed">Grapeseed</SelectItem>
                <SelectItem value="TATH">TATH</SelectItem>
                <SelectItem value="WSC">WSC</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
        <Dialog open={isTopicDialogOpen} onOpenChange={(open) => {
          setIsTopicDialogOpen(open);
          if (!open) resetTopicForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-3 w-3 mr-1" />
              Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTopic ? 'Edit Topic' : 'Add New Topic'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleTopicSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic Name</Label>
                    <Input
                      id="topic"
                      value={topicFormData.topic}
                      onChange={(e) => setTopicFormData(prev => ({ ...prev, topic: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program">Program</Label>
                    <Select
                      value={topicFormData.program}
                      onValueChange={(value) => setTopicFormData(prev => ({ ...prev, program: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grapeseed">Grapeseed</SelectItem>
                        <SelectItem value="TATH">TATH</SelectItem>
                        <SelectItem value="WSC">WSC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={topicFormData.unit}
                      onChange={(e) => setTopicFormData(prev => ({ ...prev, unit: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={topicFormData.image}
                      onChange={(e) => setTopicFormData(prev => ({ ...prev, image: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="short_summary">Summary</Label>
                  <Textarea
                    id="short_summary"
                    value={topicFormData.short_summary}
                    onChange={(e) => setTopicFormData(prev => ({ ...prev, short_summary: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showstudent"
                    checked={topicFormData.showstudent}
                    onCheckedChange={(checked) => setTopicFormData(prev => ({ ...prev, showstudent: checked }))}
                  />
                  <Label htmlFor="showstudent">Visible to students</Label>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsTopicDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTopic ? 'Update Topic' : 'Create Topic'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Unit Selector */}
      <div className="mb-3">
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
          {Object.entries(topicsByUnit).map(([unit, unitTopics]) => (
            <div key={unit}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                📚 {unit}
                <span className="text-sm text-gray-500">({unitTopics.length} topics)</span>
              </h2>
              
              {/* Topic Selector - Similar to Library View */}
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 mb-4">
                {unitTopics.map((topic) => {
                  const topicContent = content
                    .filter(c => c.topicid === topic.id || c.topic_id === topic.id)
                    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
                  
                  const isSelected = selectedTopicForView === topic.id;
                  
                  return (
                    <Card 
                      key={topic.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      } ${topic.visible === false ? 'opacity-50' : ''}`}
                      onClick={() => setSelectedTopicForView(topic.id)}
                    >
                      <div className="px-2 py-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1">
                                <h3 className="font-medium text-xs truncate">{topic.topic}</h3>
                                <Badge variant="secondary" className="text-xs h-3 px-1 shrink-0">
                                  {topicContent.length}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <TopicActionsMenu
                            topic={topic}
                            unit={unit}
                            onMoveUp={() => handleMoveTopicUp(topic.id, unit)}
                            onMoveDown={() => handleMoveTopicDown(topic.id, unit)}
                            onToggleVisibility={() => handleToggleTopicVisibility(topic.id)}
                            onAddContent={() => handleAddContentToTopic(topic.id)}
                            onAIGenerate={() => handleAIGenerateContent(topic.id, topic.topic, topic.short_summary)}
                            onEdit={() => handleEditTopic(topic)}
                            onDelete={() => handleDeleteTopic(topic.id)}
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Content Display Area - Shows when topic is selected */}
              {selectedTopicForView && (
                <div className="border rounded-lg bg-white">
                  <div className="border-b p-4">
                    <h3 className="text-lg font-semibold">
                      {unitTopics.find(t => t.id === selectedTopicForView)?.topic}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Content for this topic
                    </p>
                  </div>
                  <div className="p-4">
                    {(() => {
                      const selectedTopicContent = content
                        .filter(c => (c.topicid === selectedTopicForView || c.topic_id === selectedTopicForView))
                        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
                      
                      if (selectedTopicContent.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            <p>No content available for this topic</p>
                            <Button 
                              onClick={() => handleAddContentToTopic(selectedTopicForView)}
                              className="mt-4"
                              size="sm"
                            >
                              Add Content
                            </Button>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="space-y-1">
                          {selectedTopicContent.map((contentItem) => (
                            <Card key={contentItem.id} className="hover:shadow-sm transition-shadow">
                              <div className="p-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <FileText className="h-3 w-3 text-green-600 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-xs truncate">{contentItem.title}</h4>
                                        {contentItem.infor1 && (
                                          <span className="text-xs text-gray-500 truncate">• {contentItem.infor1}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <ContentActionsMenu
                                    contentItem={contentItem}
                                    topicId={selectedTopicForView}
                                    onMoveUp={() => handleMoveContentUp(contentItem.id, selectedTopicForView)}
                                    onMoveDown={() => handleMoveContentDown(contentItem.id, selectedTopicForView)}
                                    onToggleVisibility={() => handleToggleContentVisibility(contentItem.id)}
                                    onView={() => handleViewContent(contentItem)}
                                    onAddQuestion={() => handleAddQuestion(contentItem.id)}
                                    onAIGenerate={() => handleAIGenerate(contentItem.id, contentItem.title)}
                                    onEdit={() => handleEditContent(contentItem)}
                                    onDelete={() => handleDeleteContent(contentItem.id)}
                                  />
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          ))}
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

      {/* Content Creation Dialog */}
      <Dialog open={isContentDialogOpen} onOpenChange={(open) => {
        setIsContentDialogOpen(open);
        if (!open) resetContentForm();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? 'Edit Content' : 'Add New Content'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleContentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content-title">Title</Label>
              <Input
                id="content-title"
                value={contentFormData.title}
                onChange={(e) => setContentFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content-infor1">Description</Label>
                <Textarea
                  id="content-infor1"
                  value={contentFormData.infor1}
                  onChange={(e) => setContentFormData(prev => ({ ...prev, infor1: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content-infor2">Additional Information</Label>
                <Textarea
                  id="content-infor2"
                  value={contentFormData.infor2}
                  onChange={(e) => setContentFormData(prev => ({ ...prev, infor2: e.target.value }))}
                  rows={4}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content-image1">Image 1 URL</Label>
                <Input
                  id="content-image1"
                  value={contentFormData.image1}
                  onChange={(e) => setContentFormData(prev => ({ ...prev, image1: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content-image2">Image 2 URL</Label>
                <Input
                  id="content-image2"
                  value={contentFormData.image2}
                  onChange={(e) => setContentFormData(prev => ({ ...prev, image2: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content-video1">Video 1 URL</Label>
                <Input
                  id="content-video1"
                  value={contentFormData.video1}
                  onChange={(e) => setContentFormData(prev => ({ ...prev, video1: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content-video2">Video 2 URL</Label>
                <Input
                  id="content-video2"
                  value={contentFormData.video2}
                  onChange={(e) => setContentFormData(prev => ({ ...prev, video2: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsContentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingContent ? 'Update Content' : 'Create Content'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
