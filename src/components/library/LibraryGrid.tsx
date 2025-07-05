'use client';

import { useState, useEffect } from 'react';
import type { LibraryItem } from '@/types/library';
import type { ContentItem } from '@/lib/databaseService';
import FolderCard from './FolderCard';
import ContentTable from './ContentTable';
import '@/styles/figma-design-system.css';

interface LibraryGridProps {
  items: LibraryItem[];
}

export default function LibraryGrid({ items }: LibraryGridProps) {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Only show folders from items
  const folders = items.filter(item => item.type === 'folder');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content');
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }
        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto" style={{ padding: 'var(--spacing-6)' }}>
      {folders.length > 0 && (
        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <h2 className="text-foreground" style={{ 
            fontSize: 'var(--text-xl)', 
            fontWeight: 'var(--font-semibold)', 
            marginBottom: 'var(--spacing-4)' 
          }}>
            Folders
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
               style={{ gap: 'var(--spacing-6)' }}>
            {folders.map(folder => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-foreground" style={{ 
          fontSize: 'var(--text-xl)', 
          fontWeight: 'var(--font-semibold)', 
          marginBottom: 'var(--spacing-4)' 
        }}>
          Content
        </h2>
        {isLoading ? (
          <div className="card flex-center" style={{ padding: 'var(--spacing-8)' }}>
            <span className="text-muted-foreground">Loading content...</span>
          </div>
        ) : content.length > 0 ? (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <ContentTable content={content} />
          </div>
        ) : (
          <div className="card flex-center" style={{ padding: 'var(--spacing-8)' }}>
            <span className="text-muted-foreground">No content found</span>
          </div>
        )}
      </div>
    </div>
  );
}
