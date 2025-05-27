
'use client';

import type { LibraryItem } from '@/types/library';
import FolderCard from './FolderCard';
import GameCard from './GameCard';

interface LibraryGridProps {
  items: LibraryItem[];
}

export default function LibraryGrid({ items }: LibraryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {items.map(item => {
        if (item.type === 'folder') {
          return <FolderCard key={item.id} folder={item} />;
        }
        if (item.type === 'game') {
          return <GameCard key={item.id} game={item} />;
        }
        return null;
      })}
    </div>
  );
}
