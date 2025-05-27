
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
            Copy and paste from ChatGPT, Quizlet Export, Word, Excel, Google Docs, etc.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <Textarea
            placeholder="Question1,Answer1\nQuestion2,Answer2\nQuestion3,Answer3" // Corrected placeholder
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[150px] text-sm"
          />
          <div>
            <Label className="text-base font-semibold mb-2 block">Delimiter between question and answer:</Label>
            <RadioGroup value={delimiterType} onValueChange={setDelimiterType} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="comma" id="comma" />
                <Label htmlFor="comma" className="font-normal">Comma</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tab" id="tab" />
                <Label htmlFor="tab" className="font-normal">Tab</Label>
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
            <Label className="text-base font-semibold mb-1 block">Tips:</Label>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>No column headers.</li>
              <li>Each line maps to a question.</li>
              <li>If the delimiter is used in a question or answer, surround the item with double quotes: "My, question","My, answer".</li>
              <li>The first answer in the multiple choice question must be the correct answer.</li>
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
