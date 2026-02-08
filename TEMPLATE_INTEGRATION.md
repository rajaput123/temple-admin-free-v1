# Template Integration in Communication Center

## Overview
Templates are reusable message structures that can be used across all communication features in the Communication Center. This document explains how templates are interconnected and used throughout the system.

## Template System Architecture

### 1. Template Storage & Management
- **Location**: `src/lib/pr-communication-store.ts`
- **Functions**:
  - `getTemplates()` - Retrieves all templates
  - `getTemplate(id)` - Gets a specific template by ID
  - `createTemplate(data)` - Creates a new template
  - `updateTemplate(id, updates)` - Updates an existing template
  - `deleteTemplate(id)` - Deletes a template

### 2. Template Data Structure
```typescript
interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  channel: MessageChannel; // 'sms' | 'email' | 'whatsapp' | 'push'
  subject?: string; // Optional, mainly for email
  content: string; // The message body
  variables?: string[]; // Dynamic variables like {{name}}, {{amount}}
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
```

## Template Usage Points

### 1. Templates Management Page
**Location**: `src/pages/pr/communication/Templates.tsx`

- **Purpose**: Central hub for creating, editing, and managing all templates
- **Features**:
  - View all templates in a table (`TemplatesLog`)
  - Create new templates via `TemplateModal`
  - Edit existing templates
  - Delete templates
  - See template usage statistics

**Components Used**:
- `TemplateModal` - Form for creating/editing templates
- `TemplatesLog` - Table displaying all templates with actions

### 2. Manual Messages
**Location**: `src/components/pr/communication/ComposeMessageModal.tsx`

- **Template Integration**:
  - Templates are filtered by selected channel
  - User can select a template from dropdown
  - When template is selected:
    - Message content is populated
    - Email subject is populated (if applicable)
    - Channel is automatically set to match template's channel
  - Template ID is saved with the message for tracking

**Flow**:
1. User selects channel (SMS, Email, WhatsApp, Push)
2. Template dropdown shows only templates matching that channel
3. User selects a template → content and subject auto-fill
4. User can edit the content (clears template selection)
5. On send, `templateId` is included in the message data

### 3. Bulk Broadcast
**Location**: `src/components/pr/communication/BulkBroadcastModal.tsx`

- **Template Integration**:
  - Same template selection mechanism as Manual Messages
  - Templates filtered by selected channel
  - Template content populates message field
  - Template ID saved with broadcast for analytics

**Flow**:
1. User selects audience (All, Donors, Volunteers, Custom)
2. User selects channel
3. Template dropdown shows channel-specific templates
4. Template selection auto-fills content and subject
5. Template ID saved with broadcast

### 4. Scheduled Messages
**Location**: `src/components/pr/communication/ScheduledMessageModal.tsx`

- **Template Integration**:
  - Templates available for scheduled messages
  - Same filtering and selection mechanism
  - Template ID saved for scheduled message tracking

**Flow**:
1. User sets up message details
2. Selects channel
3. Chooses template (optional)
4. Sets schedule/recurrence
5. Template ID saved with scheduled message

## Template Filtering Logic

Templates are filtered by channel to ensure only relevant templates are shown:

```typescript
const filteredTemplates = useMemo(() => {
  return templates.filter(t => t.channel === channel);
}, [channel, templates]);
```

This ensures:
- SMS templates only show when SMS channel is selected
- Email templates only show when Email channel is selected
- Prevents mismatched channel/template combinations

## Template Selection Behavior

### When Template is Selected:
1. **Content Field**: Populated with template's content
2. **Subject Field** (if email): Populated with template's subject
3. **Channel**: Automatically set to template's channel
4. **Template ID**: Stored in component state

### When User Edits Content:
- Template selection is cleared (user is customizing)
- Template ID is removed from state
- User can still send message without template reference

### When Channel Changes:
- Template selection is cleared
- Template dropdown updates to show new channel's templates
- Content and subject fields remain (user may want to keep them)

