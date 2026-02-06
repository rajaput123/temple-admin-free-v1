// PR Module Integration Flows
// Auto-triggers between modules

import { useToast } from '@/components/ui/use-toast';
import type { TempleEvent, Announcement, FeedbackTicket, CommunicationChannel } from '@/types/communications';

/**
 * Event → Announcement Auto-Creation
 * When an event is published with autoCreateAnnouncement enabled,
 * automatically create a linked announcement
 */
export async function createAnnouncementFromEvent(
  event: TempleEvent,
  onSuccess?: (announcementId: string) => void
): Promise<string | null> {
  if (!event.autoCreateAnnouncement) {
    return null;
  }

  // In a real app, this would call the API
  const announcement: Partial<Announcement> = {
    title: `Event: ${event.title}`,
    content: `Join us for ${event.title} on ${new Date(event.startTime).toLocaleDateString()} at ${event.location || 'Temple'}. ${event.description}`,
    category: 'festival',
    audienceType: 'all',
    channels: ['website', 'app'],
    priority: event.priority,
    status: 'draft', // Requires approval
    validityStart: event.startTime,
    validityEnd: event.endTime,
    customFields: [
      {
        id: 'related-event-id',
        name: 'Related Event ID',
        type: 'text',
        value: event.id,
        required: false,
      },
    ],
  };

  // Simulate API call
  const announcementId = `ann-${Date.now()}`;
  
  if (onSuccess) {
    onSuccess(announcementId);
  }

  return announcementId;
}

/**
 * Announcement → Notification Auto-Trigger
 * When an announcement is published with 'app' channel,
 * automatically send push notification
 */
export async function triggerNotificationFromAnnouncement(
  announcement: Announcement,
  onSuccess?: () => void
): Promise<void> {
  if (!announcement.channels.includes('app')) {
    return;
  }

  // In a real app, this would queue a push notification
  console.log('Auto-triggering push notification for announcement:', announcement.id);
  
  if (announcement.channels.includes('sms') || announcement.channels.includes('whatsapp')) {
    // Queue in Broadcast Center
    console.log('Queuing SMS/WhatsApp in Broadcast Center');
  }

  if (onSuccess) {
    onSuccess();
  }
}

/**
 * Event → Notification Auto-Scheduling
 * When RSVP is enabled, schedule reminder notifications
 */
export async function scheduleEventReminders(
  event: TempleEvent,
  onSuccess?: () => void
): Promise<void> {
  if (!event.rsvpEnabled) {
    return;
  }

  const startTime = new Date(event.startTime);
  const reminders = [
    {
      time: new Date(startTime.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before
      message: `Event "${event.title}" is in 7 days. Don't forget to RSVP!`,
    },
    {
      time: new Date(startTime.getTime() - 24 * 60 * 60 * 1000), // 1 day before
      message: `Event "${event.title}" is tomorrow!`,
    },
    {
      time: new Date(startTime.getTime() - 2 * 60 * 60 * 1000), // 2 hours before
      message: `Event "${event.title}" starts in 2 hours!`,
    },
  ];

  // In a real app, this would schedule notifications
  console.log('Scheduling event reminders:', reminders);
  
  if (onSuccess) {
    onSuccess();
  }
}

/**
 * Feedback → Response Notification
 * When feedback status changes to "resolved",
 * automatically send notification to devotee
 */
export async function sendFeedbackResponseNotification(
  feedback: FeedbackTicket,
  response: string,
  onSuccess?: () => void
): Promise<void> {
  if (feedback.status !== 'resolved') {
    return;
  }

  // In a real app, this would send notification to the devotee
  const notification = {
    recipientId: feedback.userId,
    subject: `Response to your feedback: ${feedback.category}`,
    content: response,
    channels: ['app', 'email'] as CommunicationChannel[],
  };

  console.log('Sending feedback response notification:', notification);
  
  if (onSuccess) {
    onSuccess();
  }
}

/**
 * Volunteer → Event Assignment Notification
 * When volunteer is linked to event, send confirmation
 */
export async function sendVolunteerEventAssignmentNotification(
  volunteerId: string,
  event: TempleEvent,
  onSuccess?: () => void
): Promise<void> {
  const notification = {
    recipientId: volunteerId,
    subject: `You've been assigned to: ${event.title}`,
    content: `You have been assigned to help with "${event.title}" on ${new Date(event.startTime).toLocaleDateString()}. Please confirm your availability.`,
    channels: ['app', 'email', 'sms'] as CommunicationChannel[],
  };

  // Schedule reminder 1 day before event
  const reminderTime = new Date(new Date(event.startTime).getTime() - 24 * 60 * 60 * 1000);
  
  console.log('Sending volunteer assignment notification:', notification);
  console.log('Scheduling reminder for:', reminderTime);
  
  if (onSuccess) {
    onSuccess();
  }
}

/**
 * React Hook: Event → Announcement Integration
 */
export function useEventAnnouncementIntegration(eventId: string, autoCreate: boolean) {
  const { toast } = useToast();

  const createAnnouncement = async (event: TempleEvent) => {
    if (!autoCreate) return;
    
    try {
      const announcementId = await createAnnouncementFromEvent(event, (id) => {
        toast({
          title: 'Announcement Created',
          description: 'A draft announcement has been created from this event.',
        });
      });
      return announcementId;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create announcement from event.',
        variant: 'destructive',
      });
    }
  };

  return { createAnnouncement };
}

/**
 * React Hook: Announcement → Notification Integration
 */
export function useAnnouncementNotificationIntegration(announcementId: string, channels: CommunicationChannel[]) {
  const { toast } = useToast();

  const triggerNotifications = async (announcement: Announcement) => {
    try {
      await triggerNotificationFromAnnouncement(announcement, () => {
        toast({
          title: 'Notifications Triggered',
          description: 'Push notifications have been sent.',
        });
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to trigger notifications.',
        variant: 'destructive',
      });
    }
  };

  return { triggerNotifications };
}

/**
 * React Hook: Event Reminder Scheduling
 */
export function useEventReminderScheduling(eventId: string, rsvpEnabled: boolean) {
  const { toast } = useToast();

  const scheduleReminders = async (event: TempleEvent) => {
    if (!rsvpEnabled) return;
    
    try {
      await scheduleEventReminders(event, () => {
        toast({
          title: 'Reminders Scheduled',
          description: 'Event reminder notifications have been scheduled.',
        });
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to schedule reminders.',
        variant: 'destructive',
      });
    }
  };

  return { scheduleReminders };
}

/**
 * React Hook: Feedback Response Notification
 */
export function useFeedbackResponseNotification(feedbackId: string, status: string) {
  const { toast } = useToast();

  const sendResponse = async (feedback: FeedbackTicket, response: string) => {
    if (status !== 'resolved') return;
    
    try {
      await sendFeedbackResponseNotification(feedback, response, () => {
        toast({
          title: 'Response Sent',
          description: 'The devotee has been notified of your response.',
        });
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send response notification.',
        variant: 'destructive',
      });
    }
  };

  return { sendResponse };
}
