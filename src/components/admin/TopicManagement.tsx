'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Sparkles, Eye, EyeOff, ChevronUp, ChevronDown, ChevronRight, ChevronDown as ChevronDownIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ContentGeneratorModal } from './ContentGeneratorModal';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Topic {
  id: string;
  topic: string;
  short_summary: string;
  unit: string;
}

interface Content {
  id: string;
  title: string;
  infor1: string;
  infor2: string;
  topicid: string;
  visible?: boolean;
}

export function TopicManagement() {
  const { toast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [content, setContent] = useState<{ [topicId: string]: Content[] }>({});
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [isContentGeneratorOpen, setIsContentGeneratorOpen] = useState(false);
  const [selectedTopicForAI, setSelectedTopicForAI] = useState<{ id: string; name: string; summary: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
    fetchContent();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/admin/topics');
      if (response.ok) {
        const data = await response.json();
        setTopics(data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/admin/content');
      if (response.ok) {
        const data = await response.json();
        // Group content by topic ID
        const groupedContent: { [topicId: string]: Content[] } = {};
        data.forEach((item: Content) => {
          if (!groupedContent[item.topicid]) {
            groupedContent[item.topicid] = [];
          }
          groupedContent[item.topicid].push(item);
        });
        setContent(groupedContent);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpanded = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const handleToggleContentVisibility = async (contentId: string, topicId: string) => {
    try {
      const contentItem = content[topicId]?.find(c => c.id === contentId);
      if (!contentItem) return;

      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contentItem,
          visible: !contentItem.visible,
        }),
      });

      if (response.ok) {
        setContent(prev => ({
          ...prev,
          [topicId]: prev[topicId]?.map(c => 
            c.id === contentId ? { ...c, visible: !c.visible } : c
          ) || []
        }));
        
        toast({
          title: 'Content Updated',
          description: `Content ${contentItem.visible ? 'hidden' : 'shown'} successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update content visibility.',
        variant: 'destructive',
      });
    }
  };

  const handleMoveContentUp = async (contentId: string, topicId: string) => {
    toast({
      title: 'Move Up',
      description: 'Content reordering functionality to be implemented.',
    });
  };

  const handleMoveContentDown = async (contentId: string, topicId: string) => {
    toast({
      title: 'Move Down',
      description: 'Content reordering functionality to be implemented.',
    });
  };

  const handleContentGenerated = () => {
    fetchContent();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  // Group topics by unit
  const topicsByUnit = topics.reduce((acc, topic) => {
    if (!acc[topic.unit]) {
      acc[topic.unit] = [];
    }
    acc[topic.unit].push(topic);
    return acc;
  }, {} as { [unit: string]: Topic[] });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Topic Management</h2>
          <p className="text-muted-foreground">Manage topics, content, and questions in a hierarchical structure</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Topic
        </Button>
      </div>

      {Object.entries(topicsByUnit).map(([unit, unitTopics]) => (
        <Card key={unit} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-blue-600 font-medium">📚</span>
                </div>
                <div>
                  <CardTitle className="text-lg">{unit}</CardTitle>
                </div>
              </div>
              <Badge variant="secondary">{unitTopics.length} topics</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {unitTopics.map((topic) => {
                const topicContent = content[topic.id] || [];
                const isExpanded = expandedTopics.has(topic.id);
                
                return (
                  <Collapsible key={topic.id} open={isExpanded} onOpenChange={() => handleToggleExpanded(topic.id)}>
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <CollapsibleTrigger className="flex items-center justify-between cursor-pointer w-full">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">🟢</span>
                            {isExpanded ? (
                              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{topic.topic}</h4>
                            <p className="text-sm text-gray-600">{topic.short_summary}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{topicContent.length} content items</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add content functionality
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Content
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTopicForAI({ 
                                id: topic.id, 
                                name: topic.topic, 
                                summary: topic.short_summary 
                              });
                              setIsContentGeneratorOpen(true);
                            }}
                            className="text-purple-600 border-purple-200"
                          >
                            <Sparkles className="h-4 w-4 mr-1" />
                            AI Generate
                          </Button>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="mt-3">
                        {topicContent.length > 0 ? (
                          <div className="space-y-2 pl-6">
                            {topicContent.map((contentItem, index) => (
                              <div key={contentItem.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm">{contentItem.title}</h5>
                                  <p className="text-xs text-gray-500 truncate">{contentItem.infor2}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleContentVisibility(contentItem.id, topic.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    {contentItem.visible !== false ? (
                                      <Eye className="h-4 w-4" />
                                    ) : (
                                      <EyeOff className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMoveContentUp(contentItem.id, topic.id)}
                                    disabled={index === 0}
                                    className="h-8 w-8 p-0"
                                  >
                                    <ChevronUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMoveContentDown(contentItem.id, topic.id)}
                                    disabled={index === topicContent.length - 1}
                                    className="h-8 w-8 p-0"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="pl-6 text-sm text-gray-500">
                            No content items yet. Add some content to get started.
                          </div>
                        )}
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

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
          onContentGenerated={handleContentGenerated}
        />
      )}
    </div>
  );
}