## Template Tracking

### Message Storage
When a message is sent using a template, the `templateId` is stored with the message:

```typescript
createMessage({
  // ... other fields
  templateId: selectedTemplate || undefined,
});
```

### Usage Analytics
The `TemplatesLog` component tracks template usage:
- Shows usage count for each template
- Helps identify most popular templates
- Aids in template optimization

## Email Subject Templates

In addition to full message templates, there are also **email subject templates** (hardcoded quick options):

**Location**: Defined in each modal component
- `ComposeMessageModal.tsx`
- `BulkBroadcastModal.tsx`
- `ScheduledMessageModal.tsx`

**Templates**:
- Important Announcement
- Event Reminder
- Meeting Invitation
- Update Notification
- Thank You Message
- Welcome Message
- Payment Reminder
- Service Update

These are separate from full message templates and are used only for quick subject line selection.

## Template Variables

Templates support dynamic variables (future enhancement):
- Variables defined in template: `{{name}}`, `{{amount}}`, `{{date}}`
- Variables replaced at send time with actual data
- Stored in `template.variables` array

## Integration Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Templates Management                       │
│  (Create, Edit, Delete, View All Templates)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ Templates stored in
                           │ pr-communication-store
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Manual     │  │    Bulk     │  │  Scheduled   │
│  Messages    │  │  Broadcast  │  │   Messages   │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       │ Filter by       │ Filter by       │ Filter by
       │ Channel         │ Channel         │ Channel
       │                 │                 │
       ▼                 ▼                 ▼
┌──────────────────────────────────────────────────┐
│         Template Selection Dropdown              │
│  (Shows only templates matching selected channel)│
└──────────────────────┬───────────────────────────┘
                       │
                       │ User selects template
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│  Auto-populate:                                   │
│  - Content field                                  │
│  - Subject field (if email)                      │
│  - Channel (if different)                        │
└──────────────────────┬───────────────────────────┘
                       │
                       │ User sends message
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│  Message saved with templateId for tracking       │
└──────────────────────────────────────────────────┘
```

## Key Files

1. **Template Store**: `src/lib/pr-communication-store.ts`
   - Template CRUD operations
   - Template retrieval functions

2. **Template Management UI**: `src/pages/pr/communication/Templates.tsx`
   - Main templates page
   - Template creation/editing

3. **Template Components**:
   - `src/components/pr/communication/TemplateModal.tsx` - Template form
   - `src/components/pr/communication/TemplatesLog.tsx` - Template table

4. **Template Usage in Modals**:
   - `src/components/pr/communication/ComposeMessageModal.tsx`
   - `src/components/pr/communication/BulkBroadcastModal.tsx`
   - `src/components/pr/communication/ScheduledMessageModal.tsx`

5. **Template Types**: `src/types/pr-communication.ts`
   - `MessageTemplate` interface definition

## Best Practices

1. **Template Naming**: Use descriptive names that indicate purpose and channel
   - Example: "Event Reminder - SMS", "Donation Thank You - Email"

2. **Template Categories**: Organize templates by purpose
   - Announcements, Reminders, Thank You, Welcome, etc.

3. **Channel-Specific Templates**: Create separate templates for each channel
   - SMS templates should be concise (160 chars)
   - Email templates can be longer with rich formatting
   - WhatsApp templates follow conversational style

4. **Template Variables**: Use variables for personalization
   - `{{name}}` for recipient name
   - `{{amount}}` for donation amounts
   - `{{date}}` for event dates

5. **Template Reusability**: Design templates to be reusable across different contexts
   - Avoid hardcoding specific details
   - Use variables for dynamic content

## Future Enhancements

1. **Template Versioning**: Track template changes over time
2. **Template A/B Testing**: Test different template variations
3. **Template Analytics**: Detailed usage statistics and performance metrics
4. **Template Preview**: Preview templates with sample data before sending
5. **Template Sharing**: Share templates across different user roles
6. **Template Approval Workflow**: Require approval for template creation/modification
