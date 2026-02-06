import type { KnowledgeActivityEvent, KnowledgeCategory, KnowledgeDocument, KnowledgeBetaChatSession } from '@/types/knowledge';

export const defaultKnowledgeCategories: KnowledgeCategory[] = [
  // General category for all general queries
  { id: 'cat-general', name: 'General', status: 'active', isSystem: true },
];

const today = new Date();
const yyyyMmDd = (d: Date) => d.toISOString().split('T')[0];

export const seedKnowledgeDocuments: KnowledgeDocument[] = [
  // General category documents with various statuses (not all published)
  {
    id: 'doc-1',
    fileName: 'Temple_FAQ.pdf',
    categoryId: 'cat-general',
    title: 'Temple Frequently Asked Questions',
    description: 'Common questions and answers about temple services, timings, and general information.',
    tags: ['faq', 'general', 'information'],
    accessType: 'public',
    uploadedBy: 'admin@temple.org',
    uploadedAt: new Date(today.getTime() - 7 * 24 * 3600 * 1000).toISOString(),
    uploadDate: yyyyMmDd(new Date(today.getTime() - 7 * 24 * 3600 * 1000)),
    version: 1,
    status: 'pending_approval',
    aiSummary: 'Comprehensive FAQ covering temple timings, services, facilities, and general queries from devotees.',
    chunks: [
      { id: 'c1', text: 'Temple opening hours, darshan timings, and special event schedules.' },
      { id: 'c2', text: 'Common questions about seva bookings, donations, and temple facilities.' },
    ],
    processingLog: ['Uploaded', 'Text extracted', 'Summary generated', 'Chunked', 'Indexed'],
  },
  {
    id: 'doc-2',
    fileName: 'General_Temple_Information.pdf',
    categoryId: 'cat-general',
    title: 'General Temple Information',
    description: 'General information about temple history, location, contact details, and basic guidelines.',
    tags: ['general', 'information', 'contact'],
    accessType: 'public',
    uploadedBy: 'admin@temple.org',
    uploadedAt: new Date(today.getTime() - 6 * 24 * 3600 * 1000).toISOString(),
    uploadDate: yyyyMmDd(new Date(today.getTime() - 6 * 24 * 3600 * 1000)),
    version: 1,
    status: 'approved',
    aiSummary: 'Essential information about the temple including location, contact details, visiting guidelines, and basic protocols.',
    chunks: [
      { id: 'c1', text: 'Temple address, directions, parking information, and contact details.' },
      { id: 'c2', text: 'Visiting guidelines, dress code, and general etiquette for devotees.' },
    ],
    processingLog: ['Uploaded', 'Text extracted', 'Summary generated', 'Chunked', 'Indexed'],
    approval: { reviewerId: 'beta@temple.org', reviewedAt: new Date(today.getTime() - 5 * 24 * 3600 * 1000).toISOString(), decision: 'approved' },
  },
  {
    id: 'doc-3',
    fileName: 'Temple_History_Draft.pdf',
    categoryId: 'cat-general',
    title: 'Temple History (Draft)',
    description: 'Draft document about temple history and significance.',
    tags: ['history', 'draft'],
    accessType: 'internal',
    uploadedBy: 'admin@temple.org',
    uploadedAt: new Date(today.getTime() - 3 * 24 * 3600 * 1000).toISOString(),
    uploadDate: yyyyMmDd(new Date(today.getTime() - 3 * 24 * 3600 * 1000)),
    version: 1,
    status: 'draft',
    processingLog: [],
  },
  {
    id: 'doc-4',
    fileName: 'Visitor_Guidelines.pdf',
    categoryId: 'cat-general',
    title: 'Visitor Guidelines',
    description: 'Guidelines for visitors and devotees.',
    tags: ['guidelines', 'visitors'],
    accessType: 'public',
    uploadedBy: 'admin@temple.org',
    uploadedAt: new Date(today.getTime() - 2 * 24 * 3600 * 1000).toISOString(),
    uploadDate: yyyyMmDd(new Date(today.getTime() - 2 * 24 * 3600 * 1000)),
    version: 1,
    status: 'processing',
    processingLog: ['Uploaded', 'Processing started'],
  },
  {
    id: 'doc-5',
    fileName: 'Temple_Services_Guide.pdf',
    categoryId: 'cat-general',
    title: 'Temple Services Guide',
    description: 'Complete guide to temple services and offerings.',
    tags: ['services', 'guide'],
    accessType: 'public',
    uploadedBy: 'admin@temple.org',
    uploadedAt: new Date(today.getTime() - 1 * 24 * 3600 * 1000).toISOString(),
    uploadDate: yyyyMmDd(new Date(today.getTime() - 1 * 24 * 3600 * 1000)),
    version: 1,
    status: 'uploaded',
    processingLog: ['Uploaded'],
  },
];

