// Text-to-Speech Service
export interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
  lang?: string;
}

export interface TTSVoice {
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

class TextToSpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.initializeVoices();
    }
  }

  private async initializeVoices(): Promise<void> {
    if (!this.synthesis) return;

    // Wait for voices to be loaded
    return new Promise((resolve) => {
      const loadVoices = () => {
        if (this.synthesis) {
          this.voices = this.synthesis.getVoices();
          this.isInitialized = true;
          resolve();
        }
      };

      if (this.synthesis && this.synthesis.getVoices().length > 0) {
        loadVoices();
      } else if (this.synthesis) {
        this.synthesis.addEventListener('voiceschanged', loadVoices, { once: true });
        // Fallback timeout
        setTimeout(loadVoices, 1000);
      }
    });
  }

  public async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeVoices();
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getAvailableVoices(): TTSVoice[] {
    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default
    }));
  }

  public async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!this.synthesis || !text.trim()) {
      throw new Error('Text-to-speech not supported or empty text');
    }

    await this.ensureInitialized();

    // Stop any current speech
    this.stop();

    // Clean text (remove HTML tags, URLs, etc.)
    const cleanText = this.cleanText(text);

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Set voice options
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;
      utterance.lang = options.lang ?? 'en-US';

      // Find and set voice
      if (options.voice) {
        const selectedVoice = this.voices.find(voice => 
          voice.name === options.voice || voice.lang.includes(options.voice!)
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Event handlers
      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      utterance.onstart = () => {
        console.log('TTS started');
      };

      this.currentUtterance = utterance;
      if (this.synthesis) {
        this.synthesis.speak(utterance);
      }
    });
  }

  public pause(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  public resume(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  public stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  public isPaused(): boolean {
    return this.synthesis ? this.synthesis.paused : false;
  }

  private cleanText(text: string): string {
    return text
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove URLs
      .replace(/https?:\/\/[^\s]+/g, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters that might cause issues
      .replace(/[^\w\s.,!?;:()-]/g, '')
      .trim();
  }

  // Generate audio file (using Web Audio API for recording)
  public async generateAudioFile(text: string, options: TTSOptions = {}): Promise<Blob> {
    if (!this.isSupported()) {
      throw new Error('Text-to-speech not supported');
    }

    // For now, we'll use the browser's built-in TTS
    // In a production environment, you might want to use a server-side TTS service
    return new Promise((resolve, reject) => {
      // This is a simplified implementation
      // For actual audio file generation, you'd need to use MediaRecorder API
      // or integrate with a server-side TTS service like Google Cloud TTS, Amazon Polly, etc.
      
      const utterance = new SpeechSynthesisUtterance(this.cleanText(text));
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;
      utterance.lang = options.lang ?? 'en-US';

      // For now, we'll return a placeholder blob
      // In a real implementation, you'd capture the audio output
      const blob = new Blob([''], { type: 'audio/wav' });
      resolve(blob);
    });
  }
}

// Export singleton instance
export const ttsService = new TextToSpeechService();

// Utility functions for common use cases
export const speakText = async (text: string, options?: TTSOptions) => {
  try {
    await ttsService.speak(text, options);
  } catch (error) {
    console.error('TTS Error:', error);
    throw error;
  }
};

export const stopSpeaking = () => {
  ttsService.stop();
};

export const pauseSpeaking = () => {
  ttsService.pause();
};

export const resumeSpeaking = () => {
  ttsService.resume();
};

export const isSpeaking = () => {
  return ttsService.isSpeaking();
};
