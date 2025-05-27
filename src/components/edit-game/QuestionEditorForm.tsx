
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea'; 
import { Card, CardContent } from '@/components/ui/card';
import { FileUp, ImageIcon, Loader2, Save, X } from 'lucide-react'; 
import { useState } from 'react';
import type { Question } from '@/types/quiz'; 
import { addQuestionToGameInFirestore } from '@/lib/firebaseService'; 
import { useToast } from '@/hooks/use-toast';

interface QuestionEditorFormProps {
  gameId: string; 
  onSaveSuccess: () => void; 
  onClose: () => void;
  questionsSavedCount: number; 
}

const pointsOptions = [5, 10, 15, 20, 25, 30, 50, 100];
const imageOptions = [
  { value: 'none', label: 'No Image' },
  { value: 'question_image', label: 'Question with Image' },
];

export default function QuestionEditorForm({ gameId, onSaveSuccess, onClose, questionsSavedCount }: QuestionEditorFormProps) {
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [points, setPoints] = useState('10'); // Default points
  const [imageOption, setImageOption] = useState('none');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const clearForm = () => {
    setQuestionText('');
    setAnswerText('');
    setPoints('10');
    setImageOption('none');
    setImageUrl('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !answerText.trim()) {
      toast({ title: "Missing Fields", description: "Please fill in both question and answer.", variant: "destructive" });
      return;
    }
    if (!gameId) {
      toast({ title: "Error", description: "Game ID is missing. Cannot save question.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    // We don't include id, createdAt, updatedAt here, as Firestore/service handles them
    const questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'> = {
      questionText,
      answerText,
      points: parseInt(points, 10),
    };

    if (imageOption !== 'none' && imageUrl.trim()) {
      // Basic URL validation (can be enhanced)
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        toast({ title: "Invalid URL", description: "Image URL must start with http:// or https://", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      questionData.media = {
        url: imageUrl.trim(),
        type: 'image', 
        alt: questionText.substring(0, 50) || 'Question image', 
      };
    }

    try {
      await addQuestionToGameInFirestore(gameId, questionData);
      // Toast is handled by parent onSaveSuccess now
      onSaveSuccess(); 
      clearForm(); 
    } catch (error) {
      console.error("Failed to save question:", error);
      toast({ title: "Error Saving Question", description: (error as Error).message || "Could not save the question.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="question" className="text-base font-semibold">Question</Label>
                <Textarea
                  id="question"
                  placeholder="Enter the question text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="mt-1 text-base min-h-[100px]"
                  disabled={isLoading}
                  required
                />
              </div>
              <div>
                <Label htmlFor="points" className="text-base font-semibold">Points</Label>
                <Select value={points} onValueChange={setPoints} disabled={isLoading}>
                  <SelectTrigger id="points" className="mt-1 text-base">
                    <SelectValue placeholder="Select points" />
                  </SelectTrigger>
                  <SelectContent>
                    {pointsOptions.map(p => (
                      <SelectItem key={p} value={String(p)} className="text-base">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="imageOptions" className="text-base font-semibold">Image options</Label>
                <Select value={imageOption} onValueChange={setImageOption} disabled={isLoading}>
                  <SelectTrigger id="imageOptions" className="mt-1 text-base">
                    <SelectValue placeholder="Select image option" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-base">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="answer" className="text-base font-semibold">Answer</Label>
                <Textarea
                  id="answer"
                  placeholder="Enter the answer text"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  className="mt-1 text-base min-h-[100px]"
                  disabled={isLoading}
                  required
                />
              </div>
              {(imageOption === 'question_image') && ( 
                <div>
                  <Label className="text-base font-semibold">Image/GIF URL</Label>
                  <p className="text-xs text-muted-foreground mb-2">Paste URL. (e.g. https://placehold.co/600x400.png)</p>
                  <Input
                    type="url"
                    placeholder="http://example.com/image.jpeg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="text-base"
                    disabled={isLoading}
                  />
                   <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Button 
                      type="button" 
                      variant="default" 
                      className="bg-[hsl(var(--current-team-highlight-background))] hover:bg-[hsl(var(--current-team-highlight-background),0.9)] text-[hsl(var(--current-team-highlight-foreground))] flex-1"
                      onClick={() => alert("Image Library TBI")}
                      disabled={isLoading}
                    >
                      <ImageIcon className="mr-2" /> Image Library
                    </Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={() => alert("Choose File TBI")} disabled={isLoading}>
                      <FileUp className="mr-2" /> Choose File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-start gap-3 pt-4 border-t mt-8">
            <Button 
              type="submit" 
              className="text-base bg-[hsl(var(--library-action-button-background))] hover:bg-[hsl(var(--library-action-button-background),0.9)] text-[hsl(var(--library-action-button-foreground))]"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isLoading ? 'Saving...' : `Save Question`}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="text-base" disabled={isLoading}>
              <X className="mr-2 h-4 w-4" /> Close
            </Button>
             <span className="text-sm text-muted-foreground ml-auto">
              Total questions in game: {questionsSavedCount}
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
