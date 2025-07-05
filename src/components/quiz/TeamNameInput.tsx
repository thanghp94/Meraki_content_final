'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// 20 cute team names suitable for children
const CUTE_TEAM_NAMES = [
  'Rainbow Stars', 'Happy Pandas', 'Sunny Butterflies', 'Magic Unicorns',
  'Brave Lions', 'Smart Owls', 'Friendly Dolphins', 'Giggling Penguins',
  'Dancing Bears', 'Flying Eagles', 'Bouncing Bunnies', 'Shining Diamonds',
  'Cheerful Monkeys', 'Colorful Parrots', 'Playful Puppies', 'Smiling Suns',
  'Twinkling Stars', 'Jumping Frogs', 'Swimming Fish', 'Running Horses'
];

interface TeamNameInputProps {
  teamNumber: number;
  value: string;
  onChange: (name: string) => void;
  topicForSuggestion: string;
}

export default function TeamNameInput({ teamNumber, value, onChange }: TeamNameInputProps) {
  const { toast } = useToast();

  const handleRandomCuteName = () => {
    const randomIndex = Math.floor(Math.random() * CUTE_TEAM_NAMES.length);
    const randomName = CUTE_TEAM_NAMES[randomIndex];
    onChange(randomName);
    toast({ title: "Cute name applied!", description: `Random name: ${randomName}`});
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`teamName${teamNumber}`}>Team {teamNumber} Name (Optional)</Label>
      <div className="flex items-center space-x-2">
        <Input
          id={`teamName${teamNumber}`}
          type="text"
          placeholder={`Enter name for Team ${teamNumber}`}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRandomCuteName}
          title="Get a random cute team name"
        >
          <Shuffle className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Cute</span>
        </Button>
      </div>
    </div>
  );
}
