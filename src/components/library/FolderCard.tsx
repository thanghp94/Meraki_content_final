
'use client';

import type { Folder } from '@/types/library';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Folder as FolderIcon, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';

interface FolderCardProps {
  folder: Folder;
}

export default function FolderCard({ folder }: FolderCardProps) {
  const coverImage = folder.coverImageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(folder.name)}`;
  const hint = folder.aiHint || folder.name.split(' ').slice(0,2).join(' ').toLowerCase() || "abstract pattern";

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0 relative aspect-video bg-muted flex items-center justify-center">
        {/* Always render Image component but source can be placeholder */}
        <Image
            src={coverImage}
            alt={`Cover image for ${folder.name}`}
            layout="fill"
            objectFit="cover"
            data-ai-hint={hint}
            className={!folder.coverImageUrl ? 'opacity-50' : ''} // Dim if it's a generic placeholder
          />
        {!folder.coverImageUrl && <FolderIcon className="w-24 h-24 text-muted-foreground absolute" />}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold truncate">{folder.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{folder.itemCount} items</p>
        {/* <p className="text-xs text-muted-foreground mt-1">
          Created: {new Date(folder.createdAt).toLocaleDateString()}
        </p> */}
      </CardContent>
      <CardFooter className="p-3 border-t flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
            {/* Placeholder for interactions count, e.g. games played or questions */}
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More options</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
