'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lightbulb, Loader2 } from 'lucide-react';
import { suggestTeamNames as suggestTeamNamesAI } from '@/ai/flows/suggest-team-names';
import { useToast } from '@/hooks/use-toast';

interface TeamNameInputProps {
  teamNumber: number;
  value: string;
  onChange: (name: string) => void;
  topicForSuggestion: string;
}

export default function TeamNameInput({ teamNumber, value, onChange, topicForSuggestion }: TeamNameInputProps) {
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const { toast } = useToast();

  const handleSuggestName = async () => {
    setIsLoadingSuggestion(true);
    try {
      const result = await suggestTeamNamesAI({ topic: topicForSuggestion, numberOfTeams: 1 });
      if (result.teamNames && result.teamNames.length > 0) {
        onChange(result.teamNames[0]);
        toast({ title: "Suggestion applied!", description: `Suggested name: ${result.teamNames[0]}`});
      } else {
        toast({ title: "No suggestions", description: "AI couldn't find a name, please try again or enter manually.", variant: "default" });
      }
    } catch (error) {
      console.error("Failed to suggest team name:", error);
      toast({ title: "Suggestion Error", description: "Could not fetch team name suggestion.", variant: "destructive" });
    } finally {
      setIsLoadingSuggestion(false);
    }
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
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleSuggestName}
          disabled={isLoadingSuggestion}
          title="Suggest a team name using AI"
        >
          {isLoadingSuggestion ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">Suggest</span>
        </Button>
      </div>
    </div>
  );
}
