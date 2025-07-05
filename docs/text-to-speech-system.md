# Text-to-Speech System Documentation

## Overview

The Text-to-Speech (TTS) system provides comprehensive audio accessibility features throughout the educational platform. Users can hear content, questions, topics, and instructions read aloud using the browser's built-in speech synthesis capabilities.

## Features

### Core Functionality
- **Web Speech API Integration**: Uses browser's native text-to-speech capabilities
- **Cross-browser Support**: Works in Chrome, Edge, Safari, and Firefox
- **Voice Customization**: Adjustable rate, pitch, volume, and voice selection
- **Real-time Controls**: Play, pause, stop, and resume functionality
- **Text Cleaning**: Automatically removes HTML tags and URLs for clean speech

### UI Components
- **TextToSpeechButton**: Reusable button component with multiple variants
- **QuickTTSButton**: Simple one-click TTS button
- **TTSContent**: Wrapper component that adds TTS to any content
- **ContentRenderer**: Enhanced with optional TTS integration

### Integration Points
- **Quiz Questions**: Full question and answer reading in game interface
- **Content Management**: TTS for titles, descriptions, and content
- **Library View**: Audio support for topic names and summaries
- **Admin Interface**: Accessibility for content editing and management

## Implementation

### Service Layer (`textToSpeechService.ts`)
```typescript
// Basic usage
import { speakText, stopSpeaking } from '@/lib/textToSpeechService';

await speakText('Hello world!', {
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  lang: 'en-US'
});
```

### Component Usage
```tsx
import TextToSpeechButton from '@/components/ui/text-to-speech-button';

// Basic button
<TextToSpeechButton text="Read this text" />

// Customized button
<TextToSpeechButton
  text="Custom text"
  variant="outline"
  size="lg"
  rate={0.9}
  pitch={1.1}
  showLabel={true}
/>

// Icon-only button
<TextToSpeechButton
  text="Quick read"
  iconOnly={true}
  size="sm"
/>
```

### Content Integration
```tsx
import { TTSContent } from '@/components/ui/text-to-speech-button';

<TTSContent text="This content can be read aloud">
  <div>Your content here</div>
</TTSContent>
```

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Best performance and voice selection |
| Edge | ✅ Full | Good performance, Windows voices |
| Safari | ✅ Full | macOS/iOS native voices |
| Firefox | ✅ Partial | Basic functionality, limited voices |

## Voice Options

The system automatically detects available voices on the user's device:
- **System Voices**: Built-in OS voices (highest quality)
- **Browser Voices**: Browser-provided voices
- **Language Support**: Automatic language detection and voice matching
- **Fallback**: Default system voice if preferred voice unavailable

## Accessibility Features

### WCAG Compliance
- **Keyboard Navigation**: All TTS controls accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Visual Indicators**: Clear visual feedback for TTS state
- **Focus Management**: Proper focus handling during speech

### User Benefits
- **Reading Difficulties**: Assists users with dyslexia or reading challenges
- **Visual Impairments**: Audio reinforcement for screen reader users
- **Language Learning**: Pronunciation assistance for non-native speakers
- **Multitasking**: Allows listening while performing other tasks

## Configuration Options

### Default Settings
```typescript
const defaultOptions = {
  rate: 1.0,        // Speech rate (0.5 - 2.0)
  pitch: 1.0,       // Voice pitch (0.5 - 2.0)
  volume: 1.0,      // Volume level (0.0 - 1.0)
  lang: 'en-US',    // Language code
  voice: undefined  // Auto-select best voice
};
```

### Customization
- **Per-component Settings**: Each TTS button can have custom settings
- **Global Preferences**: User preferences can be stored and applied
- **Context-aware**: Different settings for different content types

## Performance Considerations

### Optimization
- **Lazy Loading**: TTS service initializes only when needed
- **Voice Caching**: Available voices cached after first load
- **Text Preprocessing**: Efficient text cleaning and preparation
- **Memory Management**: Proper cleanup of speech synthesis objects

### Best Practices
- **Short Texts**: Break long content into smaller chunks
- **User Control**: Always provide stop/pause controls
- **Fallback Handling**: Graceful degradation when TTS unavailable
- **Error Recovery**: Robust error handling and user feedback

## Demo and Testing

### TTS Demo Page (`/tts-demo`)
- **Interactive Testing**: Live TTS functionality testing
- **Voice Controls**: Real-time adjustment of speech parameters
- **Sample Content**: Educational content examples
- **Browser Compatibility**: Support status and voice availability

### Testing Scenarios
1. **Basic Functionality**: Simple text reading
2. **Long Content**: Extended text with pause/resume
3. **Multiple Languages**: Different language support
4. **Error Handling**: Network issues and unsupported browsers
5. **Accessibility**: Keyboard navigation and screen reader compatibility

## Integration Examples

### Quiz Game Integration
```tsx
// In QuestionModal.tsx
<TextToSpeechButton
  text={`Question: ${questionText}. Options: A) ${option1}, B) ${option2}...`}
  variant="ghost"
  className="text-primary-foreground"
  iconOnly={true}
  rate={0.9}
/>
```

### Content Management
```tsx
// In ContentAdmin.tsx
<TTSContent text={contentTitle}>
  <h3>{contentTitle}</h3>
</TTSContent>
```

### Library View
```tsx
// In TopicCard.tsx
<div className="flex items-center gap-2">
  <h4>{topicName}</h4>
  <QuickTTSButton text={topicName} />
</div>
```

## Future Enhancements

### Planned Features
- **Server-side TTS**: Integration with cloud TTS services (Google, AWS, Azure)
- **Audio File Generation**: Pre-generated audio files for offline use
- **Voice Cloning**: Custom voice training for institutional branding
- **Multi-language Support**: Enhanced language detection and switching
- **User Preferences**: Persistent TTS settings per user

### Advanced Features
- **SSML Support**: Speech Synthesis Markup Language for advanced control
- **Emotion and Emphasis**: Contextual speech variations
- **Background Audio**: Non-blocking TTS with visual indicators
- **Batch Processing**: Bulk audio generation for content libraries

## Troubleshooting

### Common Issues
1. **No Sound**: Check browser permissions and system volume
2. **Robotic Voice**: Limited voice options, try different browser
3. **Slow Performance**: Large text blocks, break into smaller chunks
4. **Browser Compatibility**: Use supported browser versions

### Debug Tools
- **Console Logging**: Detailed TTS operation logs
- **Voice Detection**: Available voice enumeration
- **Error Reporting**: Comprehensive error messages
- **Performance Monitoring**: Speech synthesis timing

## Security and Privacy

### Data Handling
- **Local Processing**: All TTS processing happens in browser
- **No Data Transmission**: Text never sent to external servers
- **Privacy Compliant**: No user data collection or storage
- **Secure by Design**: Uses browser's native security model

### Permissions
- **No Special Permissions**: Uses standard Web APIs
- **User Consent**: TTS activation requires user interaction
- **Transparent Operation**: Clear indication when TTS is active
