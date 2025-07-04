'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  topicName: string;
  topicSummary: string;
  onContentGenerated: (content: any) => void;
}

export function ContentGeneratorModal({
  isOpen,
  onClose,
  topicId,
  topicName,
  topicSummary,
  onContentGenerated,
}: ContentGeneratorModalProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [formData, setFormData] = useState({
    contentType: 'lesson',
    targetAudience: 'high school students',
    length: 'medium',
    customPrompt: '',
  });

  const handleGenerate = async () => {
    if (useCustomPrompt && !formData.customPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a custom prompt or switch to guided mode.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicName,
          topicSummary,
          useCustomPrompt,
          customPrompt: formData.customPrompt,
          ...(!useCustomPrompt && {
            contentType: formData.contentType,
            targetAudience: formData.targetAudience,
            length: formData.length,
          }),
        }),
      });

      if (!response.ok) throw new Error('Failed to generate content');

      const generatedContent = await response.json();
      
      // Create content via API
      const createResponse = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedContent.title,
          infor1: generatedContent.content, // Markdown content
          infor2: generatedContent.summary,
          topicid: topicId,
          image1: '',
          video1: '',
        }),
      });

      if (!createResponse.ok) throw new Error('Failed to save content');

      toast({
        title: 'Content Generated',
        description: 'AI-generated content has been created successfully.',
      });

      onContentGenerated(generatedContent);
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      contentType: 'lesson',
      targetAudience: 'high school students',
      length: 'medium',
      customPrompt: '',
    });
    setUseCustomPrompt(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetForm();
      onClose();
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Generate AI Content for "{topicName}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
            <Switch
              id="custom-prompt-mode"
              checked={useCustomPrompt}
              onCheckedChange={setUseCustomPrompt}
            />
            <Label htmlFor="custom-prompt-mode" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Use Custom Prompt
            </Label>
            <span className="text-sm text-gray-500">
              {useCustomPrompt ? 'Write your own instructions' : 'Use guided generation'}
            </span>
          </div>

          <Tabs value={useCustomPrompt ? 'custom' : 'guided'} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="guided" onClick={() => setUseCustomPrompt(false)}>
                Guided Generation
              </TabsTrigger>
              <TabsTrigger value="custom" onClick={() => setUseCustomPrompt(true)}>
                Custom Prompt
              </TabsTrigger>
            </TabsList>

            <TabsContent value="guided" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select
                    value={formData.contentType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, contentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lesson">Lesson</SelectItem>
                      <SelectItem value="explanation">Explanation</SelectItem>
                      <SelectItem value="overview">Overview</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="length">Content Length</Label>
                  <Select
                    value={formData.length}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, length: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (1-2 paragraphs)</SelectItem>
                      <SelectItem value="medium">Medium (3-5 paragraphs)</SelectItem>
                      <SelectItem value="long">Long (6+ paragraphs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="e.g., high school students, college freshmen, professionals"
                />
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customPrompt">Custom Instructions</Label>
                <Textarea
                  id="customPrompt"
                  value={formData.customPrompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, customPrompt: e.target.value }))}
                  placeholder="Enter your custom instructions for generating content about this topic. Be specific about what you want the AI to create, the format, style, and any particular aspects to focus on.

Examples:
- Create a step-by-step tutorial with practical examples
- Write an engaging story that explains the concept
- Generate a comparison table with pros and cons
- Create a quiz-style content with questions and answers
- Write content suitable for visual learners with diagram descriptions"
                  rows={8}
                  className="resize-none"
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> The AI will automatically format your content in markdown. 
                  You can request specific formatting like headers, bullet points, tables, or code blocks.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Topic Context */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Topic Context</h4>
            <p className="text-sm text-gray-600">
              <strong>Topic:</strong> {topicName}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Summary:</strong> {topicSummary}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
