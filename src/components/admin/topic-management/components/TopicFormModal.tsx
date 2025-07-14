import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface TopicFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingTopic: any;
  topicFormData: any;
  setTopicFormData: React.Dispatch<React.SetStateAction<any>>;
  handleTopicSubmit: (e: React.FormEvent) => void;
  resetTopicForm: () => void;
}

export default function TopicFormModal({
  isOpen,
  onOpenChange,
  editingTopic,
  topicFormData,
  setTopicFormData,
  handleTopicSubmit,
  resetTopicForm,
}: TopicFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingTopic ? 'Edit Topic' : 'Add New Topic'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleTopicSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic Name</Label>
              <Input
                id="topic"
                value={topicFormData.topic}
              onChange={(e) => setTopicFormData((prev: any) => ({ ...prev, topic: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Select
                value={topicFormData.program}
              onValueChange={(value) => setTopicFormData((prev: any) => ({ ...prev, program: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grapeseed">Grapeseed</SelectItem>
                  <SelectItem value="TATH">TATH</SelectItem>
                  <SelectItem value="WSC">WSC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={topicFormData.unit}
              onChange={(e) => setTopicFormData((prev: any) => ({ ...prev, unit: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={topicFormData.image}
              onChange={(e) => setTopicFormData((prev: any) => ({ ...prev, image: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="short_summary">Summary</Label>
            <textarea
              id="short_summary"
              value={topicFormData.short_summary}
              onChange={(e) => setTopicFormData((prev: any) => ({ ...prev, short_summary: e.target.value }))}
              rows={3}
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showstudent"
              checked={topicFormData.showstudent}
              onCheckedChange={(checked) => setTopicFormData((prev: any) => ({ ...prev, showstudent: checked }))}
            />
            <Label htmlFor="showstudent">Visible to students</Label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTopic ? 'Update Topic' : 'Create Topic'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
