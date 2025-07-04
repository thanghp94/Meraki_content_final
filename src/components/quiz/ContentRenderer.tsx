'use client';

import { parseContentData, ContentData } from '@/types/question';

interface ContentRendererProps {
  content: string | ContentData;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  alt?: string;
}

export default function ContentRenderer({ 
  content, 
  className = '', 
  imageClassName = '',
  textClassName = '',
  alt = 'Content image'
}: ContentRendererProps) {
  // Parse content data (handles both old string format and new JSON format)
  const contentData = typeof content === 'string' ? parseContentData(content) : content;

  const renderContent = () => {
    switch (contentData.type) {
      case 'text':
        return contentData.text ? (
          <div className={textClassName}>
            {contentData.text}
          </div>
        ) : null;

      case 'image':
        return contentData.image ? (
          <div className={`relative ${imageClassName}`}>
            <img
              src={contentData.image}
              alt={alt}
              className="w-full h-full object-contain"
            />
          </div>
        ) : null;

      case 'mixed':
        return (
          <div className="space-y-3">
            {contentData.text && (
              <div className={textClassName}>
                {contentData.text}
              </div>
            )}
            {contentData.image && (
              <div className={`relative ${imageClassName}`}>
                <img
                  src={contentData.image}
                  alt={alt}
                  className="w-full h-full object-contain"
                />
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
