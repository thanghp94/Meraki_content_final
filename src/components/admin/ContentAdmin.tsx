'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Pencil, Trash2, Eye, Play, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QuizGeneratorModal } from './QuizGeneratorModal';

interface Content {
  id: string;
  title: string;
  infor1: string;
  infor2: string;
  image1: string;
  video1: string;
  topicid: string;
  dateCreated: string;
  questionCount: number;
  topic_name?: string;
  topic_unit?: string;
}

interface Topic {
  id: string;
  topic: string;
  unit: string;
}

export default function ContentAdmin() {
  const { toast } = useToast();
  const [content, setContent] = useState<Content[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [quizGeneratorOpen, setQuizGeneratorOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    infor1: '',
    infor2: '',
    image1: '',
    video1: '',
    topicid: ''
  });

  useEffect(() => {
    fetchContent();
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/admin/topics');
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/admin/content');
      if (!response.ok) throw new Error('Failed to fetch content');
      const data = await response.json();
      setContent(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load content',
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
      const url = editingContent 
        ? `/api/admin/content/${editingContent.id}`
        : '/api/admin/content';
      
      const response = await fetch(url, {
        method: editingContent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save content');

      toast({
        title: editingContent ? 'Content Updated' : 'Content Created',
        description: `Successfully ${editingContent ? 'updated' : 'created'} the content.`,
      });

      setIsDialogOpen(false);
      fetchContent();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingContent ? 'update' : 'create'} content`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (contentItem: Content) => {
    setEditingContent(contentItem);
    setFormData({
      title: contentItem.title || '',
      infor1: contentItem.infor1 || '',
      infor2: contentItem.infor2 || '',
      image1: contentItem.image1 || '',
      video1: contentItem.video1 || '',
      topicid: contentItem.topicid || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const response = await fetch(`/api/admin/content/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete content');

      toast({
        title: 'Content Deleted',
        description: 'Successfully deleted the content.',
      });

      fetchContent();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete content',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingContent(null);
    setFormData({
      title: '',
      infor1: '',
      infor2: '',
      image1: '',
      video1: '',
      topicid: ''
    });
  };

  const handleGenerateQuiz = (contentItem: Content) => {
    setSelectedContent(contentItem);
    setQuizGeneratorOpen(true);
  };

  const MediaPreview = ({ url, type }: { url: string; type: 'image' | 'video' }) => {
    if (!url) return null;

    return (
      <div className="mt-2 border rounded-lg overflow-hidden">
        {type === 'image' ? (
          <img
            src={url}
            alt="Preview"
            className="w-full h-32 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
            }}
          />
        ) : (
          <div className="relative bg-slate-100 h-32 flex items-center justify-center">
            <Play className="h-8 w-8 text-slate-400" />
            <span className="absolute bottom-2 left-2 text-xs text-slate-500 break-all px-2">
              {url}
            </span>
          </div>
        )}
      </div>
    );
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
        <h2 className="text-xl font-semibold">Content</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingContent ? 'Edit Content' : 'Add New Content'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topicid">Topic</Label>
                  <Select
                    value={formData.topicid}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, topicid: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.unit} - {topic.topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="infor1">Information 1</Label>
                  <Textarea
                    id="infor1"
                    value={formData.infor1}
                    onChange={(e) => setFormData(prev => ({ ...prev, infor1: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="infor2">Information 2</Label>
                  <Textarea
                    id="infor2"
                    value={formData.infor2}
                    onChange={(e) => setFormData(prev => ({ ...prev, infor2: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image1">Image URL</Label>
                  <Input
                    id="image1"
                    value={formData.image1}
                    onChange={(e) => setFormData(prev => ({ ...prev, image1: e.target.value }))}
                  />
                  {formData.image1 && (
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img
                        src={formData.image1}
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
                  <Label htmlFor="video1">Video URL</Label>
                  <Input
                    id="video1"
                    value={formData.video1}
                    onChange={(e) => setFormData(prev => ({ ...prev, video1: e.target.value }))}
                  />
                  {formData.video1 && (
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <div className="relative bg-slate-100 h-32 flex items-center justify-center">
                        <Play className="h-8 w-8 text-slate-400" />
                        <span className="absolute bottom-2 left-2 text-xs text-slate-500 break-all px-2">
                          {formData.video1}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    editingContent ? 'Update Content' : 'Create Content'
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
              <TableHead>Title</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Information</TableHead>
              <TableHead>Media</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {content.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                  {item.topic_name ? (
                    <div className="flex flex-col">
                      <span>{item.topic_name}</span>
                      <span className="text-xs text-muted-foreground">{item.topic_unit}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No topic assigned</span>
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate">{item.infor1}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {item.image1 && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                        <a href={item.image1} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {item.video1 && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                        <a href={item.video1} target="_blank" rel="noopener noreferrer">
                          <Play className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>{item.questionCount || 0}</TableCell>
                <TableCell>
                  {item.dateCreated ? new Date(item.dateCreated).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGenerateQuiz(item)}
                      title="Generate AI Quiz Questions"
                    >
                      <Wand2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
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

      {/* Quiz Generator Modal */}
      {selectedContent && (
        <QuizGeneratorModal
          isOpen={quizGeneratorOpen}
          onClose={() => {
            setQuizGeneratorOpen(false);
            setSelectedContent(null);
            fetchContent(); // Refresh content to show updated question counts
          }}
          contentId={selectedContent.id}
          contentTitle={selectedContent.title}
        />
      )}
    </div>
  );
}
