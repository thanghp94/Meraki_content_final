import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ContentFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingContent: any;
  contentFormData: any;
  setContentFormData: React.Dispatch<React.SetStateAction<any>>;
  handleContentSubmit: (e: React.FormEvent) => void;
  resetContentForm: () => void;
}

export default function ContentFormModal({
  isOpen,
  onOpenChange,
  editingContent,
  contentFormData,
  setContentFormData,
  handleContentSubmit,
  resetContentForm,
}: ContentFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          {editingContent ? 'Edit Content' : 'Add Content'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingContent ? 'Edit Content' : 'Add New Content'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleContentSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content-title">Title</Label>
            <Input
              id="content-title"
              value={contentFormData.title}
              onChange={(e) => setContentFormData((prev: any) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="content-infor1">Description</Label>
              <Textarea
                id="content-infor1"
                value={contentFormData.infor1}
                onChange={(e) => setContentFormData((prev: any) => ({ ...prev, infor1: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-infor2">Additional Information</Label>
              <Textarea
                id="content-infor2"
                value={contentFormData.infor2}
                onChange={(e) => setContentFormData((prev: any) => ({ ...prev, infor2: e.target.value }))}
                rows={4}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="content-image1">Image 1 URL</Label>
              <Input
                id="content-image1"
                value={contentFormData.image1}
                onChange={(e) => setContentFormData((prev: any) => ({ ...prev, image1: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-image2">Image 2 URL</Label>
              <Input
                id="content-image2"
                value={contentFormData.image2}
                onChange={(e) => setContentFormData((prev: any) => ({ ...prev, image2: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="content-video1">Video 1 URL</Label>
              <Input
                id="content-video1"
                value={contentFormData.video1}
                onChange={(e) => setContentFormData((prev: any) => ({ ...prev, video1: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-video2">Video 2 URL</Label>
              <Input
                id="content-video2"
                value={contentFormData.video2}
                onChange={(e) => setContentFormData((prev: any) => ({ ...prev, video2: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingContent ? 'Update Content' : 'Create Content'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
