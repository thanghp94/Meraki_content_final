'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Grid, List, Edit, Trash2, Image, Video, Tag, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
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

function VocabularyPageContent() {
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<VocabularyItem[]>([]);
  const [paginatedItems, setPaginatedItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingItem, setEditingItem] = useState<VocabularyItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // 20 items per page
  const { toast } = useToast();

  // Alphabet letters for filtering
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Calculate pagination values
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  useEffect(() => {
    fetchVocabulary();
  }, []);

  useEffect(() => {
    filterItems();
  }, [vocabularyItems, searchTerm, selectedLetter, selectedTag]);

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, selectedLetter, selectedTag]);

  useEffect(() => {
    // Update paginated items when filtered items or current page changes
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedItems(filteredItems.slice(startIndex, endIndex));
  }, [filteredItems, currentPage, itemsPerPage]);

  const fetchVocabulary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/vocabulary/all');
      if (response.ok) {
        const data = await response.json();
        setVocabularyItems(data.vocabularyItems || []);
        
        // Extract all unique tags
        const tags = new Set<string>();
        data.vocabularyItems?.forEach((item: VocabularyItem) => {
          item.tags?.forEach(tag => tags.add(tag));
        });
        setAllTags(Array.from(tags).sort());
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
    }
  };

  const filterItems = () => {
    let filtered = vocabularyItems;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by letter
    if (selectedLetter !== 'All') {
      filtered = filtered.filter(item =>
        item.word.charAt(0).toUpperCase() === selectedLetter
      );
    }

    // Filter by tag
    if (selectedTag !== 'All') {
      filtered = filtered.filter(item =>
        item.tags?.includes(selectedTag)
      );
    }

    setFilteredItems(filtered);
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
        fetchVocabulary();
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
    fetchVocabulary();
  };

  const VocabularyCard = ({ item }: { item: VocabularyItem }) => (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl text-blue-600 mb-1">{item.word}</CardTitle>
            {item.phoneticTranscription && (
              <p className="text-sm text-gray-500 italic">/{item.phoneticTranscription}/</p>
            )}
            <Badge variant="secondary" className="mt-1">
              {item.partOfSpeech}
            </Badge>
          </div>
          <div className="flex gap-1">
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
      </CardHeader>
      <CardContent>
        {item.imageUrl && (
          <div className="mb-3">
            <img
              src={item.imageUrl}
              alt={item.word}
              className="w-full h-32 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        <p className="text-sm text-gray-700 mb-3">{item.definition}</p>
        {item.exampleSentence && (
          <p className="text-sm text-gray-600 italic mb-3">"{item.exampleSentence}"</p>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {item.imageUrl && <Image className="h-3 w-3" />}
          {item.videoUrl && <Video className="h-3 w-3" />}
          {item.tags && item.tags.length > 0 && (
            <div className="flex gap-1">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 pt-20">
      <div className="max-w-7xl mx-auto px-6 pt-2 pb-4">
        {/* Search and Filters */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl shadow-lg p-4 mb-6 border-4 border-yellow-300">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
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
              <Tabs defaultValue="alphabet" className="flex items-center">
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

          <Tabs defaultValue="alphabet" className="w-full">
            <TabsContent value="alphabet" className="mt-0">
              <div className="bg-white/50 rounded-2xl p-3 shadow-md">
                <div className="flex flex-wrap gap-1 justify-center items-center">
                  <Button
                    variant={selectedLetter === 'All' ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 px-3 text-xs font-bold rounded-full transition-all duration-300 ${
                      selectedLetter === 'All' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                        : 'bg-purple-100 border-2 border-purple-300 text-purple-700 hover:bg-purple-200'
                    }`}
                    onClick={() => setSelectedLetter('All')}
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
                            : 'bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedLetter(letter)}
                      >
                        {letter}
                      </Button>
                    );
                  })}
                  <div className="ml-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    {filteredItems.length}/{vocabularyItems.length} words
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tags" className="mt-0">
              <div className="bg-white/50 rounded-2xl p-3 shadow-md">
                <div className="flex flex-wrap gap-1 justify-center items-center">
                  <Button
                    variant={selectedTag === 'All' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTag('All')}
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
                        onClick={() => setSelectedTag(tag)}
                        className={`h-8 px-2 text-xs font-bold rounded-full transition-all duration-300 ${
                          selectedTag === tag 
                            ? `bg-gradient-to-r ${tagColors[colorIndex]} text-white shadow-lg` 
                            : 'bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {tag}
                      </Button>
                    );
                  })}
                  <div className="ml-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    {filteredItems.length}/{vocabularyItems.length} words
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Vocabulary Items */}
        {filteredItems.length === 0 ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedItems.map(item => (
                  <VocabularyCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {paginatedItems.map(item => (
                  <VocabularyListItem key={item.id} item={item} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="bg-gradient-to-r from-purple-400 to-pink-400 text-white border-0 rounded-full font-bold hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  ⬅️ Previous
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 7) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 4) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNumber = totalPages - 6 + i;
                    } else {
                      pageNumber = currentPage - 3 + i;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-10 h-8 rounded-full font-bold transition-all duration-300 ${
                          currentPage === pageNumber
                            ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-lg scale-110'
                            : 'bg-white border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:scale-105'
                        }`}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-gradient-to-r from-green-400 to-blue-400 text-white border-0 rounded-full font-bold hover:from-green-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next ➡️
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Page Info */}
            {totalPages > 1 && (
              <div className="text-center mt-4">
                <div className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
                  <p className="text-sm font-semibold text-purple-700">
                    📄 Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} words
                  </p>
                </div>
              </div>
            )}
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
