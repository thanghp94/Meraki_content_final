'use client';

import LibraryGrid from '@/components/library/LibraryGrid';
import TopicsByUnit from '@/components/library/TopicsByUnit';
import type { LibraryItem, Folder } from '@/types/library';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderPlus, Loader2, Search, BookOpen, Folder as FolderIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';

export default function LibraryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'units' | 'folders'>('units');
  
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  useEffect(() => {
    const fetchLibraryData = async () => {
      setIsLoading(true);
      try {
        const foldersResponse = await fetch('/api/folders');
        
        if (!foldersResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const fetchedFolders = await foldersResponse.json();
        setFolders(fetchedFolders);
      } catch (error) {
        console.error("Error fetching library data:", error);
        toast({
          title: "Error loading library",
          description: "Could not fetch your folders. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchLibraryData();
  }, [toast]);

  const allItems: LibraryItem[] = useMemo(() => {
    const foldersWithType: LibraryItem[] = folders.map(folder => ({ ...folder, type: 'folder' as const }));
    foldersWithType.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return foldersWithType;
  }, [folders]);

  const filteredItems = useMemo(() => {
    let itemsToFilter = allItems;
    if (searchTerm) {
      itemsToFilter = itemsToFilter.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return itemsToFilter;
  }, [allItems, searchTerm]);

  const handleCreateFolder = async () => {
    const folderName = prompt("Enter new folder name:");
    if (folderName && folderName.trim() !== "") {
      setIsCreatingFolder(true);
      try {
        const aiHint = folderName.split(' ').slice(0,2).join(' ').toLowerCase() || 'folder icon';
        
        const response = await fetch('/api/folders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: folderName.trim(), 
            aiHint,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create folder');
        }
        
        // Refetch folders to include the new one
        const foldersResponse = await fetch('/api/folders');
        if (foldersResponse.ok) {
          const updatedFolders = await foldersResponse.json();
          setFolders(updatedFolders);
        }
        
        toast({ title: "Folder Created", description: `Folder "${folderName.trim()}" added.` });
      } catch (error) {
        console.error("Error creating folder:", error);
        toast({ title: "Error", description: "Could not create folder.", variant: "destructive" });
      } finally {
        setIsCreatingFolder(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      <Header />

      <div className="bg-background" style={{ padding: 'var(--spacing-6)' }}>
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant={activeFilter === 'units' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('units')}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              View by Unit
            </Button>
            <Button
              variant={activeFilter === 'folders' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('folders')}
              className="flex items-center gap-2"
            >
              <FolderIcon className="h-4 w-4" />
              Folders ({folders.length})
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {activeFilter === 'folders' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search folders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            )}
            {activeFilter === 'folders' && (
              <Button
                onClick={handleCreateFolder}
                disabled={isCreatingFolder}
                className="flex items-center gap-2"
              >
                {isCreatingFolder ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FolderPlus className="h-4 w-4" />
                )}
                New Folder
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <main className="w-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-10">
              <Loader2 size={64} className="mb-4 animate-spin" />
              <h2 className="text-2xl font-semibold mb-2">Loading Library...</h2>
              <p>Fetching your content and folders.</p>
            </div>
          ) : activeFilter === 'units' ? (
            <TopicsByUnit />
          ) : filteredItems.length > 0 ? (
            <LibraryGrid items={filteredItems} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-10">
              <FolderPlus size={64} className="mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No folders found</h2>
              <p className="mb-6">
                {!searchTerm ? "Your library is empty. Try creating a new folder!" : "Try adjusting your search."}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm('')}>Clear Search</Button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
