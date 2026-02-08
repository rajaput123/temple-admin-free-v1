import { useState, useMemo } from 'react';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '@/lib/pr-communication-store';
import type { MessageTemplate, MessageChannel } from '@/types/pr-communication';
import { toast } from 'sonner';
import { TemplateModal } from '@/components/pr/communication/TemplateModal';
import { TemplatesLog } from '@/components/pr/communication/TemplatesLog';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import '@/styles/pr-communication.css';

export default function Templates() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  const handleSave = (data: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, data);
      toast.success('Template updated successfully');
    } else {
      createTemplate(data);
      toast.success('Template created successfully');
    }
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Message Templates</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage reusable message templates for quick messaging
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingTemplate(null);
            setIsModalOpen(true);
          }}
          size="lg"
          className="gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Template
        </Button>
      </div>

      {/* Templates Table */}
      <TemplatesLog onEdit={handleEdit} />

      {/* Template Modal */}
      <TemplateModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingTemplate(null);
        }}
        template={editingTemplate}
        onSave={handleSave}
      />
    </div>
  );
}
