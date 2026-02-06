export type KnowledgeCategoryStatus = 'active' | 'disabled';
export type KnowledgeAccessType = 'internal' | 'public';

export type KnowledgeDocumentStatus =
  | 'draft'
  | 'uploaded'
  | 'processing'
  | 'pending_approval'
  | 'approved'
  | 'published'
  | 'rejected';

export interface KnowledgeCategory {
  id: string;
  name: string;
  status: KnowledgeCategoryStatus;
  isSystem: boolean;
}

export interface KnowledgeChunk {
  id: string;
  text: string;
}

export interface KnowledgeApproval {
  reviewerId: string;
  reviewedAt: string;
  decision: 'approved' | 'rejected';
  notes?: string;
}

export interface KnowledgeDocument {
  id: string;
  fileName: string;
  categoryId: string;
  title: string;
  description: string;
  tags: string[];
  accessType: KnowledgeAccessType;

  uploadedBy: string;
  uploadedAt: string;
  uploadDate: string; // YYYY-MM-DD (for table sorting)
  version: number;

  status: KnowledgeDocumentStatus;
  aiSummary?: string;
  chunks?: KnowledgeChunk[];
  processingLog?: string[];
  approval?: KnowledgeApproval;
}

export interface KnowledgeActivityEvent {
  id: string;
  timestamp: string;
  actor: string;
  action:
    | 'category_created'
    | 'category_updated'
    | 'category_disabled'
    | 'category_enabled'
    | 'document_uploaded'
    | 'document_submitted'
    | 'document_processing_started'
    | 'document_processing_completed'
    | 'document_approved'
    | 'document_rejected'
    | 'document_published'
    | 'beta_chat'
    | 'devotee_chat';
  entityType: 'category' | 'document' | 'chat';
  entityId: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeBetaChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  sources?: Array<{ documentId: string; title: string }>;
}

export interface KnowledgeBetaChatSession {
  id: string;
  createdAt: string;
  scope: { categoryId?: string; documentIds?: string[]; includeNonPublished?: boolean };
  messages: KnowledgeBetaChatMessage[];
  feedback?: 'useful' | 'not_useful';
}

