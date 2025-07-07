'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ContentViewModal from '@/components/ui/content-view-modal-fixed';
import Link from 'next/link';
import { ArrowLeft, Eye, BookOpen, Image, Video } from 'lucide-react';

// Sample content data that matches your Nostradamus example
const sampleContent = {
  id: 'nostradamus-sample',
  title: 'Nostradamus and his prediction',
  content: `Real name: Michel de Nostredame, French astrologer, physician.

Known for: Les Prophéties, 900+ quatrains predicting events.

Impact: Predictions on French Revolution, Hitler; inspired books, movies.

Nostradamus: His real name was Michel de Nostredame, a French astrologer and physician.

Prophecies: He is known for his book Les Prophéties, containing over 900 quatrains predicting future events.

Historical Impact: Nostradamus's predictions include major events like the French Revolution and the rise of Hitler.

Interpretation: His writings are often vague, leading to varied interpretations, making them popular over time.

Cultural Influence: Nostradamus has inspired countless books, movies, and discussions about prophecy and fate.`,
  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  image2: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
  video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  video2: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
  unit: 'History',
  topic: 'Famous Predictions'
};

const contentExamples = [
  {
    id: 'nostradamus-sample',
    title: 'Nostradamus and his prediction',
    description: 'Learn about the famous French astrologer and his prophecies',
    type: 'Historical Figure',
    mediaCount: { images: 2, videos: 2 }
  },
  {
    id: 'sample-2',
    title: 'The Renaissance Period',
    description: 'Explore the cultural rebirth of Europe',
    type: 'Historical Period',
    mediaCount: { images: 3, videos: 1 }
  },
  {
    id: 'sample-3',
    title: 'Ancient Egyptian Pyramids',
    description: 'Discover the mysteries of pyramid construction',
    type: 'Architecture',
    mediaCount: { images: 4, videos: 2 }
  }
];

export default function ContentDemoPage() {
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openContentModal = (contentId: string) => {
    setSelectedContentId(contentId);
    setIsModalOpen(true);
  };

  const closeContentModal = () => {
    setIsModalOpen(false);
    setSelectedContentId(null);
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    // In a real implementation, this would navigate between actual content items
    console.log(`Navigate ${direction}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/library">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Library
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-primary">📚 Content View Demo</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Introduction */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Content View Modal Demo
              </CardTitle>
              <CardDescription>
                This demo showcases the Content View Modal that matches your Nostradamus example. 
                Click on any content card below to open the modal with TTS integration, media gallery, 
                and popup functionality for images and videos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Features Included:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Text-to-Speech for all content sections</li>
                    <li>• Media gallery with images and videos</li>
                    <li>• Popup modals for full-size media viewing</li>
                    <li>• Navigation between content items</li>
                    <li>• Structured content display</li>
                    <li>• Quiz integration buttons</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">How to Use:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Click "View Content" to open the modal</li>
                    <li>• Use speaker icons for text-to-speech</li>
                    <li>• Click images/videos in gallery for popups</li>
                    <li>• Navigate with arrow buttons in header</li>
                    <li>• Create quizzes with Easy/Hard Quiz buttons</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentExamples.map((content) => (
            <Card key={content.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{content.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {content.description}
                    </CardDescription>
                  </div>
                  <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {content.type}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Media Count */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Image className="h-4 w-4" />
                      <span>{content.mediaCount.images} images</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      <span>{content.mediaCount.videos} videos</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    onClick={() => openContentModal(content.id)}
                    className="w-full"
                    variant={content.id === 'nostradamus-sample' ? 'default' : 'outline'}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Content
                    {content.id === 'nostradamus-sample' && (
                      <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded">
                        Live Demo
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Integration Instructions */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Integration Instructions</CardTitle>
              <CardDescription>
                How to integrate this Content View Modal into your existing components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Import the Component:</h4>
                  <code className="block bg-gray-100 p-3 rounded text-sm">
                    import ContentViewModal from '@/components/ui/content-view-modal';
                  </code>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">2. Add to Your Component:</h4>
                  <code className="block bg-gray-100 p-3 rounded text-sm whitespace-pre">
{`<ContentViewModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  contentId={selectedContentId}
  onNavigate={handleNavigation}
  showNavigation={true}
/>`}
                  </code>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">3. Integration Points:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• <strong>Library View:</strong> Add "View Content" buttons to topic cards</li>
                    <li>• <strong>Setup Form:</strong> Show content before creating quizzes</li>
                    <li>• <strong>Admin Interface:</strong> Preview content during editing</li>
                    <li>• <strong>Quiz Games:</strong> Reference material during gameplay</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content View Modal */}
      {selectedContentId && (
        <ContentViewModal
          isOpen={isModalOpen}
          onClose={closeContentModal}
          contentId={selectedContentId}
          onNavigate={handleNavigation}
          showNavigation={true}
        />
      )}
    </div>
  );
}