export const seedKnowledgeActivity: KnowledgeActivityEvent[] = [
  {
    id: 'evt-1',
    timestamp: new Date(today.getTime() - 7 * 24 * 3600 * 1000).toISOString(),
    actor: 'admin@temple.org',
    action: 'document_uploaded',
    entityType: 'document',
    entityId: 'doc-1',
    message: 'Uploaded "Temple Frequently Asked Questions".',
  },
  {
    id: 'evt-2',
    timestamp: new Date(today.getTime() - 6 * 24 * 3600 * 1000).toISOString(),
    actor: 'admin@temple.org',
    action: 'document_uploaded',
    entityType: 'document',
    entityId: 'doc-2',
    message: 'Uploaded "General Temple Information".',
  },
  {
    id: 'evt-3',
    timestamp: new Date(today.getTime() - 5 * 24 * 3600 * 1000).toISOString(),
    actor: 'beta@temple.org',
    action: 'document_approved',
    entityType: 'document',
    entityId: 'doc-2',
    message: 'Approved "General Temple Information".',
  },
  {
    id: 'evt-4',
    timestamp: new Date(today.getTime() - 3 * 24 * 3600 * 1000).toISOString(),
    actor: 'admin@temple.org',
    action: 'document_uploaded',
    entityType: 'document',
    entityId: 'doc-3',
    message: 'Uploaded "Temple History (Draft)".',
  },
  {
    id: 'evt-5',
    timestamp: new Date(today.getTime() - 2 * 24 * 3600 * 1000).toISOString(),
    actor: 'admin@temple.org',
    action: 'document_uploaded',
    entityType: 'document',
    entityId: 'doc-4',
    message: 'Uploaded "Visitor Guidelines".',
  },
  {
    id: 'evt-6',
    timestamp: new Date(today.getTime() - 1 * 24 * 3600 * 1000).toISOString(),
    actor: 'admin@temple.org',
    action: 'document_uploaded',
    entityType: 'document',
    entityId: 'doc-5',
    message: 'Uploaded "Temple Services Guide".',
  },
];

export const seedBetaSessions: KnowledgeBetaChatSession[] = [
  {
    id: 'beta-1',
    createdAt: new Date(today.getTime() - 5 * 3600 * 1000).toISOString(),
    scope: { categoryId: 'cat-general', includeNonPublished: true },
    messages: [
      { id: 'm1', role: 'user', content: 'What are the temple timings?', createdAt: new Date(today.getTime() - 5 * 3600 * 1000).toISOString() },
      { id: 'm2', role: 'assistant', content: 'The temple opening hours and darshan timings are available in the Temple FAQ document. Please check the general information section.', createdAt: new Date(today.getTime() - 5 * 3600 * 1000 + 60 * 1000).toISOString(), sources: [{ documentId: 'doc-1', title: 'Temple Frequently Asked Questions' }] },
    ],
    feedback: 'useful',
  },
];

