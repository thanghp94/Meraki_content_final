
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Camera, FileUp, Globe, Image as ImageIcon, Lock, Save, Users, X, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
// Remove database service import since we'll use API endpoints
import type { GameStub } from '@/types/library';


// Mock languages for the dropdown
const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
];

export default function MakeGameForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('en');
  const [tags, setTags] = useState(''); // Still a string, could be parsed later
  const [visibility, setVisibility] = useState('unlisted');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiHint, setAiHint] = useState(''); // For placeholder images
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);

  // Handle URL parameters for pre-selected content
  useEffect(() => {
    const contentId = searchParams.get('contentId');
    const contentName = searchParams.get('contentName');
    
    if (contentId && contentName) {
      setSelectedContentId(contentId);
      setTitle(contentName);
      setDescription(`Game based on ${contentName} content`);
      setAiHint(contentName.split(' ').slice(0, 2).join(' '));
      toast({
        title: 'Content Selected',
        description: `Creating game with questions from "${contentName}"`,
      });
    }
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: 'Title Required', description: 'Please enter a title for your game.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    // Prepare game data for Firestore
    // Omit 'id', 'type', 'createdAt', 'updatedAt', 'questionCount', 'playCount' as Firestore/service will handle them
    const gameDataForFirestore: Omit<GameStub, 'id' | 'type' | 'createdAt' | 'updatedAt' | 'questionCount' | 'playCount'> & { language: string; tags: string; visibility: string; imageUrl?: string, aiHint?: string } = {
      name: title,
      subtitle: description, // Using description as subtitle, adjust if needed
      thumbnailUrl: imageUrl, // This will be overridden by service if empty, to use placeholder
      language,
      tags, // Consider storing tags as an array in Firestore later
      visibility, // You might want to map this to boolean flags if needed
      imageUrl: imageUrl || undefined, // Pass to service
      aiHint: aiHint || title.split(' ').slice(0,2).join(' ') || undefined, // Simple AI hint from title
    };

    try {
      // First create the game
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...gameDataForFirestore,
          contentId: selectedContentId // Include the content ID if selected
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create game');
      }
      
      const result = await response.json();
      const gameId = result.id;

      // If content was selected, import its questions
      if (selectedContentId) {
        const questionsResponse = await fetch(`/api/games/${gameId}/questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contentId: selectedContentId
          }),
        });

        if (!questionsResponse.ok) {
          throw new Error('Failed to import questions');
        }

        toast({ 
          title: 'Game Created!', 
          description: `"${title}" has been created with questions from the selected content.` 
        });
      } else {
        toast({ 
          title: 'Game Created!', 
          description: `"${title}" has been created. Now add some questions.` 
        });
      }

      router.push(`/edit-game/${gameId}?name=${encodeURIComponent(title)}`);
    } catch (error) {
      console.error("Failed to create game:", error);
      toast({ title: 'Error Creating Game', description: (error as Error).message || 'Could not save the game to the database.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/library');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
          <TabsTrigger value="manual" className="py-3 text-base rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">Manual</TabsTrigger>
          <TabsTrigger value="url" className="py-3 text-base rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">URL</TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-base font-semibold">Title</Label>
                <Input
                  id="title"
                  placeholder="What's it called?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 text-base"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-base font-semibold">Description (Subtitle)</Label>
                <Textarea
                  id="description"
                  placeholder="A brief description or subtitle"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 text-base min-h-[100px]"
                />
              </div>
              <div>
                <Label htmlFor="language" className="text-base font-semibold">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language" className="mt-1 text-base">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.value} value={lang.value} className="text-base">
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tags" className="text-base font-semibold">Tags</Label>
                <Input
                  id="tags"
                  placeholder="e.g. vocabulary, math, history"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="mt-1 text-base"
                />
                <p className="text-xs text-muted-foreground mt-1">Use commas to add multiple tags</p>
              </div>
               <div>
                <Label htmlFor="aiHint" className="text-base font-semibold">AI Image Hint (Optional)</Label>
                <Input
                  id="aiHint"
                  placeholder="e.g. science lab, historical map"
                  value={aiHint}
                  onChange={(e) => setAiHint(e.target.value)}
                  className="mt-1 text-base"
                />
                <p className="text-xs text-muted-foreground mt-1">Keywords for placeholder image generation (1-2 words).</p>
              </div>
            </div>

            {/* Right Column - Image and Visibility */}
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold">Game Image/GIF URL (Optional)</Label>
                <p className="text-xs text-muted-foreground mb-2">Paste URL for game image. If empty, a placeholder will be used.</p>
                <Input
                  type="url"
                  id="imageUrl"
                  placeholder="http://example.com/image.jpeg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="text-base mt-1"
                />
                 <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Button type="button" variant="default" className="bg-[hsl(var(--current-team-highlight-background))] hover:bg-[hsl(var(--current-team-highlight-background),0.9)] text-[hsl(var(--current-team-highlight-foreground))] flex-1" onClick={() => alert("Image Library TBI")}>
                    <ImageIcon className="mr-2" /> Image Library
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => alert("Choose File TBI")}>
                    <FileUp className="mr-2" /> Choose File
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-2 block">Visibility</Label>
                <RadioGroup value={visibility} onValueChange={setVisibility} className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="public" id="public" className="mt-1"/>
                    <div className="grid gap-1.5 leading-normal">
                      <Label htmlFor="public" className="font-medium flex items-center">
                        <Globe className="mr-2 h-4 w-4 text-muted-foreground" /> Public
                      </Label>
                      <p className="text-sm text-muted-foreground">Visible on your profile. Anyone can play.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="unlisted" id="unlisted" className="mt-1"/>
                     <div className="grid gap-1.5 leading-normal">
                      <Label htmlFor="unlisted" className="font-medium flex items-center">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" /> Unlisted
                      </Label>
                       <p className="text-sm text-muted-foreground">Hidden from your profile. Anyone with the link or game code can play.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="private" id="private" className="mt-1"/>
                    <div className="grid gap-1.5 leading-normal">
                      <Label htmlFor="private" className="font-medium flex items-center">
                        <Lock className="mr-2 h-4 w-4 text-muted-foreground" /> Private
                      </Label>
                      <p className="text-sm text-muted-foreground">Hidden from your profile. Only you can play.</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="url" className="p-6 sm:p-8">
          <p className="text-muted-foreground">Enter a URL to automatically populate game details (feature coming soon!).</p>
        </TabsContent>
      </Tabs>
      <div className="bg-muted/50 px-6 sm:px-8 py-4 border-t flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
        <Button type="button" variant="outline" onClick={handleCancel} className="text-base" disabled={isLoading}>
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
        <Button 
            type="submit" 
            className="text-base bg-[hsl(var(--library-action-button-background))] hover:bg-[hsl(var(--library-action-button-background),0.9)] text-[hsl(var(--library-action-button-foreground))]"
            disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isLoading ? 'Saving...' : 'Make game'}
        </Button>
      </div>
    </form>
  );
}
