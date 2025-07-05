'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Play } from 'lucide-react';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  duration: string;
  channelTitle: string;
}

interface YouTubeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function YouTubeSearchModal({ isOpen, onClose, onSelect }: YouTubeSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchYouTube = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/search-youtube?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.videos) {
        setVideos(data.videos);
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error('Error searching YouTube:', error);
      setVideos([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchYouTube();
    }
  };

  const handleSelect = (video: YouTubeVideo) => {
    onSelect(video.url);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Search YouTube Videos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Search for videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={searchYouTube} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search
            </Button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {videos.length === 0 && !isSearching && (
              <div className="text-center py-8 text-gray-500">
                <Play className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Search for YouTube videos to add to your content</p>
                <p className="text-sm mt-1">Enter a search term and click Search</p>
              </div>
            )}

            {isSearching && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Searching YouTube...</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelect(video)}
                >
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-32 object-cover rounded"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                      {video.duration}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="h-8 w-8 text-white opacity-75" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="font-medium text-sm line-clamp-2">{video.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{video.channelTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manual URL Input */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">Or paste a YouTube URL directly:</p>
            <div className="flex gap-2">
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      onSelect(input.value.trim());
                      onClose();
                    }
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="youtube.com"]') as HTMLInputElement;
                  if (input?.value.trim()) {
                    onSelect(input.value.trim());
                    onClose();
                  }
                }}
              >
                Use URL
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
