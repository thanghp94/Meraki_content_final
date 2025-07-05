'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Wand2, Image as ImageIcon, Check, X, Save, History, Lightbulb } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ImageSearchModal } from './ImageSearchModal';
import { useToast } from '@/hooks/use-toast';

interface GeneratedQuestion {
  questionText: string;
  questionType: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  imageSearchTerm?: string;
  suggestedImage?: string;
  selectedImage?: string;
  points: number;
}

interface QuizGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentTitle: string;
}

export function QuizGeneratorModal({ isOpen, onClose, contentId, contentTitle }: QuizGeneratorModalProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [settings, setSettings] = useState({
    questionCount: 5,
    difficulty: 'medium',
    questionTypes: ['multiple_choice', 'true_false'],
    customInstructions: '',
    gradeLevel: '',
  });

  const promptTemplates = [
    {
      id: 'practical',
      label: 'Focus on practical applications',
      text: 'Focus on practical, real-world applications of the concepts. Include examples that demonstrate how this knowledge is used in everyday situations.'
    },
    {
      id: 'examples',
      label: 'Include real-world examples',
      text: 'Include concrete, real-world examples in both questions and explanations to help students connect theory with practice.'
    },
    {
      id: 'critical',
      label: 'Test critical thinking',
      text: 'Emphasize critical thinking and problem-solving. Create questions that require analysis, evaluation, and application of concepts rather than mere recall.'
    },
    {
      id: 'grade',
      label: 'Adapt to grade level',
      text: 'Adjust language and complexity to be appropriate for the specified grade level while maintaining educational value.'
    }
  ];

  const [savedPrompts, setSavedPrompts] = useState(() => {
    const saved = localStorage.getItem('savedPrompts');
    return saved ? JSON.parse(saved) : [];
  });

  const savePrompt = (prompt: string) => {
    const newSavedPrompts = [...savedPrompts, {
      id: Date.now(),
      text: prompt,
      timestamp: new Date().toISOString()
    }];
    setSavedPrompts(newSavedPrompts);
    localStorage.setItem('savedPrompts', JSON.stringify(newSavedPrompts));
  };
  const [imageSearchOpen, setImageSearchOpen] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(-1);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          ...settings
        }),
      });

      if (!response.ok) throw new Error('Failed to generate questions');
      
      const data = await response.json();
      setGeneratedQuestions(data.questions);
      
      toast({
        title: 'Questions Generated!',
        description: `Successfully generated ${data.questions.length} questions.`,
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate questions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/ai/generate-quiz', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          questions: generatedQuestions
        }),
      });

      if (!response.ok) throw new Error('Failed to save questions');
      
      const data = await response.json();
      toast({
        title: 'Questions Saved!',
        description: `Successfully saved ${data.questions.length} questions.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save questions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (url: string) => {
    if (activeQuestionIndex >= 0) {
      setGeneratedQuestions(prev => prev.map((q, i) => 
        i === activeQuestionIndex ? { ...q, selectedImage: url } : q
      ));
    }
    setImageSearchOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Quiz Questions for: {contentTitle}</DialogTitle>
        </DialogHeader>

        {/* Generation Settings */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Number of Questions</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={settings.questionCount}
              onChange={e => setSettings(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
            />
          </div>
          <div>
            <Label>Difficulty</Label>
            <Select
              value={settings.difficulty}
              onValueChange={value => setSettings(prev => ({ ...prev, difficulty: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Grade Level (Optional)</Label>
            <Input
              placeholder="e.g., Grade 5, High School"
              value={settings.gradeLevel}
              onChange={e => setSettings(prev => ({ ...prev, gradeLevel: e.target.value }))}
            />
          </div>
        </div>

        {/* Question Types */}
        <div className="mb-4">
          <Label>Question Types</Label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {['multiple_choice', 'true_false', 'short_answer', 'fill_blank'].map(type => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  checked={settings.questionTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    setSettings(prev => ({
                      ...prev,
                      questionTypes: checked
                        ? [...prev.questionTypes, type]
                        : prev.questionTypes.filter(t => t !== type)
                    }));
                  }}
                />
                <Label className="text-sm">{type.replace('_', ' ').toUpperCase()}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Instructions Section */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <Label>Custom Instructions</Label>
          </div>
          
          {/* Prompt Templates */}
          <div className="grid grid-cols-2 gap-2">
            {promptTemplates.map(template => (
              <Button
                key={template.id}
                variant="outline"
                size="sm"
                onClick={() => setSettings(prev => ({ 
                  ...prev, 
                  customInstructions: prev.customInstructions + (prev.customInstructions ? '\n\n' : '') + template.text 
                }))}
              >
                {template.label}
              </Button>
            ))}
          </div>

          {/* Custom Instructions Textarea */}
          <Textarea
            placeholder="Add specific instructions for question generation (e.g., focus on practical applications, include real-world examples, test critical thinking skills...)"
            value={settings.customInstructions}
            onChange={e => setSettings(prev => ({ ...prev, customInstructions: e.target.value }))}
            rows={4}
          />

          {/* Saved Prompts */}
          {savedPrompts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <Label className="text-sm">Saved Prompts</Label>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {savedPrompts.map((prompt: any) => (
                  <div key={prompt.id} className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-left justify-start h-auto p-2 text-xs"
                      onClick={() => setSettings(prev => ({ ...prev, customInstructions: prompt.text }))}
                    >
                      {prompt.text.substring(0, 60)}...
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Current Prompt */}
          {settings.customInstructions && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                savePrompt(settings.customInstructions);
                toast({
                  title: 'Prompt Saved',
                  description: 'Your custom instructions have been saved for future use.',
                });
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Current Instructions
            </Button>
          )}
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || settings.questionTypes.length === 0}
          className="w-full mb-4"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Questions
            </>
          )}
        </Button>

        {/* Generated Questions */}
        {generatedQuestions.length > 0 && (
          <div className="space-y-4">
            {generatedQuestions.map((question, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">Question {index + 1}</h3>
                    <p>{question.questionText}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveQuestionIndex(index);
                      setImageSearchOpen(true);
                    }}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Question Details */}
                {question.options && (
                  <div className="grid grid-cols-2 gap-2">
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex}
                        className={`p-2 rounded ${
                          option === question.correctAnswer 
                            ? 'bg-green-100 border-green-500' 
                            : 'bg-gray-50'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Image Preview */}
                {question.selectedImage && (
                  <div className="relative group">
                    <img
                      src={question.selectedImage}
                      alt="Question visual"
                      className="h-32 object-cover rounded"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                      onClick={() => {
                        setGeneratedQuestions(prev => prev.map((q, i) => 
                          i === index ? { ...q, selectedImage: undefined } : q
                        ));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <p><strong>Type:</strong> {question.questionType}</p>
                  <p><strong>Difficulty:</strong> {question.difficulty}</p>
                  <p><strong>Explanation:</strong> {question.explanation}</p>
                </div>
              </div>
            ))}

            {/* Save Button */}
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Questions...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Questions
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>

      {/* Image Search Modal */}
      <ImageSearchModal
        isOpen={imageSearchOpen}
        onClose={() => setImageSearchOpen(false)}
        onSelect={handleImageSelect}
      />
    </Dialog>
  );
}
