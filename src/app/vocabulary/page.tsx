'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Filter, Grid, List, Edit, Trash2, Image, Video, Tag, BookOpen, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import VocabularyEditModal from '@/components/vocabulary/VocabularyEditModal';
import VocabularyCreateModal from '@/components/vocabulary/VocabularyCreateModal';

interface VocabularyItem {
  id: string;
  word: string;
  partOfSpeech: string;
  definition: string;
  exampleSentence?: string;
  phoneticTranscription?: string;
  imageUrl?: string;
  videoUrl?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function VocabularyPageContent() {
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [activeTab, setActiveTab] = useState('alphabet');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingItem, setEditingItem] = useState<VocabularyItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const { toast } = useToast();

  // Alphabet letters for filtering
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset and fetch when filters change
  useEffect(() => {
    setVocabularyItems([]);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchVocabularyPaginated(1, true);
  }, [debouncedSearchTerm, selectedLetter, selectedTag]);

  // Initial load with faster startup
  useEffect(() => {
    // Start loading immediately without waiting for debounce
    fetchVocabularyPaginated(1, true);
  }, []);

  const fetchVocabularyPaginated = async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: page === 1 ? '10' : '20', // First load: 10 items, subsequent loads: 20 items
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(selectedLetter !== 'All' && { letter: selectedLetter }),
        ...(selectedTag !== 'All' && { tag: selectedTag })
      });

      const response = await fetch(`/api/vocabulary/paginated?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (reset) {
          setVocabularyItems(data.vocabularyItems || []);
        } else {
          setVocabularyItems(prev => [...prev, ...(data.vocabularyItems || [])]);
        }
        
        setPagination(data.pagination);
        // Only update tags if they are provided (first page only)
        if (data.allTags && data.allTags.length > 0) {
          setAllTags(data.allTags);
        }
      } else {
        throw new Error('Failed to fetch vocabulary');
      }
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vocabulary items.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.hasNextPage && !loadingMore) {
      fetchVocabularyPaginated(pagination.currentPage + 1, false);
    }
  };

  const handleEdit = (item: VocabularyItem) => {
    setEditingItem(item);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vocabulary item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/vocabulary/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Vocabulary item deleted successfully.',
        });
        // Refresh the current view
        setVocabularyItems([]);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        fetchVocabularyPaginated(1, true);
      } else {
        throw new Error('Failed to delete vocabulary item');
      }
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete vocabulary item.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = () => {
    setEditingItem(null);
    setShowCreateModal(false);
    // Refresh the current view
    setVocabularyItems([]);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchVocabularyPaginated(1, true);
  };

  const VocabularyCard = ({ item }: { item: VocabularyItem }) => (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-3">
        {/* Two-column layout: Text info + Image */}
        <div className="grid grid-cols-3 gap-3">
          {/* Left column: Word, pronunciation, part of speech, edit/delete buttons */}
          <div className="col-span-2 flex flex-col justify-between">
            {/* Top section: Word info with edit/delete buttons */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg text-blue-600 leading-tight">{item.word}</CardTitle>
                {/* Edit and Delete buttons next to word */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="h-5 w-5 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="h-5 w-5 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {item.phoneticTranscription && (
                <p className="text-xs text-gray-500 italic mb-1">/{item.phoneticTranscription}/</p>
              )}
              <Badge variant="secondary" className="text-xs w-fit">
                {item.partOfSpeech}
              </Badge>
            </div>
            
            {/* Bottom section: Tags */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
              {item.imageUrl && <Image className="h-3 w-3" />}
              {item.videoUrl && <Video className="h-3 w-3" />}
              {item.tags && item.tags.length > 0 && (
                <div className="flex gap-1 items-center">
                  <Tag className="h-3 w-3" />
                  {item.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 2 && <span>+{item.tags.length - 2}</span>}
                </div>
              )}
            </div>
          </div>
          
          {/* Right column: Square Image thumbnail */}
          <div className="col-span-1">
            {item.imageUrl && (
              <div className="w-full aspect-square">
                <img
                  src={item.imageUrl}
                  alt={item.word}
                  className="w-full h-full object-contain rounded-lg bg-gray-50"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const VocabularyListItem = ({ item }: { item: VocabularyItem }) => (
    <Card className="mb-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-600">{item.word}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{item.partOfSpeech}</Badge>
                  {item.phoneticTranscription && (
                    <span className="text-sm text-gray-500 italic">/{item.phoneticTranscription}/</span>
                  )}
                </div>
              </div>
              <div className="flex-2">
                <p className="text-sm text-gray-700">{item.definition}</p>
                {item.exampleSentence && (
                  <p className="text-sm text-gray-600 italic mt-1">"{item.exampleSentence}"</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {item.imageUrl && <Image className="h-4 w-4 text-green-600" />}
                {item.videoUrl && <Video className="h-4 w-4 text-blue-600" />}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex gap-1">
                    {item.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(item)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-6xl mb-4 animate-bounce">📚</div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
            <p className="text-lg font-semibold text-purple-700 mt-4">Loading amazing words...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 pt-16">
      <div className="max-w-7xl mx-auto px-6 pt-1 pb-4">
        {/* Search and Filters */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl shadow-lg p-3 mb-3 border-4 border-yellow-300">
          <div className="flex flex-col lg:flex-row gap-3 mb-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
                <Input
                  placeholder="🔍 Search for amazing words or meanings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-white border-3 border-purple-300 rounded-full text-lg font-semibold placeholder:text-purple-400 focus:border-pink-400 focus:ring-pink-300 shadow-lg"
                />
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex items-center">
                <TabsList className="bg-white/70 rounded-full p-1 shadow-md">
                  <TabsTrigger value="alphabet" className="rounded-full font-bold text-purple-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-pink-400 data-[state=active]:text-white">
                    🔤 By Alphabet
                  </TabsTrigger>
                  <TabsTrigger value="tags" className="rounded-full font-bold text-purple-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-red-400 data-[state=active]:text-white">
                    🏷️ By Tags
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`rounded-full font-bold transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg' 
                    : 'bg-white border-2 border-blue-300 text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Grid className="h-4 w-4 mr-1" />
                🎯 Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`rounded-full font-bold transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg' 
                    : 'bg-white border-2 border-green-300 text-green-600 hover:bg-green-50'
                }`}
              >
                <List className="h-4 w-4 mr-1" />
                📋 List
              </Button>
              
              <Button 
                onClick={() => setShowCreateModal(true)} 
                className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                ✨ Add New Word
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="alphabet" className="mt-0">
              <div className="bg-white/50 rounded-2xl p-2 shadow-md">
                <div className="flex flex-wrap gap-1 justify-center items-center">
                  <Button
                    variant={selectedLetter === 'All' ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 px-3 text-xs font-bold rounded-full transition-all duration-300 ${
                      selectedLetter === 'All' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                        : 'bg-purple-100 border-2 border-purple-300 text-purple-700 hover:bg-purple-200'
                    }`}
                    onClick={() => {
                      setSelectedLetter('All');
                      setSelectedTag('All');
                    }}
                  >
                    ✨ All
                  </Button>
                  {alphabet.map((letter, index) => {
                    const colors = [
                      'from-red-400 to-pink-400',
                      'from-blue-400 to-purple-400', 
                      'from-green-400 to-teal-400',
                      'from-yellow-400 to-orange-400',
                      'from-purple-400 to-indigo-400',
                      'from-pink-400 to-rose-400'
                    ];
                    const colorIndex = index % colors.length;
                    
                    return (
                      <Button
                        key={letter}
                        variant={selectedLetter === letter ? 'default' : 'outline'}
                        size="sm"
                        className={`h-8 w-8 p-0 text-xs font-bold rounded-full transition-all duration-300 ${
                          selectedLetter === letter 
                            ? `bg-gradient-to-r ${colors[colorIndex]} text-white shadow-lg` 
                            : 'bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                        }`}
                        onClick={() => {
                          setSelectedLetter(letter);
                          setSelectedTag('All');
                        }}
                      >
                        {letter}
                      </Button>
                    );
                  })}
                  <div className="ml-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    {pagination.totalCount} words
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tags" className="mt-0">
              <div className="bg-white/50 rounded-2xl p-2 shadow-md">
                <div className="flex flex-wrap gap-1 justify-center items-center">
                  <Button
                    variant={selectedTag === 'All' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedTag('All');
                      setSelectedLetter('All');
                    }}
                    className={`h-8 px-3 text-xs font-bold rounded-full transition-all duration-300 ${
                      selectedTag === 'All' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                        : 'bg-purple-100 border-2 border-purple-300 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    ✨ All Tags
                  </Button>
                  {allTags.map((tag, index) => {
                    const tagColors = [
                      'from-red-400 to-orange-400',
                      'from-blue-400 to-cyan-400', 
                      'from-green-400 to-lime-400',
                      'from-purple-400 to-violet-400',
                      'from-pink-400 to-rose-400',
                      'from-yellow-400 to-amber-400'
                    ];
                    const colorIndex = index % tagColors.length;
                    
                    return (
                      <Button
                        key={tag}
                        variant={selectedTag === tag ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSelectedTag(tag);
                          setSelectedLetter('All');
                        }}
                        className={`h-8 px-2 text-xs font-bold rounded-full transition-all duration-300 ${
                          selectedTag === tag 
                            ? `bg-gradient-to-r ${tagColors[colorIndex]} text-white shadow-lg` 
                            : 'bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                        }`}
                      >
                        {tag}
                      </Button>
                    );
                  })}
                  <div className="ml-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    {pagination.totalCount} words
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Vocabulary Items */}
        {vocabularyItems.length === 0 && !loading ? (
          <div className="text-center py-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl border-4 border-dashed border-purple-300">
            <div className="text-8xl mb-4 animate-bounce">🔍</div>
            <h3 className="text-2xl font-bold text-purple-700 mb-4">Oops! No words found!</h3>
            <p className="text-lg text-purple-600 bg-white/70 px-6 py-2 rounded-full inline-block">
              🌟 Try searching for different words or pick another letter! 🌟
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-8">
                {vocabularyItems.map((item: VocabularyItem) => (
                  <VocabularyCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {vocabularyItems.map((item: VocabularyItem) => (
                  <VocabularyListItem key={item.id} item={item} />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {pagination.hasNextPage && (
              <div className="flex justify-center mt-8 mb-4">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Loading more words...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-5 w-5 mr-2" />
                      Load More Words ({pagination.totalCount - vocabularyItems.length} remaining)
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Results Info */}
            <div className="text-center mt-4">
              <div className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
                <p className="text-sm font-semibold text-purple-700">
                  📚 Showing {vocabularyItems.length} of {pagination.totalCount} words
                </p>
              </div>
            </div>
          </>
        )}

        {/* Modals */}
        {editingItem && (
          <VocabularyEditModal
            isOpen={!!editingItem}
            onClose={() => setEditingItem(null)}
            onSave={handleSave}
            vocabularyItem={editingItem}
          />
        )}

        {showCreateModal && (
          <VocabularyCreateModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}

export default function VocabularyPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'teacher']}>
      <div className="flex flex-col h-full min-h-screen">
        <Header />
        <div className="flex-grow">
          <VocabularyPageContent />
        </div>
      </div>
    </ProtectedRoute>
  );
}
