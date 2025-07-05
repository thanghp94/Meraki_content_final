'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Play, Loader2 } from 'lucide-react';
import { speakText, stopSpeaking, pauseSpeaking, resumeSpeaking, isSpeaking, ttsService } from '@/lib/textToSpeechService';
import { useToast } from '@/hooks/use-toast';

interface TextToSpeechButtonProps {
  text: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
  lang?: string;
  showLabel?: boolean;
  iconOnly?: boolean;
}

export default function TextToSpeechButton({
  text,
  variant = 'ghost',
  size = 'sm',
  className = '',
  disabled = false,
  rate = 1,
  pitch = 1,
  volume = 1,
  voice,
  lang = 'en-US',
  showLabel = false,
  iconOnly = false
}: TextToSpeechButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if TTS is supported
    setIsSupported(ttsService.isSupported());

    // Cleanup on unmount
    return () => {
      if (isPlaying) {
        stopSpeaking();
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    // Monitor speaking state
    const checkSpeakingState = () => {
      const speaking = isSpeaking();
      const paused = ttsService.isPaused();
      
      setIsPlaying(speaking || paused);
      setIsPaused(paused);
    };

    const interval = setInterval(checkSpeakingState, 100);
    return () => clearInterval(interval);
  }, []);

  const handleSpeak = async () => {
    if (!text.trim()) {
      toast({
        title: 'No Text',
        description: 'No text available to speak',
        variant: 'destructive',
      });
      return;
    }

    if (!isSupported) {
      toast({
        title: 'Not Supported',
        description: 'Text-to-speech is not supported in this browser',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isPlaying && !isPaused) {
        // Currently playing, so stop
        stopSpeaking();
        setIsPlaying(false);
        setIsPaused(false);
      } else if (isPaused) {
        // Currently paused, so resume
        resumeSpeaking();
        setIsPaused(false);
      } else {
        // Not playing, so start
        setIsLoading(true);
        await speakText(text, {
          rate,
          pitch,
          volume,
          voice,
          lang
        });
        setIsPlaying(false);
        setIsPaused(false);
      }
    } catch (error) {
      console.error('TTS Error:', error);
      toast({
        title: 'Speech Error',
        description: 'Failed to play text-to-speech',
        variant: 'destructive',
      });
      setIsPlaying(false);
      setIsPaused(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    if (isPlaying && !isPaused) {
      pauseSpeaking();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    stopSpeaking();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  const getIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (isPlaying && !isPaused) {
      return <VolumeX className="h-4 w-4" />;
    }
    
    if (isPaused) {
      return <Play className="h-4 w-4" />;
    }
    
    return <Volume2 className="h-4 w-4" />;
  };

  const getLabel = () => {
    if (isLoading) return 'Loading...';
    if (isPlaying && !isPaused) return 'Stop';
    if (isPaused) return 'Resume';
    return 'Speak';
  };

  const getTitle = () => {
    if (isLoading) return 'Loading text-to-speech...';
    if (isPlaying && !isPaused) return 'Stop speaking';
    if (isPaused) return 'Resume speaking';
    return 'Read text aloud';
  };

  if (iconOnly) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant={variant}
          size={size}
          onClick={handleSpeak}
          disabled={disabled || isLoading}
          className={className}
          title={getTitle()}
        >
          {getIcon()}
        </Button>
        {(isPlaying || isPaused) && (
          <>
            {!isPaused && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePause}
                disabled={disabled}
                title="Pause speaking"
              >
                <Pause className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStop}
              disabled={disabled}
              title="Stop speaking"
            >
              <VolumeX className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSpeak}
      disabled={disabled || isLoading}
      className={className}
      title={getTitle()}
    >
      {getIcon()}
      {showLabel && <span className="ml-2">{getLabel()}</span>}
    </Button>
  );
}

// Utility component for quick TTS integration
export function QuickTTSButton({ text, className }: { text: string; className?: string }) {
  return (
    <TextToSpeechButton
      text={text}
      variant="ghost"
      size="sm"
      className={className}
      iconOnly={false}
      showLabel={false}
    />
  );
}

// Component for content with TTS
export function TTSContent({ 
  children, 
  text, 
  className 
}: { 
  children: React.ReactNode; 
  text: string; 
  className?: string; 
}) {
  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <div className="flex-1">{children}</div>
      <TextToSpeechButton
        text={text}
        variant="ghost"
        size="sm"
        iconOnly={true}
      />
    </div>
  );
}
