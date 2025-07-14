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
          console.log('TTS voices loaded:', this.voices.length);
          resolve();
        }
      };

      // Check if voices are already available
      if (this.synthesis) {
        const currentVoices = this.synthesis.getVoices();
        if (currentVoices.length > 0) {
          this.voices = currentVoices;
          this.isInitialized = true;
          console.log('TTS voices already available:', this.voices.length);
          resolve();
          return;
        }
      }

      // Wait for voices to be loaded
      let voicesLoaded = false;
      const handleVoicesChanged = () => {
        if (!voicesLoaded) {
          voicesLoaded = true;
          loadVoices();
        }
      };

      if (this.synthesis) {
        this.synthesis.addEventListener('voiceschanged', handleVoicesChanged);
        
        // Fallback timeout - some browsers don't fire voiceschanged
        setTimeout(() => {
          if (!voicesLoaded) {
            voicesLoaded = true;
            loadVoices();
          }
        }, 2000);
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

  public getBestVoiceForLanguage(lang: string = 'en-US'): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) return null;
    
    const langCode = lang.substring(0, 2);
    
    // Priority: local service voices first, then any voice for the language, then default
    const bestVoice = this.voices.find(voice => 
      voice.lang.startsWith(langCode) && voice.localService
    ) || this.voices.find(voice => 
      voice.lang.startsWith(langCode)
    ) || this.voices.find(voice => 
      voice.default
    ) || this.voices[0];
    
    return bestVoice;
  }

  public logVoiceInfo(): void {
    console.log('Available TTS Voices:');
    this.voices.forEach((voice, index) => {
      console.log(`${index + 1}. ${voice.name} (${voice.lang}) - Local: ${voice.localService}, Default: ${voice.default}`);
    });
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
      
      // Set voice options with natural-sounding defaults
      utterance.rate = Math.max(0.5, Math.min(2, options.rate ?? 1.1));
      utterance.pitch = Math.max(0.8, Math.min(2, options.pitch ?? 1.2));
      utterance.volume = Math.max(0.1, Math.min(1, options.volume ?? 0.9));
      utterance.lang = options.lang ?? 'en-US';

      // Find and set voice - prefer local/high-quality voices
      if (options.voice && this.voices.length > 0) {
        const selectedVoice = this.voices.find(voice => 
          voice.name === options.voice || voice.lang.includes(options.voice!)
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else if (this.voices.length > 0) {
        // Auto-select best voice for the language - prefer younger, natural voices
        const langCode = (options.lang ?? 'en-US').substring(0, 2);
        
        // Filter out voices that might sound old or robotic
        const naturalVoices = this.voices.filter(voice => {
          const name = voice.name.toLowerCase();
          // Avoid voices that typically sound older or more robotic
          return !name.includes('fred') && 
                 !name.includes('albert') && 
                 !name.includes('bad news') &&
                 !name.includes('bahh') &&
                 !name.includes('bells') &&
                 !name.includes('boing') &&
                 !name.includes('bubbles') &&
                 !name.includes('cellos') &&
                 !name.includes('deranged') &&
                 !name.includes('good news') &&
                 !name.includes('hysterical') &&
                 !name.includes('pipe organ') &&
                 !name.includes('trinoids') &&
                 !name.includes('whisper') &&
                 !name.includes('zarvox');
        });
        
        const voicesToSearch = naturalVoices.length > 0 ? naturalVoices : this.voices;
        
        // Prefer local service voices first, then any voice for the language
        const bestVoice = voicesToSearch.find(voice => 
          voice.lang.startsWith(langCode) && voice.localService
        ) || voicesToSearch.find(voice => 
          voice.lang.startsWith(langCode)
        ) || voicesToSearch.find(voice => 
          voice.default
        ) || voicesToSearch[0];
        
        if (bestVoice) {
          utterance.voice = bestVoice;
          console.log('Selected TTS voice:', bestVoice.name, bestVoice.lang);
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
