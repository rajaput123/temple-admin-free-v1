// PR & Communication Module Types

export type CommunicationChannel = 
  | 'display_board'
  | 'website'
  | 'app'
  | 'sms'
  | 'whatsapp'
  | 'email'
  | 'social_media';

export type CommunicationStatus = 
  | 'draft'
  | 'pending_review'
  | 'pending_approval'
  | 'approved'
  | 'published'
  | 'expired'
  | 'cancelled';

export type MessagePriority = 
  | 'normal'
  | 'high'
  | 'urgent'
  | 'crisis';

export type DeliveryStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'read';

export type ApprovalLevel = 
  | 'content_editor'
  | 'pr_manager'
  | 'temple_admin'
  | 'trustee';

export type CrisisType = 
  | 'crowd_control'
  | 'delay'
  | 'incident'
  | 'weather'
  | 'emergency'
  | 'other';

export type SocialPlatform = 
  | 'facebook'
  | 'twitter'
  | 'instagram'
  | 'youtube'
  | 'whatsapp_business'
  | 'telegram';

export type MediaQueryStatus = 
  | 'pending'
  | 'responded'
  | 'escalated'
  | 'closed';

// Announcement & Notice
export interface Announcement {
  id: string;
  title: string;
  content: string;
  contentTranslations?: {
    language: string;
    title: string;
    content: string;
  }[];
  category: 'darshan' | 'seva' | 'festival' | 'maintenance' | 'closure' | 'general';
  channels: CommunicationChannel[];
  validityStart: string; // ISO date
  validityEnd: string; // ISO date
  status: CommunicationStatus;
  priority: MessagePriority;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedBy?: string;
  publishedAt?: string;
  version: number;
  previousVersions?: AnnouncementVersion[];
  isLocked: boolean; // Locked after publish
  autoExpire: boolean;
  expiryNotified: boolean;
}

export interface AnnouncementVersion {
  version: number;
  title: string;
  content: string;
  modifiedBy: string;
  modifiedAt: string;
  changeReason?: string;
}

// Devotee Communication
export interface DevoteeMessage {
  id: string;
  messageType: 'booking_confirmation' | 'reminder' | 'delay_alert' | 'reschedule' | 'general';
  recipientType: 'individual' | 'group' | 'all';
  recipientIds?: string[]; // Devotee IDs or booking IDs
  channels: CommunicationChannel[];
  subject?: string;
  content: string;
  contentTranslations?: {
    language: string;
    content: string;
  }[];
  status: CommunicationStatus;
  priority: MessagePriority;
  scheduledAt?: string; // For scheduled messages
  sentAt?: string;
  deliveryStatus: DeliveryStatus;
  deliveryDetails?: {
    channel: CommunicationChannel;
    status: DeliveryStatus;
    deliveredAt?: string;
    readAt?: string;
    errorMessage?: string;
  }[];
  optOutRespected: boolean;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  relatedBookingId?: string;
  relatedSevaId?: string;
  relatedFestivalId?: string;
}

// Media & Press Management
export interface PressRelease {
  id: string;
  title: string;
  content: string;
  embargoUntil?: string; // ISO date
  status: CommunicationStatus;
  priority: MessagePriority;
  spokespersonId?: string;
  mediaContacts?: string[]; // Media contact IDs
  approvedImages?: string[]; // Image URLs
  approvedVideos?: string[]; // Video URLs
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedBy?: string;
  publishedAt?: string;
  version: number;
  previousVersions?: PressReleaseVersion[];
  isLocked: boolean;
}

export interface PressReleaseVersion {
  version: number;
  title: string;
  content: string;
  modifiedBy: string;
  modifiedAt: string;
  changeReason?: string;
}

