
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Camera, FileUp, Globe, Image as ImageIcon, Lock, Save, Users, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating a mock game ID

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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('en');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('unlisted');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!title.trim()) {
      toast({ title: 'Title Required', description: 'Please enter a title for your game.', variant: 'destructive' });
      return;
    }
    const gameData = { title, description, language, tags, visibility, imageUrl };
    console.log("Game Data Submitted:", gameData);
    toast({ title: 'Game Created!', description: `${title} has been created. Now add some questions.` });
    
    // In a real app, you would save the game to a backend and get a real ID.
    const mockGameId = uuidv4(); 
    router.push(`/edit-game/${mockGameId}?name=${encodeURIComponent(title)}`); 
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
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-base font-semibold">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What's it about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 text-base min-h-[100px]"
                />
              </div>
              <div>
                <Label htmlFor="language" className="text-base font-semibold">Language (Autofilled)</Label>
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
            </div>

            {/* Right Column - Image and Visibility */}
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold">Game Image/GIF</Label>
                <p className="text-xs text-muted-foreground mb-2">Browse gifs, upload image or paste URL (0.25MB max)</p>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <Button type="button" variant="default" className="bg-[hsl(var(--current-team-highlight-background))] hover:bg-[hsl(var(--current-team-highlight-background),0.9)] text-[hsl(var(--current-team-highlight-foreground))] flex-1">
                    <ImageIcon className="mr-2" /> Image Library
                  </Button>
                  <Button type="button" variant="outline" className="flex-1">
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
        <Button type="button" variant="outline" onClick={handleCancel} className="text-base">
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
        <Button type="submit" className="text-base bg-[hsl(var(--library-action-button-background))] hover:bg-[hsl(var(--library-action-button-background),0.9)] text-[hsl(var(--library-action-button-foreground))]">
          <Save className="mr-2 h-4 w-4" /> Make game
        </Button>
      </div>
    </form>
  );
}
