# Template Integration Flow - Quick Reference

## How Templates Work in Communication Center

### 📍 **Where Templates Are Used**

1. **Templates Management Page** (`/pr/communication/templates`)
   - Create, edit, delete templates
   - View all templates in a table
   - See usage statistics

2. **Manual Messages** (`ComposeMessageModal`)
   - Select template from dropdown (filtered by channel)
   - Auto-fills content and subject
   - Saves `templateId` with message

3. **Bulk Broadcast** (`BulkBroadcastModal`)
   - Same template selection as Manual Messages
   - Works with audience filters
   - Saves `templateId` with broadcast

4. **Scheduled Messages** (`ScheduledMessageModal`)
   - Template selection for scheduled/recurring messages
   - Saves `templateId` with scheduled message

### 🔄 **Template Selection Flow**

```
User Action → Template Selection → Auto-Population → Send → Storage
```

**Step-by-Step:**

1. **User selects channel** (SMS, Email, WhatsApp, Push)
   - Template dropdown filters to show only templates for that channel

2. **User selects template** (optional)
   - Content field auto-fills with template content
   - Subject field auto-fills (if email channel)
   - Channel may change to match template's channel
   - Template ID stored in component state

3. **User can edit content** (optional)
   - If user manually edits content → template selection clears
   - If user manually edits subject → template selection clears
   - User can still send message (without template reference)

4. **User sends message**
   - `templateId` included in message data
   - Message saved with template reference for tracking

### 🎯 **Key Features**

#### Template Filtering
- Templates filtered by selected channel
- Only relevant templates shown in dropdown
- Prevents channel/template mismatches

#### Auto-Population
- Content field: Populated from `template.content`
- Subject field: Populated from `template.subject` (if exists)
- Channel: Auto-set to `template.channel` (if different)

#### Smart Clearing
- Template selection clears when:
  - User manually edits content
  - User manually edits subject
  - User changes channel

#### Template Tracking
- `templateId` saved with every message
- Enables usage analytics
- Helps identify popular templates

### 📊 **Template Data Flow**

```
┌─────────────────┐
│ Template Store  │
│ (getTemplates)  │
└────────┬────────┘
         │
         │ Filter by channel
         ▼
┌─────────────────┐
│ Template Dropdown│
│ (Popover + Command)│
└────────┬────────┘
         │
         │ User selects template
         ▼
┌─────────────────┐
│ Auto-Populate   │
│ - content       │
│ - subject       │
│ - channel       │
└────────┬────────┘
         │
         │ User sends
         ▼
┌─────────────────┐
│ Message Storage │
│ (with templateId)│
└─────────────────┘
```

### 🔗 **Interconnections**

#### Templates ↔ Messages
- Templates used to create messages
- Messages store `templateId` for tracking
- Templates can be edited without affecting sent messages

#### Templates ↔ Channels
- Each template has a specific channel
- Templates filtered by channel in dropdowns
- Channel selection updates available templates

#### Templates ↔ Modals
- All three modals (Manual, Bulk, Scheduled) use same template system
- Consistent UX across all message types
- Same filtering and selection logic

### 💡 **Usage Examples**

#### Example 1: Using Template in Manual Message
1. Open "Compose Message" modal
2. Select "Email" channel
3. Click "Use Template" dropdown
4. Select "Event Reminder - Email"
5. Content and subject auto-fill
6. Add recipients and send
7. Message saved with `templateId: "TMP-001"`

#### Example 2: Customizing Template
1. Select template → content auto-fills
2. User edits content manually
3. Template selection automatically clears
4. User sends customized message
5. Message saved without `templateId` (user customized)

#### Example 3: Channel Change
1. User selects "SMS" channel
2. Template dropdown shows SMS templates
3. User changes to "Email" channel
4. Template selection clears
5. Template dropdown updates to show Email templates

### 📝 **Code Locations**

| Component | File Path | Template Integration |
|-----------|-----------|---------------------|
| Templates Page | `src/pages/pr/communication/Templates.tsx` | Create/edit/delete templates |
| Manual Messages | `src/components/pr/communication/ComposeMessageModal.tsx` | Template selection & usage |
| Bulk Broadcast | `src/components/pr/communication/BulkBroadcastModal.tsx` | Template selection & usage |
| Scheduled Messages | `src/components/pr/communication/ScheduledMessageModal.tsx` | Template selection & usage |
| Template Store | `src/lib/pr-communication-store.ts` | Template CRUD operations |
| Template Types | `src/types/pr-communication.ts` | `MessageTemplate` interface |

### ✅ **Template Integration Checklist**

- [x] Templates stored in centralized store
- [x] Templates filtered by channel in all modals
- [x] Template selection auto-populates content
- [x] Template selection auto-populates subject (email)
- [x] Template selection clears on manual edit
- [x] Template ID saved with messages
- [x] Template management UI (create/edit/delete)
- [x] Template usage tracking
- [x] Consistent UX across all modals

### 🚀 **Future Enhancements**

- Template variables ({{name}}, {{amount}})
- Template preview with sample data
- Template versioning
- Template A/B testing
- Template approval workflow
- Template sharing across roles