export interface Spokesperson {
  id: string;
  name: string;
  designation: string;
  contactNumber: string;
  email: string;
  authorizedFor: string[]; // Topics they can speak on
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface MediaContact {
  id: string;
  name: string;
  organization: string;
  designation: string;
  contactNumber: string;
  email: string;
  beat?: string; // Coverage area/topic
  isVerified: boolean;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface MediaQuery {
  id: string;
  queryText: string;
  mediaContactId: string;
  status: MediaQueryStatus;
  priority: MessagePriority;
  receivedAt: string;
  respondedAt?: string;
  responseText?: string;
  respondedBy?: string;
  escalatedTo?: string;
  escalatedAt?: string;
  relatedIncidentId?: string;
  notes?: string;
}

export interface PressBriefing {
  id: string;
  title: string;
  scheduledAt: string; // ISO date
  location: string;
  spokespersonId: string;
  mediaContactIds: string[];
  agenda: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// Crisis & Emergency Communication
export interface CrisisAlert {
  id: string;
  crisisType: CrisisType;
  title: string;
  content: string;
  contentTranslations?: {
    language: string;
    content: string;
  }[];
  priority: 'urgent' | 'crisis';
  channels: CommunicationChannel[];
  geoTargeted: boolean;
  geoLocation?: {
    zoneId?: string;
    coordinates?: { lat: number; lng: number };
    radius?: number; // meters
  };
  status: CommunicationStatus;
  isEmergencyOverride: boolean;
  emergencyJustification?: string;
  templateId?: string; // Pre-defined template
  validityStart: string;
  validityEnd?: string;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedBy?: string;
  publishedAt?: string;
  incidentTimeline?: CrisisIncidentEvent[];
  postIncidentAudit?: {
    auditedBy: string;
    auditedAt: string;
    findings: string;
    recommendations: string;
  };
}

export interface CrisisIncidentEvent {
  timestamp: string;
  event: string;
  description: string;
  actionTaken: string;
  recordedBy: string;
}

export interface CrisisTemplate {
  id: string;
  name: string;
  crisisType: CrisisType;
  titleTemplate: string;
  contentTemplate: string;
  defaultChannels: CommunicationChannel[];
  defaultPriority: MessagePriority;
  requiresGeoLocation: boolean;
  approvalWorkflow: ApprovalLevel[];
  createdBy: string;
  createdAt: string;
}

// Social & Digital Channels
export interface SocialChannel {
  id: string;
  platform: SocialPlatform;
  accountName: string;
  accountHandle: string;
  isOfficial: boolean;
  isActive: boolean;
  managedBy: string[]; // User IDs
  lastSyncedAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface SocialPost {
  id: string;
  channelId: string;
  platform: SocialPlatform;
  content: string;
  mediaUrls?: string[];
  scheduledAt?: string;
  status: CommunicationStatus;
  priority: MessagePriority;
  isPinned: boolean;
  pinnedUntil?: string;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationNotes?: string;
  moderationBy?: string;
  moderationAt?: string;
  publishedAt?: string;
  engagementMetrics?: {
    likes?: number;
    shares?: number;
    comments?: number;
    views?: number;
  };
  misinformationFlags?: {
    flaggedBy: string;
    flaggedAt: string;
    reason: string;
    resolved: boolean;
  }[];
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  version: number;
  previousVersions?: SocialPostVersion[];
  isLocked: boolean;
}

export interface SocialPostVersion {
  version: number;
  content: string;
  modifiedBy: string;
  modifiedAt: string;
  changeReason?: string;
}

export interface ContentCalendar {
  id: string;
  title: string;
  content: string;
  scheduledDate: string;
  scheduledTime?: string;
  channels: string[]; // Social channel IDs
  status: 'draft' | 'scheduled' | 'published' | 'cancelled';
  createdBy: string;
  createdAt: string;
}

// Approval & Governance
export interface CommunicationApproval {
  id: string;
  communicationType: 'announcement' | 'devotee_message' | 'press_release' | 'crisis_alert' | 'social_post';
  communicationId: string;
  currentLevel: ApprovalLevel;
  workflow: ApprovalLevel[];
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  requestedBy: string;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  isEmergencyOverride: boolean;
  emergencyJustification?: string;
  version: number;
  previousApprovals?: ApprovalHistory[];
}

export interface ApprovalHistory {
  level: ApprovalLevel;
  status: 'approved' | 'rejected';
  reviewedBy: string;
  reviewedAt: string;
  comments?: string;
}

export interface UnauthorizedAttempt {
  id: string;
  userId: string;
  action: string;
  communicationType: string;
  attemptedAt: string;
  blocked: boolean;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
}

// Communication Reports & Audit
export interface CommunicationMetrics {
  period: string; // Date range
  totalMessages: number;
  byChannel: {
    channel: CommunicationChannel;
    count: number;
    successRate: number;
  }[];
  byStatus: {
    status: CommunicationStatus;
    count: number;
  }[];
  deliverySuccessRate: number;
  averageResponseTime: number; // minutes
  crisisAlertsCount: number;
  unauthorizedAttemptsCount: number;
}

export interface CommunicationAuditLog {
  id: string;
  communicationType: string;
  communicationId: string;
  action: 'created' | 'edited' | 'approved' | 'rejected' | 'published' | 'expired' | 'cancelled' | 'emergency_override';
  performedBy: string;
  performedAt: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface DevoteeEngagementSummary {
  period: string;
  totalRecipients: number;
  messagesDelivered: number;
  messagesRead: number;
  optOuts: number;
  engagementRate: number;
  topMessageTypes: {
    type: string;
    count: number;
  }[];
}
