
'use client';

import LibrarySidebar from '@/components/library/LibrarySidebar';
import LibraryGrid from '@/components/library/LibraryGrid';
import { mockFolders, mockGames } from '@/lib/libraryData'; // We'll create this for mock data
import type { LibraryItem } from '@/types/library';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { FolderPlus, Gamepad2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header'; // Import the general Header

export default function LibraryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'folders' | 'games'>('folders'); // 'folders' is active in image

  // Combine and filter items - This will be more complex with real data and filters
  const allItems: LibraryItem[] = useMemo(() => {
    const foldersWithType = mockFolders.map(folder => ({ ...folder, type: 'folder' as const }));
    const gamesWithType = mockGames.map(game => ({ ...game, type: 'game' as const }));
    return [...foldersWithType, ...gamesWithType];
  }, []);

  const filteredItems = useMemo(() => {
    let items = allItems;
    if (activeFilter === 'folders') {
      items = items.filter(item => item.type === 'folder');
    } else if (activeFilter === 'games') {
      items = items.filter(item => item.type === 'game');
    }
    // Basic search by name
    if (searchTerm) {
      items = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return items;
  }, [allItems, activeFilter, searchTerm]);

  const handleCreateGame = () => {
    router.push('/make-game'); // Updated to navigate to make-game
  };

  const handleCreateFolder = () => {
    // Placeholder for create folder functionality
    alert('Create new folder functionality to be implemented.');
  };


  return (
    <div className="flex flex-col h-full min-h-screen">
      <Header /> {/* Add the general app header */}
      {/* Top "MY FOLDERS" bar specific to this page */}
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
          folderCount={mockFolders.length} // Pass actual count
        />
        <main className="flex-grow min-w-0">
          {filteredItems.length > 0 ? (
            <LibraryGrid items={filteredItems} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-10">
              <Gamepad2 size={64} className="mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No items found</h2>
              <p className="mb-6">Try adjusting your search or filters.</p>
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
