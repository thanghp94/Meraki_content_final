'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronRight, BookOpen, Image, Eye, Play, FileText } from 'lucide-react';
import ContentViewModal from '@/components/ui/content-view-modal-fixed';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLibrary } from '@/contexts/LibraryContext';

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
  onProgramChange?: (program: 'Grapeseed' | 'TATH') => void;
}

export default function TopicsByUnit({ programFilter, onProgramChange }: TopicsByUnitProps) {
  const router = useRouter();
  const {
    libraryState,
    setUnitGroups,
    addContent,
    setExpandedUnits,
    setExpandedTopics,
    markTopicAsLoaded,
    isTopicLoaded,
  } = useLibrary();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isContentSelectionOpen, setIsContentSelectionOpen] = useState(false);
  const [selectedTopicForGame, setSelectedTopicForGame] = useState<Topic | null>(null);
  const [selectedContentIds, setSelectedContentIds] = useState<Set<string>>(new Set());
  const [isUnitSelectionOpen, setIsUnitSelectionOpen] = useState(false);
  const [selectedUnitForGame, setSelectedUnitForGame] = useState<UnitGroup | null>(null);
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());
  const [expandedTopicsInDialog, setExpandedTopicsInDialog] = useState<Set<string>>(new Set());
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState<Set<string>>(new Set());

  // Extract state from context
  const { unitGroups, content, expandedUnits, expandedTopics } = libraryState;

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Build API URL with program filter if provided (no unit filter for initial load)
        const topicsUrl = programFilter 
          ? `/api/topics/by-unit?program=${encodeURIComponent(programFilter)}`
          : '/api/topics/by-unit';
        
        console.log('Fetching initial placeholders for program:', programFilter, 'URL:', topicsUrl);
        
        // Only fetch topics initially, content will be loaded lazily when topics are expanded
        const topicsResponse = await fetch(topicsUrl);
        
        if (!topicsResponse.ok) {
          throw new Error('Failed to fetch topics');
        }
        
        const topicsData = await topicsResponse.json();
        
        console.log('Received initial placeholders for', programFilter, ':', topicsData);
        
        setUnitGroups(topicsData);
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

  const toggleUnit = async (unit: string) => {
    // Only allow one unit to be selected at a time
    if (expandedUnits.has(unit)) {
      // If clicking the same unit, collapse it
      setExpandedUnits(new Set());
    } else {
      // If clicking a different unit, expand only that one
      setExpandedUnits(new Set([unit]));
      
      // Check if this unit already has topics loaded
      const unitGroup = unitGroups.find(group => group.unit === unit);
      if (unitGroup && unitGroup.topics.length === 0 && programFilter) {
        // Fetch topics for this specific unit
        try {
          console.log('Fetching topics for unit:', unit, 'program:', programFilter);
          const topicsUrl = `/api/topics/by-unit?program=${encodeURIComponent(programFilter)}&unit=${encodeURIComponent(unit)}`;
          const response = await fetch(topicsUrl);
          
          if (!response.ok) {
            throw new Error('Failed to fetch unit topics');
          }
          
          const unitData = await response.json();
          console.log('Received topics for unit:', unit, unitData);
          
          // Update the specific unit with its topics
          if (unitData.length > 0 && unitData[0].topics) {
            const updatedGroups = unitGroups.map((group: UnitGroup) =>
              group.unit === unit
                ? { ...group, topics: unitData[0].topics }
                : group
            );
            setUnitGroups(updatedGroups);
          }
        } catch (error) {
          console.error('Error fetching topics for unit:', unit, error);
        }
      }
    }
  };

  const toggleTopic = async (topicId: string) => {
    // Only allow one topic to be expanded at a time
    if (expandedTopics.has(topicId)) {
      // If clicking the same topic, collapse it
      setExpandedTopics(new Set());
    } else {
      // If clicking a different topic, expand only that one
      setExpandedTopics(new Set([topicId]));
      
      // Check if content for this topic is already loaded
      const hasContentForTopic = content.some(item => item.topicid === topicId) || isTopicLoaded(topicId);
      
      if (!hasContentForTopic) {
        // Set loading state for this topic
        setLoadingTopics(prev => new Set([...prev, topicId]));
        
        // Fetch content for this specific topic
        try {
          console.log('Fetching content for topic:', topicId);
          const url = `/api/admin/content/paginated?topicIds=${topicId}&limit=50`;
          console.log('Fetching from URL:', url);
          
          const contentResponse = await fetch(url);
          
          if (!contentResponse.ok) {
            const errorText = await contentResponse.text();
            console.error('API Error:', contentResponse.status, errorText);
            throw new Error(`Failed to fetch topic content: ${contentResponse.status}`);
          }
          
          const contentData = await contentResponse.json();
          console.log('Received content for topic:', topicId, contentData);
          
          // Add the new content to existing content
          if (contentData.content && contentData.content.length > 0) {
            console.log('Adding', contentData.content.length, 'content items to state');
            addContent(contentData.content);
            markTopicAsLoaded(topicId);
          } else {
            console.log('No content returned for topic:', topicId);
            markTopicAsLoaded(topicId); // Mark as loaded even if empty
          }
        } catch (error) {
          console.error('Error fetching content for topic:', topicId, error);
          
          // Fallback: try to get content from the original API
          try {
            console.log('Trying fallback API for topic:', topicId);
            const fallbackResponse = await fetch('/api/admin/content');
            
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              const topicContent = fallbackData.filter((item: any) => item.topicid === topicId);
              
              if (topicContent.length > 0) {
                console.log('Fallback: Adding', topicContent.length, 'content items');
                addContent(topicContent);
              }
              markTopicAsLoaded(topicId);
            }
          } catch (fallbackError) {
            console.error('Fallback API also failed:', fallbackError);
          }
        } finally {
          // Remove loading state for this topic
          setLoadingTopics(prev => {
            const newSet = new Set(prev);
            newSet.delete(topicId);
            return newSet;
          });
        }
      }
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
    <div className="box-border flex relative w-full max-w-[1440px] min-h-[600px] bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 border-4 border-rainbow rounded-2xl mx-auto mt-0 shadow-xl overflow-hidden">
      {/* Sidebar for units */}
      <div className="w-48 border-r-4 border-yellow-300 bg-gradient-to-b from-yellow-100 to-orange-100">
        <div className="p-4">
          {/* Program Switcher */}
          <div className="flex gap-1 mb-4">
            <Button
              variant={programFilter === 'Grapeseed' ? 'default' : 'outline'}
              onClick={() => onProgramChange?.('Grapeseed')}
              className={`flex-1 text-xs font-bold rounded-full transition-all duration-300 ${
                programFilter === 'Grapeseed' 
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg transform scale-105' 
                  : 'bg-white border-2 border-green-300 text-green-600 hover:bg-green-50'
              }`}
              size="sm"
            >
              🍇 GS
            </Button>
            <Button
              variant={programFilter === 'TATH' ? 'default' : 'outline'}
              onClick={() => onProgramChange?.('TATH')}
              className={`flex-1 text-xs font-bold rounded-full transition-all duration-300 ${
                programFilter === 'TATH' 
                  ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg transform scale-105' 
                  : 'bg-white border-2 border-blue-300 text-blue-600 hover:bg-blue-50'
              }`}
              size="sm"
            >
              🎯 TATH
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {unitGroups.map((unitGroup, index) => {
              const isSelected = expandedUnits.has(unitGroup.unit);
              const colors = ['bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200'];
              const selectedColors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
              const colorIndex = index % colors.length;
              
              // Extract unit number from unit name (e.g., "Unit 1" -> "U1")
              const unitNumber = unitGroup.unit.replace(/Unit\s*/i, 'U');
              
              return (
                <div
                  key={unitGroup.unit}
                  className={`flex items-center justify-between py-2 px-1 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    isSelected 
                      ? `${selectedColors[colorIndex]} text-white shadow-lg border-2 border-white` 
                      : `${colors[colorIndex]} text-gray-800 hover:shadow-md border-2 border-transparent`
                  }`}
                  onClick={() => toggleUnit(unitGroup.unit)}
                >
                  <span className="font-bold truncate text-xs">
                    {unitNumber}
                  </span>
                  <div className="flex items-center gap-1">
                    {unitGroup.topics.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 text-white hover:text-yellow-200 hover:bg-white/20 rounded-full h-4 w-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUnitForGame(unitGroup);
                          setSelectedTopicIds(new Set());
                          setSelectedContentIds(new Set());
                          setIsUnitSelectionOpen(true);
                        }}
                      >
                        <Play className="h-2 w-2" />
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
      <div className="flex-1 p-6 bg-gradient-to-br from-white to-blue-50">
        {expandedUnits.size === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4 animate-bounce">📖</div>
            <h3 className="text-2xl font-bold mb-4 text-purple-700">Let's Start Learning!</h3>
            <p className="text-lg text-blue-600 bg-white px-6 py-3 rounded-full shadow-lg">
              🎯 Pick a colorful unit from the sidebar to begin your adventure!
            </p>
          </div>
        ) : (
          unitGroups.map((unitGroup) => {
            const isExpanded = expandedUnits.has(unitGroup.unit);
            
            if (!isExpanded) return null;
            
            return (
              <div key={`${unitGroup.unit}-content`} className="w-full">
                <div className="space-y-4">
                  {/* Compact Lesson Buttons */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {unitGroup.topics.map((topic, index) => {
                      const topicContent = getContentForTopic(topic);
                      const questionCounts = topicContent.map(content => Number(content.question_count) || 0).filter(count => count > 0);
                      const totalQuestions = questionCounts.reduce((sum, count) => sum + count, 0);
                      const isExpanded = expandedTopics.has(topic.id);
                      const lessonNumber = index + 1;
                      const buttonColors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
                      const hoverColors = ['hover:bg-red-500', 'hover:bg-blue-500', 'hover:bg-green-500', 'hover:bg-yellow-500', 'hover:bg-purple-500', 'hover:bg-pink-500'];
                      const colorIndex = index % buttonColors.length;
                      
                      return (
                        <div key={topic.id} className="relative">
                          {/* Smaller Lesson Button */}
                          <button
                            className={`flex items-center justify-center w-12 h-12 rounded-full border-2 border-white transition-all duration-300 cursor-pointer text-xs font-bold relative transform hover:scale-105 shadow-md ${
                              isExpanded 
                                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105' 
                                : `${buttonColors[colorIndex]} ${hoverColors[colorIndex]} text-white`
                            }`}
                            onClick={() => toggleTopic(topic.id)}
                            title={topic.topic || 'Untitled Topic'}
                          >
                            L{lessonNumber}
                            
                            {/* Smaller Play Button */}
                            {totalQuestions > 0 && (
                              <div
                                className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const topicContent = getContentForTopic(topic);
                                  if (topicContent.length > 0) {
                                    setSelectedTopicForGame(topic);
                                    setSelectedContentIds(new Set());
                                    setIsContentSelectionOpen(true);
                                  } else {
                                    router.push(`/setup?topicId=${topic.id}`);
                                  }
                                }}
                                title="🎮 Start Game!"
                              >
                                <Play className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Content Display Area */}
                  {Array.from(expandedTopics).map(topicId => {
                    const topic = unitGroup.topics.find(t => t.id === topicId);
                    if (!topic) return null;
                    
                    const topicContent = getContentForTopic(topic);
                    const lessonNumber = unitGroup.topics.findIndex(t => t.id === topicId) + 1;
                    
                    return (
                      <div key={`content-${topicId}`} className="bg-gradient-to-r from-pink-100 to-purple-100 border-4 border-pink-300 rounded-2xl p-6 shadow-lg">
                        
                        {loadingTopics.has(topicId) ? (
                          <div className="flex flex-col items-center justify-center py-8 bg-white rounded-2xl border-4 border-dashed border-blue-300">
                            <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
                            <p className="text-lg font-semibold text-blue-600">Loading activities...</p>
                            <p className="text-sm text-blue-500">Please wait while we fetch the content!</p>
                          </div>
                        ) : topicContent.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {topicContent.map((content, index) => {
                              const cardColors = ['from-red-200 to-red-300', 'from-blue-200 to-blue-300', 'from-green-200 to-green-300', 'from-yellow-200 to-yellow-300', 'from-purple-200 to-purple-300', 'from-pink-200 to-pink-300'];
                              const borderColors = ['border-red-400', 'border-blue-400', 'border-green-400', 'border-yellow-400', 'border-purple-400', 'border-pink-400'];
                              const colorIndex = index % cardColors.length;
                              
                              return (
                                <Card 
                                  key={content.id} 
                                  className={`hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br ${cardColors[colorIndex]} ${borderColors[colorIndex]} border-4 rounded-2xl cursor-pointer overflow-hidden`}
                                  onClick={() => handleViewContent(content.id)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3 flex-grow min-w-0">
                                        <div className="flex items-center justify-center w-8 h-8 text-sm font-bold border-2 border-white rounded-full bg-white text-gray-700 shadow-md flex-shrink-0">
                                          {index + 1}
                                        </div>
                                        <h5 className="font-bold text-sm text-gray-800 leading-tight">{content.title}</h5>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-10 w-10 p-0 bg-white hover:bg-yellow-100 text-purple-600 hover:text-purple-700 rounded-full shadow-md flex-shrink-0 transition-all duration-300"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          router.push(`/setup?contentId=${content.id}`);
                                        }}
                                      >
                                        <Play className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-white rounded-2xl border-4 border-dashed border-gray-300">
                            <div className="text-4xl mb-2">🎭</div>
                            <p className="text-lg font-semibold text-gray-600">No activities yet!</p>
                            <p className="text-sm text-gray-500">Check back soon for fun learning content!</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                  const topicContent = getContentForTopic(selectedTopicForGame);
                  const allContentIds = topicContent.map(content => content.id).join(',');
                  if (allContentIds) {
                    router.push(`/setup?contentIds=${allContentIds}&topicId=${selectedTopicForGame.id}`);
                  } else {
                    router.push(`/setup?topicId=${selectedTopicForGame.id}`);
                  }
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
                  // Collect all content IDs from all topics in the unit
                  const allContentIds = selectedUnitForGame.topics
                    .flatMap(topic => getContentForTopic(topic))
                    .map(content => content.id)
                    .join(',');
                  
                  if (allContentIds) {
                    router.push(`/setup?contentIds=${allContentIds}&unit=${encodeURIComponent(selectedUnitForGame.unit)}`);
                  } else {
                    // Fallback to topic IDs if no content found
                    const allTopicIds = selectedUnitForGame.topics.map(t => t.id).join(',');
                    router.push(`/setup?topicIds=${allTopicIds}&unit=${encodeURIComponent(selectedUnitForGame.unit)}`);
                  }
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
