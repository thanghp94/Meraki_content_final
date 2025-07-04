'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Topic {
  id: string;
  topic: string;
  short_summary: string;
  unit: string;
  image: string;
  parentid: string | null;
  showstudent: boolean;
}

export default function TopicAdmin() {
  const router = useRouter();
  const { toast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [selectedTopicForContent, setSelectedTopicForContent] = useState<Topic | null>(null);
  const [formData, setFormData] = useState({
    topic: '',
    short_summary: '',
    unit: '',
    image: '',
    showstudent: true
  });
  const [contentFormData, setContentFormData] = useState({
    title: '',
    infor1: '',
    infor2: '',
    image1: '',
    video1: '',
    topicid: ''
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/admin/topics');
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load topics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingTopic 
        ? `/api/admin/topics/${editingTopic.id}`
        : '/api/admin/topics';
      
      const response = await fetch(url, {
        method: editingTopic ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save topic');

      toast({
        title: editingTopic ? 'Topic Updated' : 'Topic Created',
        description: `Successfully ${editingTopic ? 'updated' : 'created'} the topic.`,
      });

      setIsDialogOpen(false);
      fetchTopics();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingTopic ? 'update' : 'create'} topic`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({
      topic: topic.topic,
      short_summary: topic.short_summary,
      unit: topic.unit,
      image: topic.image,
      showstudent: topic.showstudent
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;

    try {
      const response = await fetch(`/api/admin/topics/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete topic');

      toast({
        title: 'Topic Deleted',
        description: 'Successfully deleted the topic.',
      });

      fetchTopics();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete topic',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingTopic(null);
    setFormData({
      topic: '',
      short_summary: '',
      unit: '',
      image: '',
      showstudent: true
    });
  };

  const resetContentForm = () => {
    setSelectedTopicForContent(null);
    setContentFormData({
      title: '',
      infor1: '',
      infor2: '',
      image1: '',
      video1: '',
      topicid: ''
    });
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentFormData),
      });

      if (!response.ok) throw new Error('Failed to create content');

      toast({
        title: 'Content Created',
        description: 'Successfully created the content for this topic.',
      });

      setIsContentDialogOpen(false);
      resetContentForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create content',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContent = (topic: Topic) => {
    setSelectedTopicForContent(topic);
    setContentFormData(prev => ({ ...prev, topicid: topic.id }));
    setIsContentDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Topics</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTopic ? 'Edit Topic' : 'Add New Topic'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic Name</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_summary">Summary</Label>
                <Input
                  id="short_summary"
                  value={formData.short_summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_summary: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    editingTopic ? 'Update Topic' : 'Create Topic'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Content Creation Dialog */}
        <Dialog open={isContentDialogOpen} onOpenChange={(open) => {
          setIsContentDialogOpen(open);
          if (!open) resetContentForm();
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Add Content to {selectedTopicForContent?.topic}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleContentSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content-title">Title</Label>
                <Input
                  id="content-title"
                  value={contentFormData.title}
                  onChange={(e) => setContentFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="content-infor1">Information 1</Label>
                  <Textarea
                    id="content-infor1"
                    value={contentFormData.infor1}
                    onChange={(e) => setContentFormData(prev => ({ ...prev, infor1: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content-infor2">Information 2</Label>
                  <Textarea
                    id="content-infor2"
                    value={contentFormData.infor2}
                    onChange={(e) => setContentFormData(prev => ({ ...prev, infor2: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="content-image1">Image URL</Label>
                  <Input
                    id="content-image1"
                    value={contentFormData.image1}
                    onChange={(e) => setContentFormData(prev => ({ ...prev, image1: e.target.value }))}
                  />
                  {contentFormData.image1 && (
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img
                        src={contentFormData.image1}
                        alt="Preview"
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content-video1">Video URL</Label>
                  <Input
                    id="content-video1"
                    value={contentFormData.video1}
                    onChange={(e) => setContentFormData(prev => ({ ...prev, video1: e.target.value }))}
                  />
                  {contentFormData.video1 && (
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <div className="relative bg-slate-100 h-32 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-slate-400" />
                        <span className="absolute bottom-2 left-2 text-xs text-slate-500 break-all px-2">
                          {contentFormData.video1}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsContentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Create Content'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Topic Name</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.map((topic) => (
              <TableRow key={topic.id}>
                <TableCell>{topic.topic}</TableCell>
                <TableCell>{topic.unit}</TableCell>
                <TableCell className="max-w-xs truncate">{topic.short_summary}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddContent(topic)}
                      title="Add Content to Topic"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(topic)}
                      title="Edit Topic"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(topic.id)}
                      title="Delete Topic"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
