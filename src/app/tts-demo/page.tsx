'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import TextToSpeechButton, { QuickTTSButton, TTSContent } from '@/components/ui/text-to-speech-button';
import { ttsService } from '@/lib/textToSpeechService';
import { useToast } from '@/hooks/use-toast';

export default function TTSDemoPage() {
  const [customText, setCustomText] = useState('Hello! This is a demonstration of the text-to-speech system. You can type any text here and hear it spoken aloud.');
  const [rate, setRate] = useState([1]);
  const [pitch, setPitch] = useState([1]);
  const [volume, setVolume] = useState([1]);
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const { toast } = useToast();

  const loadVoices = async () => {
    try {
      await ttsService.ensureInitialized();
      const availableVoices = ttsService.getAvailableVoices();
      setVoices(availableVoices);
      toast({
        title: 'Voices Loaded',
        description: `Found ${availableVoices.length} available voices`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load voices',
        variant: 'destructive',
      });
    }
  };

  const sampleTexts = [
    {
      title: 'Quiz Question Example',
      text: 'What is the capital of France? A) London, B) Berlin, C) Paris, D) Madrid',
      category: 'Education'
    },
    {
      title: 'Topic Description',
      text: 'Mathematics is the study of numbers, shapes, and patterns. It helps us understand the world around us.',
      category: 'Academic'
    },
    {
      title: 'Content Summary',
      text: 'This lesson covers basic algebra concepts including variables, equations, and solving for unknown values.',
      category: 'Learning'
    },
    {
      title: 'Instructions',
      text: 'Click the speaker icon next to any text to hear it read aloud. You can adjust the speed, pitch, and volume using the controls below.',
      category: 'Help'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Text-to-Speech Demo</h1>
        <p className="text-muted-foreground">
          Experience the integrated text-to-speech system for educational content
        </p>
      </div>

      {/* TTS Support Check */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={ttsService.isSupported() ? 'default' : 'destructive'}>
              {ttsService.isSupported() ? 'TTS Supported' : 'TTS Not Supported'}
            </Badge>
            <Button onClick={loadVoices} variant="outline" size="sm">
              Load Available Voices ({voices.length})
            </Button>
          </div>
          {voices.length > 0 && (
            <div className="mt-4">
              <Label>Available Voices:</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                {voices.slice(0, 6).map((voice, index) => (
                  <div key={index} className="text-sm p-2 border rounded">
                    <div className="font-medium">{voice.name}</div>
                    <div className="text-muted-foreground">{voice.lang}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Text Input */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Text Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="custom-text">Enter text to speak:</Label>
            <Textarea
              id="custom-text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type any text here..."
              className="mt-2"
              rows={4}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <TextToSpeechButton
              text={customText}
              variant="default"
              size="default"
              showLabel={true}
              rate={rate[0]}
              pitch={pitch[0]}
              volume={volume[0]}
              voice={selectedVoice}
            />
            <QuickTTSButton text={customText} />
          </div>

          {/* Voice Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <Label>Speed: {rate[0].toFixed(1)}x</Label>
              <Slider
                value={rate}
                onValueChange={setRate}
                min={0.5}
                max={2}
                step={0.1}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Pitch: {pitch[0].toFixed(1)}</Label>
              <Slider
                value={pitch}
                onValueChange={setPitch}
                min={0.5}
                max={2}
                step={0.1}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Volume: {Math.round(volume[0] * 100)}%</Label>
              <Slider
                value={volume}
                onValueChange={setVolume}
                min={0}
                max={1}
                step={0.1}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Content */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Educational Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sampleTexts.map((sample, index) => (
            <TTSContent key={index} text={sample.text} className="p-4 border rounded-lg">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{sample.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {sample.category}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{sample.text}</p>
              </div>
            </TTSContent>
          ))}
        </CardContent>
      </Card>

      {/* Integration Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                Quiz Questions
                <TextToSpeechButton
                  text="What is 2 plus 2? A) 3, B) 4, C) 5, D) 6"
                  iconOnly={true}
                  size="sm"
                />
              </h4>
              <p className="text-sm text-muted-foreground">
                Questions can be read aloud to help students with reading difficulties or to provide audio reinforcement.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                Topic Descriptions
                <TextToSpeechButton
                  text="This topic covers the fundamentals of photosynthesis in plants"
                  iconOnly={true}
                  size="sm"
                />
              </h4>
              <p className="text-sm text-muted-foreground">
                Topic summaries and descriptions can be spoken to provide context before starting activities.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                Instructions
                <TextToSpeechButton
                  text="Click on the correct answer to proceed to the next question"
                  iconOnly={true}
                  size="sm"
                />
              </h4>
              <p className="text-sm text-muted-foreground">
                Game instructions and guidance can be read aloud for better accessibility.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                Content Titles
                <TextToSpeechButton
                  text="Introduction to Algebra: Variables and Equations"
                  iconOnly={true}
                  size="sm"
                />
              </h4>
              <p className="text-sm text-muted-foreground">
                Content titles and headings can be spoken to help with navigation and understanding.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <div>
                <strong>In Quiz Games:</strong> Look for the speaker icon in the question header to hear the entire question and answer choices read aloud.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <div>
                <strong>In Content Management:</strong> Use TTS buttons next to content titles and descriptions to hear them spoken.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <div>
                <strong>In Library View:</strong> Topic names and content can be read aloud for better accessibility.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <div>
                <strong>Browser Support:</strong> Works in modern browsers with Web Speech API support (Chrome, Edge, Safari, Firefox).
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
