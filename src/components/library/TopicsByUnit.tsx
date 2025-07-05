'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronRight, BookOpen, Image, Eye, Play, FileText } from 'lucide-react';
import ContentViewModal from '@/components/ui/content-view-modal';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Topic {
  id: string;
  topic: string;
  short_summary: string;
  image: string;
}

interface Content {
  id: string;
  title: string;
  infor1: string;
  infor2: string;
  image1: string;
  image2?: string;
  video1: string;
  video2?: string;
  topicid: string;
  date_created: string;
  question_count: number;
  visible?: boolean;
  order_index?: number;
}

interface UnitGroup {
  unit: string;
  topics: Topic[];
}

interface TopicsByUnitProps {
  programFilter?: string;
}

export default function TopicsByUnit({ programFilter }: TopicsByUnitProps) {
  const router = useRouter();
  const [unitGroups, setUnitGroups] = useState<UnitGroup[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [isContentSelectionOpen, setIsContentSelectionOpen] = useState(false);
  const [selectedTopicForGame, setSelectedTopicForGame] = useState<Topic | null>(null);
  const [selectedContentIds, setSelectedContentIds] = useState<Set<string>>(new Set());
  const [isUnitSelectionOpen, setIsUnitSelectionOpen] = useState(false);
  const [selectedUnitForGame, setSelectedUnitForGame] = useState<UnitGroup | null>(null);
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());
  const [expandedTopicsInDialog, setExpandedTopicsInDialog] = useState<Set<string>>(new Set());
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Build API URL with program filter if provided (no unit filter for initial load)
        const topicsUrl = programFilter 
          ? `/api/topics/by-unit?program=${encodeURIComponent(programFilter)}`
          : '/api/topics/by-unit';
        
        console.log('Fetching initial placeholders for program:', programFilter, 'URL:', topicsUrl);
        
        const [topicsResponse, contentResponse] = await Promise.all([
          fetch(topicsUrl),
          fetch('/api/admin/content')
        ]);
        
        if (!topicsResponse.ok) {
          throw new Error('Failed to fetch topics');
        }
        if (!contentResponse.ok) {
          throw new Error('Failed to fetch content');
        }
        
        const topicsData = await topicsResponse.json();
        const contentData = await contentResponse.json();
        
        console.log('Received initial placeholders for', programFilter, ':', topicsData);
        
        setUnitGroups(topicsData);
        setContent(contentData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if programFilter is provided
    if (programFilter) {
      fetchInitialData();
    }
  }, [programFilter]);

  const toggleUnit = (unit: string) => {
    // Only allow one unit to be selected at a time
    if (expandedUnits.has(unit)) {
      // If clicking the same unit, collapse it
      setExpandedUnits(new Set());
    } else {
      // If clicking a different unit, expand only that one
      setExpandedUnits(new Set([unit]));
    }
  };

  const toggleTopic = (topicId: string) => {
    // Only allow one topic to be expanded at a time
    if (expandedTopics.has(topicId)) {
      // If clicking the same topic, collapse it
      setExpandedTopics(new Set());
    } else {
      // If clicking a different topic, expand only that one
      setExpandedTopics(new Set([topicId]));
    }
  };

  // Get content by topic ID, filtering out hidden content and sorting by order_index
  const getContentForTopic = (topic: Topic): Content[] => {
    return content
      .filter(item => item.topicid === topic.id)
      .filter(item => item.visible !== false) // Only show visible content (default to visible if not specified)
      .sort((a, b) => {
        // Sort by order_index, with items without order_index appearing last
        const orderA = a.order_index ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order_index ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });
  };

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading topics by unit...</p>
      </div>
    );
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


  return (
    <div className="box-border flex relative w-full max-w-[1440px] min-h-[600px] bg-white border-2 border-gray-300 rounded-lg mx-auto">
      {/* Sidebar for units */}
      <div className="w-48 border-r border-gray-200 bg-gray-50">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Units</h3>
          <div className="space-y-1">
            {unitGroups.map((unitGroup) => {
              const isSelected = expandedUnits.has(unitGroup.unit);
              
              return (
                <div
                  key={unitGroup.unit}
                  className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => toggleUnit(unitGroup.unit)}
                >
                  <span className="text-sm font-medium truncate">
                    {unitGroup.unit}
                  </span>
                  <div className="flex items-center gap-1">
                    {unitGroup.topics.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUnitForGame(unitGroup);
                          setSelectedTopicIds(new Set());
                          setSelectedContentIds(new Set());
                          setIsUnitSelectionOpen(true);
                        }}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 p-6">
        {expandedUnits.size === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Unit</h3>
            <p>Choose a unit from the sidebar to view its topics and content.</p>
          </div>
        ) : (
          unitGroups.map((unitGroup) => {
            const isExpanded = expandedUnits.has(unitGroup.unit);
            
            if (!isExpanded) return null;
            
            return (
              <div key={`${unitGroup.unit}-content`} className="w-full">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-blue-700">{unitGroup.unit}</h2>
                  <p className="text-gray-600 mt-1">Topics and content for this unit</p>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unitGroup.topics.map((topic) => {
                      const topicContent = getContentForTopic(topic);
                      const questionCounts = topicContent.map(content => Number(content.question_count) || 0).filter(count => count > 0);
                      const totalQuestions = questionCounts.reduce((sum, count) => sum + count, 0);
                      
                      return (
                        <Card 
                          key={topic.id}
                          className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => toggleTopic(topic.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 flex-grow min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                  {topic.topic || 'Untitled Topic'}
                                </h4>
                                {expandedTopics.has(topic.id) ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                )}
                              </div>
                              {totalQuestions > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const topicContent = getContentForTopic(topic);
                                    if (topicContent.length > 0) {
                                      setSelectedTopicForGame(topic);
                                      setSelectedContentIds(new Set());
                                      setIsContentSelectionOpen(true);
                                    } else {
                                      // If no content, go directly to setup with just the topic
                                      router.push(`/setup?topicId=${topic.id}`);
                                    }
                                  }}
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Content cards integrated within the same unit container */}
                  {unitGroup.topics.some(topic => expandedTopics.has(topic.id)) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                      {unitGroup.topics
                        .filter(topic => expandedTopics.has(topic.id))
                        .flatMap(topic => {
                          const topicContent = getContentForTopic(topic);
                          return topicContent.map((content, index) => ({
                            ...content,
                            displayOrder: index + 1
                          }));
                        })
                        .map((content) => (
                          <Card 
                            key={content.id} 
                            className="hover:shadow-sm transition-shadow w-full bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 border-l-4 border-l-orange-400 cursor-pointer"
                            onClick={() => handleViewContent(content.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 flex-grow min-w-0">
                                  <div 
                                    className="flex items-center justify-center w-5 h-5 text-xs font-medium border border-orange-300 rounded bg-orange-100 text-orange-700 flex-shrink-0"
                                    title={`Content order: ${content.displayOrder}`}
                                  >
                                    {content.displayOrder}
                                  </div>
                                  <h5 className="font-medium text-sm truncate text-orange-900">{content.title}</h5>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-100 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/setup?contentId=${content.id}`);
                                  }}
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}

                  {/* Show empty state if expanded topic has no content */}
                  {unitGroup.topics.some(topic => expandedTopics.has(topic.id)) && 
                   unitGroup.topics
                     .filter(topic => expandedTopics.has(topic.id))
                     .every(topic => getContentForTopic(topic).length === 0) && (
                    <div className="text-center py-8 text-sm text-muted-foreground bg-muted/50 rounded-lg w-full">
                      No content available for this topic
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Content Selection Dialog */}
      <Dialog open={isContentSelectionOpen} onOpenChange={setIsContentSelectionOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Select Content for {selectedTopicForGame?.topic}
            </DialogTitle>
            <DialogDescription>
              Choose which content items to include in the game. Questions from selected content will be combined.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedTopicForGame && getContentForTopic(selectedTopicForGame).map((content) => (
              <div key={content.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50">
                <Checkbox
                  id={content.id}
                  checked={selectedContentIds.has(content.id)}
                  onCheckedChange={(checked) => {
                    const newSelected = new Set(selectedContentIds);
                    if (checked) {
                      newSelected.add(content.id);
                    } else {
                      newSelected.delete(content.id);
                    }
                    setSelectedContentIds(newSelected);
                  }}
                />
                <div className="flex-grow">
                  <label htmlFor={content.id} className="text-sm font-medium cursor-pointer">
                    {content.title}
                  </label>
                </div>
                <Badge variant="secondary">{content.question_count} questions</Badge>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsContentSelectionOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedTopicForGame) {
                  router.push(`/setup?topicId=${selectedTopicForGame.id}`);
                  setIsContentSelectionOpen(false);
                }
              }}
            >
              Use All Content from Topic
            </Button>
            <Button
              onClick={() => {
                if (selectedTopicForGame && selectedContentIds.size > 0) {
                  const contentIds = Array.from(selectedContentIds).join(',');
                  router.push(`/setup?contentIds=${contentIds}&topicId=${selectedTopicForGame.id}`);
                  setIsContentSelectionOpen(false);
                }
              }}
              disabled={selectedContentIds.size === 0}
            >
              Start Game ({selectedContentIds.size} content selected)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unit Selection Dialog */}
      <Dialog open={isUnitSelectionOpen} onOpenChange={setIsUnitSelectionOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Select Content for {selectedUnitForGame?.unit}
            </DialogTitle>
            <DialogDescription>
              Choose which topics and content to include in the game. Questions from selected content will be combined.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedUnitForGame?.topics.map((topic) => {
              const topicContent = getContentForTopic(topic);
              const isTopicSelected = selectedTopicIds.has(topic.id);
              const isTopicExpanded = expandedTopicsInDialog.has(topic.id);
              const selectedContentInTopic = topicContent.filter(content => selectedContentIds.has(content.id));
              
              return (
                <div key={topic.id} className="border rounded-lg overflow-hidden">
                  {/* Topic Header */}
                  <div 
                    className="flex items-center space-x-4 p-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (topicContent.length > 0) {
                        const newExpanded = new Set(expandedTopicsInDialog);
                        if (isTopicExpanded) {
                          newExpanded.delete(topic.id);
                        } else {
                          newExpanded.add(topic.id);
                        }
                        setExpandedTopicsInDialog(newExpanded);
                      }
                    }}
                  >
                    <Checkbox
                      id={`topic-${topic.id}`}
                      checked={isTopicSelected}
                      onCheckedChange={(checked) => {
                        const newTopicIds = new Set(selectedTopicIds);
                        const newContentIds = new Set(selectedContentIds);
                        
                        if (checked) {
                          newTopicIds.add(topic.id);
                          // When selecting a topic, select all its content
                          topicContent.forEach(content => newContentIds.add(content.id));
                        } else {
                          newTopicIds.delete(topic.id);
                          // When deselecting a topic, deselect all its content
                          topicContent.forEach(content => newContentIds.delete(content.id));
                        }
                        
                        setSelectedTopicIds(newTopicIds);
                        setSelectedContentIds(newContentIds);
                      }}
                      onClick={(e) => e.stopPropagation()} // Prevent triggering dropdown
                    />
                    <div className="flex-grow">
                      <label htmlFor={`topic-${topic.id}`} className="text-sm font-semibold cursor-pointer">
                        {topic.topic}
                      </label>
                      <p className="text-xs text-muted-foreground">{topic.short_summary}</p>
                      {selectedContentInTopic.length > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          {selectedContentInTopic.length} of {topicContent.length} content selected
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {topicContent.length} content
                      </Badge>
                      <Badge variant="outline">
                        {topicContent.reduce((sum, content) => sum + content.question_count, 0)} questions
                      </Badge>
                      {topicContent.length > 0 && (
                        <div className="h-8 w-8 flex items-center justify-center">
                          {isTopicExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Cards (collapsible) */}
                  {isTopicExpanded && topicContent.length > 0 && (
                    <div className="p-4 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {topicContent.map((content) => (
                          <div 
                            key={content.id} 
                            className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50"
                            onClick={() => {
                              const newContentIds = new Set(selectedContentIds);
                              const isCurrentlySelected = selectedContentIds.has(content.id);
                              
                              if (isCurrentlySelected) {
                                newContentIds.delete(content.id);
                              } else {
                                newContentIds.add(content.id);
                              }
                              setSelectedContentIds(newContentIds);
                              
                              // Update topic selection based on content
                              const allTopicContentSelected = topicContent.every(c => 
                                newContentIds.has(c.id)
                              );
                              
                              const newTopicIds = new Set(selectedTopicIds);
                              if (allTopicContentSelected) {
                                newTopicIds.add(topic.id);
                              } else {
                                newTopicIds.delete(topic.id);
                              }
                              setSelectedTopicIds(newTopicIds);
                            }}
                          >
                            <Checkbox
                              checked={selectedContentIds.has(content.id)}
                              onChange={() => {}} // Handled by parent click
                              className="pointer-events-none"
                            />
                            <div className="flex-grow">
                              <label className="text-sm font-medium cursor-pointer">
                                {content.title}
                              </label>
                            </div>
                            <Badge variant="secondary">{content.question_count} questions</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsUnitSelectionOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedUnitForGame) {
                  const allTopicIds = selectedUnitForGame.topics.map(t => t.id).join(',');
                  router.push(`/setup?topicIds=${allTopicIds}&unit=${encodeURIComponent(selectedUnitForGame.unit)}`);
                  setIsUnitSelectionOpen(false);
                }
              }}
            >
              Use All Content from Unit
            </Button>
            <Button
              onClick={() => {
                if (selectedUnitForGame) {
                  if (selectedContentIds.size > 0) {
                    const contentIds = Array.from(selectedContentIds).join(',');
                    router.push(`/setup?contentIds=${contentIds}&unit=${encodeURIComponent(selectedUnitForGame.unit)}`);
                  } else if (selectedTopicIds.size > 0) {
                    const topicIds = Array.from(selectedTopicIds).join(',');
                    router.push(`/setup?topicIds=${topicIds}&unit=${encodeURIComponent(selectedUnitForGame.unit)}`);
                  }
                  setIsUnitSelectionOpen(false);
                }
              }}
              disabled={selectedTopicIds.size === 0 && selectedContentIds.size === 0}
            >
              Start Game ({selectedContentIds.size} content selected)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content View Modal */}
      {selectedContentId && (
        <ContentViewModal
          isOpen={isContentModalOpen}
          onClose={closeContentModal}
          contentId={selectedContentId}
          onNavigate={handleContentNavigation}
          showNavigation={content.length > 1}
        />
      )}
    </div>
  );
}
