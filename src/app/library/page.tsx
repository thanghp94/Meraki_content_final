'use client';

import LibrarySidebar from '@/components/library/LibrarySidebar';
import LibraryGrid from '@/components/library/LibraryGrid';
import type { LibraryItem, Folder, GameStub } from '@/types/library'; // Updated imports
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FolderPlus, Gamepad2, Loader2 } from 'lucide-react'; // Added Loader2
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';

export default function LibraryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'folders' | 'games'>('folders');
  
  const [folders, setFolders] = useState<Folder[]>([]);
  const [games, setGames] = useState<GameStub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  useEffect(() => {
    const fetchLibraryData = async () => {
      setIsLoading(true);
      try {
        const [foldersResponse, gamesResponse] = await Promise.all([
          fetch('/api/folders'),
          fetch('/api/games')
        ]);
        
        if (!foldersResponse.ok || !gamesResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const fetchedFolders = await foldersResponse.json();
        const fetchedGames = await gamesResponse.json();
        
        setFolders(fetchedFolders);
        setGames(fetchedGames);
      } catch (error) {
        console.error("Error fetching library data:", error);
        toast({
          title: "Error loading library",
          description: "Could not fetch your games and folders. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchLibraryData();
  }, [toast]);

  const allItems: LibraryItem[] = useMemo(() => {
    // Ensure fetched data is correctly typed for LibraryItem union
    const foldersWithType: LibraryItem[] = folders.map(folder => ({ ...folder, type: 'folder' as const }));
    const gamesWithType: LibraryItem[] = games.map(game => ({ ...game, type: 'game' as const }));
    
    const combined = [...foldersWithType, ...gamesWithType];
    combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return combined;
  }, [folders, games]);

  const filteredItems = useMemo(() => {
    let itemsToFilter = allItems;
    if (activeFilter === 'folders') {
      itemsToFilter = itemsToFilter.filter(item => item.type === 'folder');
    } else if (activeFilter === 'games') {
      itemsToFilter = itemsToFilter.filter(item => item.type === 'game');
    }
    if (searchTerm) {
      itemsToFilter = itemsToFilter.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return itemsToFilter;
  }, [allItems, activeFilter, searchTerm]);

  const handleCreateGame = () => {
    router.push('/make-game');
  };

  const handleCreateFolder = async () => {
    const folderName = prompt("Enter new folder name:");
    if (folderName && folderName.trim() !== "") {
      setIsCreatingFolder(true);
      try {
        // Use a simple placeholder for aiHint or derive from name
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
      <header className="bg-library-header text-library-header-foreground py-6 px-4 sm:px-8 text-center shadow-md">
        <h1 className="text-3xl font-bold">MY FOLDERS</h1>
        <p className="text-sm">Organize your games</p>
      </header>

      <div className="flex-grow flex flex-col md:flex-row p-4 sm:p-6 gap-4 sm:gap-6 container mx-auto">
        <LibrarySidebar 
          className="w-full md:w-72 lg:w-80 flex-shrink-0"
          onSearch={setSearchTerm}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onNewGame={handleCreateGame}
          onNewFolder={handleCreateFolder}
          folderCount={folders.length} // Use actual count from fetched data
          isCreatingFolder={isCreatingFolder}
        />
        <main className="flex-grow min-w-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-10">
              <Loader2 size={64} className="mb-4 animate-spin" />
              <h2 className="text-2xl font-semibold mb-2">Loading Library...</h2>
              <p>Fetching your games and folders.</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <LibraryGrid items={filteredItems} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-10">
              <Gamepad2 size={64} className="mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No items found</h2>
              <p className="mb-6">
                {activeFilter === 'all' && !searchTerm ? "Your library is empty. Try creating a new game or folder!" : "Try adjusting your search or filters."}
              </p>
              {activeFilter !== 'all' && (
                 <Button variant="outline" onClick={() => setActiveFilter('all')}>Show All Items</Button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
