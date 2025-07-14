'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Image as ImageIcon } from 'lucide-react';

interface ImageResult {
  type: 'giphy' | 'google';
  url: string;
  thumbnail: string;
  title: string;
}

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  initialSearchText?: string;
}

export function ImageSearchModal({ isOpen, onClose, onSelect, initialSearchText = '' }: ImageSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ImageResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const handleSearch = async (source: string = activeTab) => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search-images?q=${encodeURIComponent(searchTerm)}&source=${source}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  // Populate search term when modal opens with initial text
  useEffect(() => {
    if (isOpen && initialSearchText.trim()) {
      setSearchTerm(initialSearchText.trim());
      // Auto-search when modal opens with initial text
      setTimeout(() => {
        handleSearch();
      }, 100);
    }
  }, [isOpen, initialSearchText]);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search Images & GIFs</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search for images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={() => handleSearch()} disabled={isLoading}>
            {isLoading ? 'Searching...' : <Search className="h-4 w-4" />}
          </Button>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="google">Google Images</TabsTrigger>
            <TabsTrigger value="giphy">GIPHY</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-4 gap-4">
              {results.map((result, index) => (
                <div
                  key={`${result.type}-${index}`}
                  className="relative group cursor-pointer rounded-lg overflow-hidden hover:ring-2 hover:ring-primary"
                  onClick={() => handleSelect(result.url)}
                >
                  <img
                    src={result.thumbnail}
                    alt={result.title}
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="google" className="mt-4">
            <div className="grid grid-cols-4 gap-4">
              {results.filter(r => r.type === 'google').map((result, index) => (
                <div
                  key={`google-${index}`}
                  className="relative group cursor-pointer rounded-lg overflow-hidden hover:ring-2 hover:ring-primary"
                  onClick={() => handleSelect(result.url)}
                >
                  <img
                    src={result.thumbnail}
                    alt={result.title}
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="giphy" className="mt-4">
            <div className="grid grid-cols-4 gap-4">
              {results.filter(r => r.type === 'giphy').map((result, index) => (
                <div
                  key={`giphy-${index}`}
                  className="relative group cursor-pointer rounded-lg overflow-hidden hover:ring-2 hover:ring-primary"
                  onClick={() => handleSelect(result.url)}
                >
                  <img
                    src={result.thumbnail}
                    alt={result.title}
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Or paste direct image URL:
          </p>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="https://example.com/image.jpg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={() => handleSelect(searchTerm)}>Use URL</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
