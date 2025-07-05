'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  title?: string;
}

interface MediaGalleryProps {
  images: string[];
  videos: string[];
  className?: string;
}

export function MediaGallery({ images, videos, className = '' }: MediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out empty URLs and create media items
  const mediaItems: MediaItem[] = [
    ...images.filter(url => url && url.trim()).map(url => ({ type: 'image' as const, url })),
    ...videos.filter(url => url && url.trim()).map(url => ({ type: 'video' as const, url }))
  ];

  if (mediaItems.length === 0) {
    return null;
  }

  const openMedia = (item: MediaItem, index: number) => {
    setSelectedMedia(item);
    setCurrentIndex(index);
  };

  const closeMedia = () => {
    setSelectedMedia(null);
  };

  const navigateMedia = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + mediaItems.length) % mediaItems.length
      : (currentIndex + 1) % mediaItems.length;
    
    setCurrentIndex(newIndex);
    setSelectedMedia(mediaItems[newIndex]);
  };

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}>
        {mediaItems.map((item, index) => (
          <div
            key={index}
            className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => openMedia(item, index)}
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.png';
                }}
              />
            ) : (
              <>
                <img
                  src={getYouTubeThumbnail(item.url) || '/placeholder-video.png'}
                  alt={`Video thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-60 rounded-full p-2">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Media Viewer Modal */}
      <Dialog open={!!selectedMedia} onOpenChange={closeMedia}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70"
              onClick={closeMedia}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Navigation Buttons */}
            {mediaItems.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70"
                  onClick={() => navigateMedia('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70"
                  onClick={() => navigateMedia('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Media Content */}
            <div className="w-full">
              {selectedMedia?.type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt="Gallery image"
                  className="w-full max-h-[80vh] object-contain"
                />
              ) : selectedMedia?.type === 'video' ? (
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedMedia.url)}`}
                    title="YouTube video"
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : null}
            </div>

            {/* Media Counter */}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {mediaItems.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
