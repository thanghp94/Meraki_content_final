
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';

interface ImportQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string, delimiter: string) => void;
}

export default function ImportQuestionsModal({ isOpen, onClose, onImport }: ImportQuestionsModalProps) {
  const [text, setText] = useState('');
  const [delimiterType, setDelimiterType] = useState('comma');
  const [customDelimiter, setCustomDelimiter] = useState('');

  const handleImportClick = () => {
    let finalDelimiter = '';
    switch (delimiterType) {
      case 'comma':
        finalDelimiter = ',';
        break;
      case 'tab':
        finalDelimiter = '\t';
        break;
      case 'semicolon':
        finalDelimiter = ';';
        break;
      case 'custom':
        finalDelimiter = customDelimiter;
        break;
    }
    if (delimiterType === 'custom' && !customDelimiter.trim()) {
        // Consider using toast for errors too for consistency
        alert("Please enter a custom delimiter."); 
        return;
    }
    onImport(text, finalDelimiter);
    onClose(); // Close modal after import attempt
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Import Questions</DialogTitle>
          <DialogDescription>
            Paste questions from text files, spreadsheets, or other documents. Use one line per question.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <Textarea
            placeholder="Question1,Answer1,Points1 (optional),ImageURL1 (optional)\nQuestion2,Answer2,Points2 (optional)\nQuestion3,Answer3"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[150px] text-sm"
          />
          <div>
            <Label className="text-base font-semibold mb-2 block">Delimiter between question, answer, points, and image URL:</Label>
            <RadioGroup value={delimiterType} onValueChange={setDelimiterType} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="comma" id="comma" />
                <Label htmlFor="comma" className="font-normal">Comma</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tab" id="tab" />
                <Label htmlFor="tab" className="font-normal">Tab (often used when copying from Excel/Sheets)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="semicolon" id="semicolon" />
                <Label htmlFor="semicolon" className="font-normal">Semicolon</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="font-normal">Custom</Label>
                {delimiterType === 'custom' && (
                  <Input
                    type="text"
                    value={customDelimiter}
                    onChange={(e) => setCustomDelimiter(e.target.value)}
                    className="ml-2 h-8 w-20"
                    maxLength={5}
                  />
                )}
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-base font-semibold mb-1 block">Tips for formatting:</Label>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Each line should represent one question.</li>
              <li>Format: `Question Text DELIMITER Answer Text DELIMITER Points (optional) DELIMITER Image URL (optional)`</li>
              <li>If `Points` is omitted or invalid, a default value (e.g., 10) will be used.</li>
              <li>If `Image URL` is omitted, no image will be associated with the question.</li>
              <li>If your question, answer, or URL contains the delimiter character, surround that part with double quotes (e.g., `"Question, with comma","Answer",10`).</li>
              <li>No column headers needed in your pasted text.</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleImportClick} className="bg-primary hover:bg-primary/90">
            <Upload className="mr-2 h-4 w-4" /> Import questions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
