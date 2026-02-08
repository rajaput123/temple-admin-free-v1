import type {
  Announcement,
  Message,
  MessageTemplate,
  DeliveryReport,
  SocialPost,
  LiveStream,
  CommunityPost,
  SupportTicket,
  PRCommunicationSettings,
} from '@/types/pr-communication';
import {
  mockAnnouncements,
  mockMessages,
  mockTemplates,
  mockDeliveryReports,
  mockSocialPosts,
  mockLiveStreams,
  mockCommunityPosts,
  mockSupportTickets,
} from '@/data/pr-communication-dummy-data';

const STORAGE_KEY = 'pr_communication_store_v1';

interface PRCommunicationStoreState {
  announcements: Announcement[];
  messages: Message[];
  templates: MessageTemplate[];
  deliveryReports: DeliveryReport[];
  socialPosts: SocialPost[];
  liveStreams: LiveStream[];
  communityPosts: CommunityPost[];
  supportTickets: SupportTicket[];
  settings: PRCommunicationSettings;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function initState(): PRCommunicationStoreState {
  try {
    // Ensure all mock data arrays exist, default to empty arrays if missing
    return {
      announcements: Array.isArray(mockAnnouncements) ? mockAnnouncements : [],
      messages: Array.isArray(mockMessages) ? mockMessages : [],
      templates: Array.isArray(mockTemplates) ? mockTemplates : [],
      deliveryReports: Array.isArray(mockDeliveryReports) ? mockDeliveryReports : [],
      socialPosts: Array.isArray(mockSocialPosts) ? mockSocialPosts : [],
      liveStreams: Array.isArray(mockLiveStreams) ? mockLiveStreams : [],
      communityPosts: Array.isArray(mockCommunityPosts) ? mockCommunityPosts : [],
      supportTickets: Array.isArray(mockSupportTickets) ? mockSupportTickets : [],
      settings: {
        approvalRequired: {
          announcements: true,
          bulkMessages: true,
          socialPosts: true,
          communityPosts: true,
        },
        sendingLimits: {
          dailyMessageLimit: 10000,
          smsCostLimit: 5000,
          bulkSendThreshold: 1000,
        },
        emergencyControls: {
          killSwitchEnabled: false,
          emergencyOverrideEnabled: true,
        },
      },
    };
  } catch (error) {
    console.error('[PR Store] Error initializing state:', error);
    // Return minimal valid state structure
    return {
      announcements: [],
      messages: [],
      templates: [],
      deliveryReports: [],
      socialPosts: [],
      liveStreams: [],
      communityPosts: [],
      supportTickets: [],
      settings: {
        approvalRequired: {
          announcements: true,
          bulkMessages: true,
          socialPosts: true,
          communityPosts: true,
        },
        sendingLimits: {
          dailyMessageLimit: 10000,
          smsCostLimit: 5000,
          bulkSendThreshold: 1000,
        },
        emergencyControls: {
          killSwitchEnabled: false,
          emergencyOverrideEnabled: true,
        },
      },
    };
  }
}

export function getPRCommunicationState(): PRCommunicationStoreState {
  try {
    const stored = safeParse<PRCommunicationStoreState>(sessionStorage.getItem(STORAGE_KEY));
    if (stored) {
      // Validate stored data structure
      if (stored.announcements && Array.isArray(stored.announcements) &&
          stored.messages && Array.isArray(stored.messages) &&
          stored.liveStreams && Array.isArray(stored.liveStreams) &&
          stored.supportTickets && Array.isArray(stored.supportTickets)) {
        return stored;
      } else {
        console.warn('[PR Store] Stored data structure invalid, reinitializing');
      }
    }
    const initial = initState();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch (error) {
    console.error('[PR Store] Error getting state:', error);
    // Return fresh state on error
    const initial = initState();
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch (storageError) {
      console.error('[PR Store] Error saving initial state:', storageError);
    }
    return initial;
  }
}

export function setPRCommunicationState(state: PRCommunicationStoreState): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Announcement operations
export function getAnnouncements(): Announcement[] {
  try {
    const state = getPRCommunicationState();
    const announcements = state.announcements;
    if (Array.isArray(announcements)) {
      return announcements;
    }
    console.warn('[PR Store] Announcements is not an array, returning empty array');
    return [];
  } catch (error) {
    console.error('[PR Store] Error getting announcements:', error);
    return [];
  }
}

export function getAnnouncement(id: string): Announcement | undefined {
  return getAnnouncements().find(a => a.id === id);
}

export function createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Announcement {
  const state = getPRCommunicationState();
  const newAnnouncement: Announcement = {
    ...announcement,
    id: `ANN-${String(state.announcements.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.announcements.push(newAnnouncement);
  setPRCommunicationState(state);
  return newAnnouncement;
}

export function updateAnnouncement(id: string, updates: Partial<Announcement>): Announcement | null {
  const state = getPRCommunicationState();
  const index = state.announcements.findIndex(a => a.id === id);
  if (index === -1) return null;
  state.announcements[index] = {
    ...state.announcements[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  setPRCommunicationState(state);
  return state.announcements[index];
}

export function deleteAnnouncement(id: string): boolean {
  const state = getPRCommunicationState();
  const index = state.announcements.findIndex(a => a.id === id);
  if (index === -1) return false;
  state.announcements.splice(index, 1);
  setPRCommunicationState(state);
  return true;
}

export function publishAnnouncement(id: string, approvedBy?: string): Announcement | null {
  const announcement = getAnnouncement(id);
  if (!announcement) return null;
  return updateAnnouncement(id, {
    status: 'published',
    approvedBy,
    approvedAt: approvedBy ? new Date().toISOString() : undefined,
    publishDate: new Date().toISOString().split('T')[0],
  });
}

// Message operations
export function getMessages(): Message[] {
  try {
    const state = getPRCommunicationState();
    const messages = state.messages;
    if (Array.isArray(messages)) {
      return messages;
    }
    console.warn('[PR Store] Messages is not an array, returning empty array');
    return [];
  } catch (error) {
    console.error('[PR Store] Error getting messages:', error);
    return [];
  }
}

export function getMessage(id: string): Message | undefined {
  return getMessages().find(m => m.id === id);
}

export function createMessage(message: Omit<Message, 'id' | 'createdAt'>): Message {
  const state = getPRCommunicationState();
  const newMessage: Message = {
    ...message,
    id: `MSG-${String(state.messages.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
  };
  state.messages.push(newMessage);
  setPRCommunicationState(state);
  return newMessage;
}

export function sendBulkBroadcast(broadcast: Omit<Message, 'id' | 'createdAt' | 'type'> & { audienceFilter: any }): Message {
  const message = createMessage({
    ...broadcast,
    type: 'bulk',
  });
  return message;
}

export function deleteMessage(id: string): boolean {
  const state = getPRCommunicationState();
  const index = state.messages.findIndex(m => m.id === id);
  if (index === -1) return false;
  state.messages.splice(index, 1);
  setPRCommunicationState(state);
  return true;
}

export function scheduleMessage(message: Omit<Message, 'id' | 'createdAt' | 'type'> & { scheduledAt: string }): Message {
  return createMessage({
    ...message,
    type: 'scheduled',
    status: 'scheduled',
  });
}

// Template operations
export function getTemplates(): MessageTemplate[] {
  return getPRCommunicationState().templates;
}

export function getTemplate(id: string): MessageTemplate | undefined {
  return getTemplates().find(t => t.id === id);
}

export function createTemplate(template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>): MessageTemplate {
  const state = getPRCommunicationState();
  const newTemplate: MessageTemplate = {
    ...template,
    id: `TMP-${String(state.templates.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.templates.push(newTemplate);
  setPRCommunicationState(state);
  return newTemplate;
}

export function updateTemplate(id: string, updates: Partial<MessageTemplate>): MessageTemplate | null {
  const state = getPRCommunicationState();
  const index = state.templates.findIndex(t => t.id === id);
  if (index === -1) return null;
  state.templates[index] = {
    ...state.templates[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  setPRCommunicationState(state);
  return state.templates[index];
}

export function deleteTemplate(id: string): boolean {
  const state = getPRCommunicationState();
  const index = state.templates.findIndex(t => t.id === id);
  if (index === -1) return false;
  state.templates.splice(index, 1);
  setPRCommunicationState(state);
  return true;
}

// Delivery Report operations
export function getDeliveryReports(): DeliveryReport[] {
  return getPRCommunicationState().deliveryReports;
}

export function getDeliveryReportsByMessage(messageId: string): DeliveryReport[] {
  return getDeliveryReports().filter(r => r.messageId === messageId);
}

export function updateDeliveryReport(id: string, updates: Partial<DeliveryReport>): DeliveryReport | null {
  const state = getPRCommunicationState();
  const index = state.deliveryReports.findIndex(r => r.id === id);
  if (index === -1) return null;
  state.deliveryReports[index] = {
    ...state.deliveryReports[index],
    ...updates,
  };
  setPRCommunicationState(state);
  return state.deliveryReports[index];
}

// Social Post operations
export function getSocialPosts(): SocialPost[] {
  return getPRCommunicationState().socialPosts;
}

export function createSocialPost(post: Omit<SocialPost, 'id' | 'createdAt' | 'engagement'>): SocialPost {
  const state = getPRCommunicationState();
  const newPost: SocialPost = {
    ...post,
    id: `SOC-${String(state.socialPosts.length + 1).padStart(3, '0')}`,
    engagement: {
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
    },
    createdAt: new Date().toISOString(),
  };
  state.socialPosts.push(newPost);
  setPRCommunicationState(state);
  return newPost;
}

// Live Stream operations
export function getLiveStreams(): LiveStream[] {
  try {
    const state = getPRCommunicationState();
    const liveStreams = state.liveStreams;
    if (Array.isArray(liveStreams)) {
      return liveStreams;
    }
    console.warn('[PR Store] LiveStreams is not an array, returning empty array');
    return [];
  } catch (error) {
    console.error('[PR Store] Error getting live streams:', error);
    return [];
  }
}

export function getLiveStream(id: string): LiveStream | undefined {
  return getLiveStreams().find(s => s.id === id);
}

export function createLiveStream(stream: Omit<LiveStream, 'id' | 'createdAt' | 'updatedAt' | 'viewerCount' | 'peakViewerCount' | 'logs'>): LiveStream {
  const state = getPRCommunicationState();
  const newStream: LiveStream = {
    ...stream,
    id: `STR-${String(state.liveStreams.length + 1).padStart(3, '0')}`,
    viewerCount: 0,
    peakViewerCount: 0,
    logs: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.liveStreams.push(newStream);
  setPRCommunicationState(state);
  return newStream;
}

export function startLiveStream(id: string, userId: string): LiveStream | null {
  const state = getPRCommunicationState();
  const stream = state.liveStreams.find(s => s.id === id);
  if (!stream) return null;
  
  stream.status = 'live';
  stream.actualStartTime = new Date().toISOString();
  stream.updatedAt = new Date().toISOString();
  
  stream.logs.push({
    id: `LOG-${Date.now()}`,
    streamId: id,
    action: 'started',
    message: 'Stream started successfully',
    timestamp: new Date().toISOString(),
    userId,
  });
  
  setPRCommunicationState(state);
  return stream;
}

export function stopLiveStream(id: string, userId: string): LiveStream | null {
  const state = getPRCommunicationState();
  const stream = state.liveStreams.find(s => s.id === id);
  if (!stream) return null;
  
  stream.status = 'ended';
  stream.endTime = new Date().toISOString();
  stream.updatedAt = new Date().toISOString();
  
  stream.logs.push({
    id: `LOG-${Date.now()}`,
    streamId: id,
    action: 'stopped',
    message: 'Stream ended',
    timestamp: new Date().toISOString(),
    userId,
  });
  
  setPRCommunicationState(state);
  return stream;
}

export function updateStreamStatus(id: string, status: LiveStream['status'], viewerCount?: number): LiveStream | null {
  const state = getPRCommunicationState();
  const stream = state.liveStreams.find(s => s.id === id);
  if (!stream) return null;
  
  stream.status = status;
  if (viewerCount !== undefined) {
    stream.viewerCount = viewerCount;
    if (viewerCount > stream.peakViewerCount) {
      stream.peakViewerCount = viewerCount;
    }
  }
  stream.updatedAt = new Date().toISOString();
  
  setPRCommunicationState(state);
  return stream;
}

export function addStreamLog(streamId: string, log: Omit<LiveStream['logs'][0], 'id' | 'streamId' | 'timestamp'>): void {
  const state = getPRCommunicationState();
  const stream = state.liveStreams.find(s => s.id === streamId);
  if (!stream) return;
  
  stream.logs.push({
    ...log,
    id: `LOG-${Date.now()}`,
    streamId,
    timestamp: new Date().toISOString(),
  });
  
  setPRCommunicationState(state);
}

// Community Post operations
export function getCommunityPosts(): CommunityPost[] {
  return getPRCommunicationState().communityPosts;
}

export function approveCommunityPost(id: string, approvedBy: string): CommunityPost | null {
  const state = getPRCommunicationState();
  const post = state.communityPosts.find(p => p.id === id);
  if (!post) return null;
  
  post.status = 'approved';
  post.approvedBy = approvedBy;
  post.approvedAt = new Date().toISOString();
  
  setPRCommunicationState(state);
  return post;
}

// Support Ticket operations
export function getSupportTickets(): SupportTicket[] {
  try {
    const state = getPRCommunicationState();
    const supportTickets = state.supportTickets;
    if (Array.isArray(supportTickets)) {
      return supportTickets;
    }
    console.warn('[PR Store] SupportTickets is not an array, returning empty array');
    return [];
  } catch (error) {
    console.error('[PR Store] Error getting support tickets:', error);
    return [];
  }
}

export function getSupportTicket(id: string): SupportTicket | undefined {
  return getSupportTickets().find(t => t.id === id);
}

export function createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>): SupportTicket {
  const state = getPRCommunicationState();
  const ticketNumber = `TKT-${new Date().getFullYear()}-${String(state.supportTickets.length + 1).padStart(3, '0')}`;
  const newTicket: SupportTicket = {
    ...ticket,
    id: `TKT-${String(state.supportTickets.length + 1).padStart(3, '0')}`,
    ticketNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.supportTickets.push(newTicket);
  setPRCommunicationState(state);
  return newTicket;
}

export function updateSupportTicket(id: string, updates: Partial<SupportTicket>): SupportTicket | null {
  const state = getPRCommunicationState();
  const index = state.supportTickets.findIndex(t => t.id === id);
  if (index === -1) return null;
  state.supportTickets[index] = {
    ...state.supportTickets[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  setPRCommunicationState(state);
  return state.supportTickets[index];
}
