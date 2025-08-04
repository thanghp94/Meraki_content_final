'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronRight, BookOpen, Image, Eye, Play, FileText } from 'lucide-react';
import ContentViewModal from '@/components/ui/content-view-modal-fixed';
import GameSetupModal from '@/components/library/GameSetupModal';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLibrary } from '@/contexts/LibraryContext';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
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
  const [isMounted, setIsMounted] = useState(false);
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
  const [isGameSetupModalOpen, setIsGameSetupModalOpen] = useState(false);
  const [isLoadingUnitQuestions, setIsLoadingUnitQuestions] = useState(false);
  const [gameSetupData, setGameSetupData] = useState<{
    contentIds?: string[];
    unit?: string;
    topicId?: string;
    topicName?: string;
    unitTopics?: Topic[];
  }>({});

  // Extract state from context
  const { unitGroups, content, expandedUnits, expandedTopics } = libraryState;
  
  // Track if we've already fetched data for this program to prevent infinite loops
  const lastFetchedProgram = useRef<string | null>(null);

  // Handle client-side mounting to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        lastFetchedProgram.current = programFilter || null;
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if programFilter is provided and we haven't already fetched for this program
    if (programFilter && lastFetchedProgram.current !== programFilter) {
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

  // Prevent hydration issues by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

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
                        disabled={isLoadingUnitQuestions}
                        onClick={async (e) => {
                          e.stopPropagation();
                          setIsLoadingUnitQuestions(true);
                          
                          // Show loading toast
                          toast({
                            title: "Loading Questions",
                            description: "Please wait while we load questions for all lessons...",
                          });
                          
                          try {
                            // Load questions for all topics in the unit
                            const topicsWithQuestions = await Promise.all(
                              unitGroup.topics.map(async (topic) => {
                                console.log(`Processing topic: ${topic.topic} (ID: ${topic.id})`);
                                let allQuestions: any[] = [];
                                
                                // First, get content for this topic (may need to load it)
                                let topicContent = getContentForTopic(topic);
                                console.log(`Topic ${topic.topic} has ${topicContent.length} content items from cache`);
                                
                                // If no content in cache, load it directly
                                if (topicContent.length === 0) {
                                  console.log(`Loading content for topic ${topic.id} directly`);
                                  try {
                                    const url = `/api/admin/content/paginated?topicIds=${topic.id}&limit=50`;
                                    const contentResponse = await fetch(url);
                                    
                                    if (contentResponse.ok) {
                                      const contentData = await contentResponse.json();
                                      if (contentData.content && contentData.content.length > 0) {
                                        console.log(`Found ${contentData.content.length} content items for topic ${topic.topic}`);
                                        topicContent = contentData.content;
                                      } else {
                                        console.log(`No content found for topic ${topic.topic}`);
                                      }
                                    }
                                  } catch (error) {
                                    console.error(`Error loading content for topic ${topic.id}:`, error);
                                  }
                                }
                                
                                // Now load questions from each content item
                                for (const contentItem of topicContent) {
                                  try {
                                    console.log(`Loading questions for content ${contentItem.id} (${contentItem.title})`);
                                    const response = await fetch(`/api/admin/content/${contentItem.id}`);
                                    if (response.ok) {
                                      const contentData = await response.json();
                                      console.log(`Content ${contentItem.id} response:`, contentData);
                                      if (contentData.questions && Array.isArray(contentData.questions)) {
                                        console.log(`Found ${contentData.questions.length} questions for content ${contentItem.id}`);
                                        allQuestions.push(...contentData.questions);
                                      } else {
                                        console.log(`No questions found for content ${contentItem.id}`);
                                      }
                                    } else {
                                      console.error(`Failed to fetch content ${contentItem.id}: ${response.status}`);
                                    }
                                  } catch (error) {
                                    console.error(`Error loading questions for content ${contentItem.id}:`, error);
                                  }
                                }
                                
                                console.log(`Topic ${topic.topic} loaded ${allQuestions.length} questions total`);
                                return {
                                  ...topic,
                                  questions: allQuestions
                                };
                              })
                            );
                            
                            console.log('All topics with questions:', topicsWithQuestions);
                            
                            // Calculate total questions
                            const totalQuestions = topicsWithQuestions.reduce((sum, topic) => 
                              sum + (topic.questions?.length || 0), 0
                            );
                            
                            // Show success toast
                            toast({
                              title: "Questions Loaded Successfully!",
                              description: `Found ${totalQuestions} questions across ${topicsWithQuestions.length} lessons.`,
                            });
                            
                            // Collect all content IDs from all topics in the unit
                            const allContentIds = unitGroup.topics
                              .flatMap(topic => getContentForTopic(topic))
                              .map(content => content.id);
                            
                            setGameSetupData({
                              contentIds: allContentIds,
                              unit: unitGroup.unit,
                              topicName: unitGroup.unit,
                              unitTopics: topicsWithQuestions // Pass the topics with loaded questions
                            });
                            // Only open modal after all questions are loaded
                            setIsGameSetupModalOpen(true);
                          } catch (error) {
                            console.error('Error loading unit questions:', error);
                          } finally {
                            setIsLoadingUnitQuestions(false);
                          }
                        }}
                      >
                        {isLoadingUnitQuestions ? (
                          <Loader2 className="h-2 w-2 animate-spin" />
                        ) : (
                          <Play className="h-2 w-2" />
                        )}
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
                            <div
                              className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md"
                              onClick={async (e) => {
                                e.stopPropagation();
                                
                                try {
                                  // First, get content for this topic (may need to load it)
                                  let topicContent = getContentForTopic(topic);
                                  
                                  // If no content in cache, load it directly
                                  if (topicContent.length === 0) {
                                    console.log(`Loading content for individual topic ${topic.id} directly`);
                                    const url = `/api/admin/content/paginated?topicIds=${topic.id}&limit=50`;
                                    const contentResponse = await fetch(url);
                                    
                                    if (contentResponse.ok) {
                                      const contentData = await contentResponse.json();
                                      if (contentData.content && contentData.content.length > 0) {
                                        console.log(`Found ${contentData.content.length} content items for individual topic ${topic.topic}`);
                                        topicContent = contentData.content;
                                      } else {
                                        console.log(`No content found for individual topic ${topic.topic}`);
                                        toast({
                                          title: "No Content Found",
                                          description: `No content available for ${topic.topic}`,
                                          variant: "destructive"
                                        });
                                        return;
                                      }
                                    } else {
                                      throw new Error(`Failed to load content for ${topic.topic}`);
                                    }
                                  }
                                  
                                  if (topicContent.length > 0) {
                                    setGameSetupData({
                                      contentIds: topicContent.map(content => content.id),
                                      topicId: topic.id,
                                      topicName: topic.topic
                                    });
                                    setIsGameSetupModalOpen(true);
                                  } else {
                                    toast({
                                      title: "No Content Available",
                                      description: `No content found for ${topic.topic}`,
                                      variant: "destructive"
                                    });
                                  }
                                } catch (error) {
                                  console.error(`Error loading content for individual topic ${topic.id}:`, error);
                                  toast({
                                    title: "Error Loading Content",
                                    description: `Failed to load content for ${topic.topic}`,
                                    variant: "destructive"
                                  });
                                }
                              }}
                              title="🎮 Start Game!"
                            >
                              <Play className="h-3 w-3 text-white" />
                            </div>
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
                                          setGameSetupData({
                                            contentIds: [content.id],
                                            topicName: content.title
                                          });
                                          setIsGameSetupModalOpen(true);
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
    </div>
  );
}
