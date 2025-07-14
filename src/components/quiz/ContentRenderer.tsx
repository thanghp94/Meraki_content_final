'use client';

import { parseContentData, ContentData } from '@/types/question';
import TextToSpeechButton from '@/components/ui/text-to-speech-button';

interface ContentRendererProps {
  content: string | ContentData;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  alt?: string;
  showTTS?: boolean;
  ttsClassName?: string;
}

export default function ContentRenderer({ 
  content, 
  className = '', 
  imageClassName = '',
  textClassName = '',
  alt = 'Content image',
  showTTS = false,
  ttsClassName = ''
}: ContentRendererProps) {
  // Parse content data (handles both old string format and new JSON format)
  const contentData = typeof content === 'string' ? parseContentData(content) : content;
console.log('ContentRenderer Debug:');
console.log('- Original content:', content);
console.log('- Parsed contentData:', contentData);
console.log('- contentData type:', typeof contentData);
console.log('- contentData.type:', contentData?.type);
console.log('- contentData.text:', contentData?.text);

  // Extract text for TTS
  const getTextForTTS = () => {
    switch (contentData?.type || 'text') {
      case 'text':
        return contentData.text || '';
      case 'image':
        return alt || 'Image content';
      case 'mixed':
        return contentData.text || alt || 'Mixed content';
      default:
        return '';
    }
  };

  const renderContent = () => {
    // Safety check for contentData
    if (!contentData) {
      return null;
    }
    
    switch (contentData?.type || 'text') {
      
      case 'text':
        return contentData.text ? (
          <div className={`${showTTS ? 'flex items-start gap-2' : ''}`}>
            <div className={`${textClassName} ${showTTS ? 'flex-1' : ''}`}>
              {contentData.text}
            </div>
            {showTTS && (
              <TextToSpeechButton
                text={contentData.text}
                variant="ghost"
                size="sm"
                className={ttsClassName}
                iconOnly={true}
              />
            )}
          </div>
        ) : null;

      case 'image':
        return contentData.image ? (
          <div className={`${showTTS ? 'flex items-start gap-2' : ''}`}>
            <div className={`relative ${showTTS ? 'flex-1' : ''}`}>
              <img
                src={contentData.image}
                alt={alt}
                className={imageClassName || "max-w-full max-h-48 object-contain"}
              />
            </div>
            {showTTS && (
              <TextToSpeechButton
                text={alt}
                variant="ghost"
                size="sm"
                className={ttsClassName}
                iconOnly={true}
              />
            )}
          </div>
        ) : null;

      case 'mixed':
        return (
          <div className="space-y-3">
            {contentData.text && (
              <div className={`${showTTS ? 'flex items-start gap-2' : ''}`}>
                <div className={`${textClassName} ${showTTS ? 'flex-1' : ''}`}>
                  {contentData.text}
                </div>
                {showTTS && (
                  <TextToSpeechButton
                    text={contentData.text}
                    variant="ghost"
                    size="sm"
                    className={ttsClassName}
                    iconOnly={true}
                  />
                )}
              </div>
            )}
            {contentData.image && (
              <div className={`${showTTS ? 'flex items-start gap-2' : ''}`}>
                <div className={`relative ${showTTS ? 'flex-1' : ''}`}>
                  <img
                    src={contentData.image}
                    alt={alt}
                    className={imageClassName || "max-w-full max-h-48 object-contain"}
                  />
                </div>
                {showTTS && !contentData.text && (
                  <TextToSpeechButton
                    text={alt}
                    variant="ghost"
                    size="sm"
                    className={ttsClassName}
                    iconOnly={true}
                  />
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {renderContent()}
    </div>
  );
}
