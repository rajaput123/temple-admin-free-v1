import type {
  KnowledgeActivityEvent,
  KnowledgeBetaChatMessage,
  KnowledgeBetaChatSession,
  KnowledgeCategory,
  KnowledgeDocument,
  KnowledgeDocumentStatus,
} from '@/types/knowledge';
import {
  defaultKnowledgeCategories,
  seedBetaSessions,
  seedKnowledgeActivity,
  seedKnowledgeDocuments,
} from '@/data/knowledge-dummy-data';

// Bump key to reset any previously-seeded categories/documents in sessionStorage.
const STORAGE_KEY = 'kms_store_v3';

interface KnowledgeStoreState {
  categories: KnowledgeCategory[];
  documents: KnowledgeDocument[];
  activity: KnowledgeActivityEvent[];
  betaSessions: KnowledgeBetaChatSession[];
  aiUsage: { totalBetaChats: number; totalDevoteeChats: number };
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function ymd() {
  return new Date().toISOString().split('T')[0];
}

function initState(): KnowledgeStoreState {
  return {
    categories: defaultKnowledgeCategories,
    documents: seedKnowledgeDocuments,
    activity: seedKnowledgeActivity,
    betaSessions: seedBetaSessions,
    aiUsage: { totalBetaChats: seedBetaSessions.length, totalDevoteeChats: 0 },
  };
}

export function getKnowledgeState(): KnowledgeStoreState {
  const stored = safeParse<KnowledgeStoreState>(sessionStorage.getItem(STORAGE_KEY));
  if (stored) return stored;
  const initial = initState();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function setKnowledgeState(next: KnowledgeStoreState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function pushActivity(state: KnowledgeStoreState, evt: Omit<KnowledgeActivityEvent, 'id' | 'timestamp'>) {
  state.activity.unshift({
    id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: nowIso(),
    ...evt,
  });
}

export function listCategories() {
  return getKnowledgeState().categories;
}

export function listDocuments() {
  return getKnowledgeState().documents;
}

export function upsertCategory(category: KnowledgeCategory, actor = 'admin@temple.org') {
  const state = getKnowledgeState();
  const idx = state.categories.findIndex((c) => c.id === category.id);
  if (idx >= 0) {
    state.categories[idx] = category;
    pushActivity(state, {
      actor,
      action: 'category_updated',
      entityType: 'category',
      entityId: category.id,
      message: `Updated category “${category.name}”.`,
    });
  } else {
    state.categories.unshift(category);
    pushActivity(state, {
      actor,
      action: 'category_created',
      entityType: 'category',
      entityId: category.id,
      message: `Created category “${category.name}”.`,
    });
  }
  setKnowledgeState(state);
  return category;
}

export function setCategoryStatus(categoryId: string, status: KnowledgeCategory['status'], actor = 'admin@temple.org') {
  const state = getKnowledgeState();
  const cat = state.categories.find((c) => c.id === categoryId);
  if (!cat) return;
  cat.status = status;
  pushActivity(state, {
    actor,
    action: status === 'disabled' ? 'category_disabled' : 'category_enabled',
    entityType: 'category',
    entityId: categoryId,
    message: `${status === 'disabled' ? 'Disabled' : 'Enabled'} category “${cat.name}”.`,
  });
  setKnowledgeState(state);
}

export function createDocument(
  input: Pick<
    KnowledgeDocument,
    'fileName' | 'categoryId' | 'title' | 'description' | 'tags' | 'accessType'
  > & { uploadedBy?: string },
) {
  const state = getKnowledgeState();
  const doc: KnowledgeDocument = {
    id: `doc-${Date.now()}`,
    fileName: input.fileName,
    categoryId: input.categoryId,
    title: input.title,
    description: input.description,
    tags: input.tags,
    accessType: input.accessType,
    uploadedBy: input.uploadedBy || 'admin@temple.org',
    uploadedAt: nowIso(),
    uploadDate: ymd(),
    version: 1,
    status: 'draft',
    processingLog: [],
  };
  state.documents.unshift(doc);
  pushActivity(state, {
    actor: doc.uploadedBy,
    action: 'document_uploaded',
    entityType: 'document',
    entityId: doc.id,
    message: `Uploaded “${doc.title}”.`,
  });
  setKnowledgeState(state);
  return doc;
}

function setDocStatus(state: KnowledgeStoreState, docId: string, status: KnowledgeDocumentStatus, actor: string) {
  const doc = state.documents.find((d) => d.id === docId);
  if (!doc) return;
  doc.status = status;
  doc.processingLog = doc.processingLog || [];
}

function generateMockAiArtifacts(doc: KnowledgeDocument) {
  const base = doc.description || doc.title;
  doc.aiSummary = `Summary: ${base.slice(0, 120)}${base.length > 120 ? '…' : ''}`;
  doc.chunks = [
    { id: `chk-${doc.id}-1`, text: `${base} (chunk 1)` },
    { id: `chk-${doc.id}-2`, text: `${base} (chunk 2)` },
  ];
  doc.processingLog = [...(doc.processingLog || []), 'Text extracted', 'Summary generated', 'Chunked', 'Embeddings created', 'Indexed'];
}

export function submitForApproval(docId: string, actor = 'admin@temple.org') {
  const state = getKnowledgeState();
  const doc = state.documents.find((d) => d.id === docId);
  if (!doc) return;

  doc.status = 'uploaded';
  doc.processingLog = [...(doc.processingLog || []), 'Uploaded'];
  pushActivity(state, {
    actor,
    action: 'document_submitted',
    entityType: 'document',
    entityId: docId,
    message: `Submitted “${doc.title}” for approval.`,
  });
  setKnowledgeState(state);

  // Mock pipeline: uploaded → processing → pending_approval
  window.setTimeout(() => {
    const s1 = getKnowledgeState();
    const d1 = s1.documents.find((d) => d.id === docId);
    if (!d1) return;
    d1.status = 'processing';
    d1.processingLog = [...(d1.processingLog || []), 'Processing started'];
    pushActivity(s1, {
      actor: 'AI Processor',
      action: 'document_processing_started',
      entityType: 'document',
      entityId: docId,
      message: `AI processing started for “${d1.title}”.`,
    });
    setKnowledgeState(s1);
  }, 600);

  window.setTimeout(() => {
    const s2 = getKnowledgeState();
    const d2 = s2.documents.find((d) => d.id === docId);
    if (!d2) return;
    generateMockAiArtifacts(d2);
    d2.status = 'pending_approval';
    pushActivity(s2, {
      actor: 'AI Processor',
      action: 'document_processing_completed',
      entityType: 'document',
      entityId: docId,
      message: `AI processing completed for “${d2.title}”.`,
    });
    setKnowledgeState(s2);
  }, 1400);
}

export function reviewDocument(
  docId: string,
  decision: 'approved' | 'rejected',
  notes: string | undefined,
  reviewerId = 'beta@temple.org',
) {
  const state = getKnowledgeState();
  const doc = state.documents.find((d) => d.id === docId);
  if (!doc) return;

  doc.approval = {
    reviewerId,
    reviewedAt: nowIso(),
    decision,
    notes,
  };
  doc.status = decision === 'approved' ? 'approved' : 'rejected';
  pushActivity(state, {
    actor: reviewerId,
    action: decision === 'approved' ? 'document_approved' : 'document_rejected',
    entityType: 'document',
    entityId: docId,
    message: `${decision === 'approved' ? 'Approved' : 'Rejected'} “${doc.title}”.`,
    metadata: notes ? { notes } : undefined,
  });
  setKnowledgeState(state);
}

export function publishDocument(docId: string, actor = 'beta@temple.org') {
  const state = getKnowledgeState();
  const doc = state.documents.find((d) => d.id === docId);
  if (!doc) return;
  if (doc.status !== 'approved') return;
  doc.status = 'published';
  pushActivity(state, {
    actor,
    action: 'document_published',
    entityType: 'document',
    entityId: docId,
    message: `Published “${doc.title}”.`,
  });
  setKnowledgeState(state);
}

export function addBetaMessage(sessionId: string, message: KnowledgeBetaChatMessage) {
  const state = getKnowledgeState();
  const session = state.betaSessions.find((s) => s.id === sessionId);
  if (!session) return;
  session.messages.push(message);
  state.aiUsage.totalBetaChats += 1;
  pushActivity(state, {
    actor: 'beta@temple.org',
    action: 'beta_chat',
    entityType: 'chat',
    entityId: sessionId,
    message: 'Beta conversation message added.',
  });
  setKnowledgeState(state);
}

export function createBetaSession(scope: KnowledgeBetaChatSession['scope']) {
  const state = getKnowledgeState();
  const session: KnowledgeBetaChatSession = {
    id: `beta-${Date.now()}`,
    createdAt: nowIso(),
    scope,
    messages: [],
  };
  state.betaSessions.unshift(session);
  setKnowledgeState(state);
  return session;
}

