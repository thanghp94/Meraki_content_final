'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search } from 'lucide-react';
import { ContentData, ContentType } from '@/types/question';
import { ImageSearchModal } from './ImageSearchModal';

interface ContentInputProps {
  label: string;
  value: ContentData;
  onChange: (content: ContentData) => void;
  isTextArea?: boolean;
  required?: boolean;
}

export default function ContentInput({ 
  label, 
  value, 
  onChange, 
  isTextArea = false,
  required = false 
}: ContentInputProps): JSX.Element {
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);

  const handleContentTypeChange = (type: ContentType) => {
    onChange({
      ...value,
      type,
      // Clear fields that don't apply to the new type
      text: type === 'image' ? undefined : value.text,
      image: type === 'text' ? undefined : value.image,
    });
  };

  const handleTextChange = (text: string) => {
    onChange({
      ...value,
      text,
    });
  };

  const handleImageChange = (image: string) => {
    onChange({
      ...value,
      image,
    });
  };

  const searchImages = async (query: string, source: string = 'all') => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/search-images?q=${encodeURIComponent(query)}&source=${source}`);
      const data = await response.json();
      
      if (data.results) {
        // Convert results to GIPHY format for compatibility
        const formattedResults = data.results.map((result: any) => ({
          id: `${result.type}-${Math.random()}`,
          title: result.title,
          images: {
            fixed_height: { url: result.url },
            fixed_height_small: { url: result.thumbnail }
          }
        }));
        setGiphyResults(formattedResults);
      } else {
        setGiphyResults([]);
      }
    } catch (error) {
      console.error('Error searching images:', error);
      setGiphyResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectGif = (gifUrl: string) => {
    handleImageChange(gifUrl);
    setIsImageSearchOpen(false);
  };

  const isImageValid = (url: string) => {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  };

  return (
    <div className="space-y-3">
      <Label htmlFor={`${label}-input`} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      {/* Content Type Radio Buttons */}
      <div className="flex gap-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name={`${label}-type`}
            checked={value.type === 'text'}
            onChange={() => handleContentTypeChange('text')}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm">Text Only</span>
        </label>
        
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name={`${label}-type`}
            checked={value.type === 'image'}
            onChange={() => handleContentTypeChange('image')}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm">Image Only</span>
        </label>
        
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name={`${label}-type`}
            checked={value.type === 'mixed'}
            onChange={() => handleContentTypeChange('mixed')}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm">Text + Image</span>
        </label>
      </div>

      {/* Dynamic Input Fields */}
      <div className="space-y-3">
        {/* Text Input */}
        {(value.type === 'text' || value.type === 'mixed') && (
          <div>
            {isTextArea ? (
              <Textarea
                id={`${label}-text`}
                value={value.text || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={`Enter ${label.toLowerCase()} text...`}
                required={required && value.type === 'text'}
                rows={3}
              />
            ) : (
              <Input
                id={`${label}-text`}
                value={value.text || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={`Enter ${label.toLowerCase()} text...`}
                required={required && value.type === 'text'}
              />
            )}
          </div>
        )}

        {/* Image Input */}
        {(value.type === 'image' || value.type === 'mixed') && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                id={`${label}-image`}
                value={value.image || ''}
                onChange={(e) => handleImageChange(e.target.value)}
                placeholder="Enter image URL or search..."
                required={required && value.type === 'image'}
                className="flex-1"
              />
              
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setIsImageSearchOpen(true)}
              >
                <Search className="h-4 w-4 mr-1" />
                Search
              </Button>
            </div>

            <ImageSearchModal
              isOpen={isImageSearchOpen}
              onClose={() => setIsImageSearchOpen(false)}
              onSelect={(url) => {
                handleImageChange(url);
                setIsImageSearchOpen(false);
              }}
            />

            {/* Image Preview */}
            {value.image && isImageValid(value.image) && (
              <div className="mt-2">
                <img
                  src={value.image}
                  alt="Preview"
                  className="max-w-xs max-h-32 object-contain border rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
