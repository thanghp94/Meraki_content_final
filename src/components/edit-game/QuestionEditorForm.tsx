
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea'; // Assuming you might want textarea for Q/A
import { Card, CardContent } from '@/components/ui/card';
import { FileUp, ImageIcon, Save, X } from 'lucide-react';
import { useState } from 'react';

interface QuestionEditorFormProps {
  onSave: () => void;
  onClose: () => void;
  questionsSavedCount: number;
}

const pointsOptions = [5, 10, 15, 20, 25, 30, 50, 100];
const imageOptions = [
  { value: 'none', label: 'No Image' },
  { value: 'question_image', label: 'Question with Image' },
  { value: 'answer_image', label: 'Answer with Image' },
];

export default function QuestionEditorForm({ onSave, onClose, questionsSavedCount }: QuestionEditorFormProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [points, setPoints] = useState('15');
  const [imageOption, setImageOption] = useState('none');
  const [imageUrl, setImageUrl] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add validation if needed
    console.log({ question, answer, points, imageOption, imageUrl });
    onSave(); 
    // Optionally clear form here or handle state for adding multiple questions
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
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="mt-1 text-base min-h-[100px]"
                />
              </div>
              <div>
                <Label htmlFor="points" className="text-base font-semibold">Points</Label>
                <Select value={points} onValueChange={setPoints}>
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
                <Select value={imageOption} onValueChange={setImageOption}>
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
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="mt-1 text-base min-h-[100px]"
                />
              </div>
              {(imageOption === 'question_image' || imageOption === 'answer_image') && (
                <div>
                  <Label className="text-base font-semibold">Image/GIF</Label>
                  <p className="text-xs text-muted-foreground mb-2">Browse gifs, upload image or paste URL (0.25MB max)</p>
                  <div className="flex flex-col sm:flex-row gap-2 mb-2">
                    <Button 
                      type="button" 
                      variant="default" 
                      className="bg-[hsl(var(--current-team-highlight-background))] hover:bg-[hsl(var(--current-team-highlight-background),0.9)] text-[hsl(var(--current-team-highlight-foreground))] flex-1"
                      onClick={() => alert("Image Library TBI")}
                    >
                      <ImageIcon className="mr-2" /> Image Library
                    </Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={() => alert("Choose File TBI")}>
                      <FileUp className="mr-2" /> Choose File
                    </Button>
                  </div>
                  <Input
                    type="url"
                    placeholder="http://example.com/image.jpeg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="text-base"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-start gap-3 pt-4 border-t mt-8">
            <Button 
              type="submit" 
              className="text-base bg-[hsl(var(--library-action-button-background))] hover:bg-[hsl(var(--library-action-button-background),0.9)] text-[hsl(var(--library-action-button-foreground))]"
            >
              <Save className="mr-2 h-4 w-4" /> Save {questionsSavedCount}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="text-base">
              <X className="mr-2 h-4 w-4" /> Close
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
