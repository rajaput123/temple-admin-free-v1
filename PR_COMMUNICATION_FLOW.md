# PR & Communication Module - Admin Flow Verification

## Module Structure
- **Base Path**: `/pr`
- **Default Route**: `/pr/announcements` (redirects from `/pr/*`)

## Sub-Modules & Routes

### 1. Announcements & Notices (`/pr/announcements`)
- **Purpose**: Manage temple announcements, notices, and public communications
- **Features**:
  - Create/Edit/Delete announcements
  - Multilingual content support
  - Channel selection (display board, website, app, SMS, WhatsApp)
  - Validity period management
  - Status tracking (Draft → Pending Review → Pending Approval → Approved → Published)
  - Auto-expiry handling
  - Version history
- **Admin Actions**:
  - ✅ View all announcements
  - ✅ Create new announcement (if `canWrite`)
  - ✅ Edit draft announcements
  - ✅ Delete draft announcements
  - ✅ View announcement details
  - ⚠️ Approval workflow (buttons present but not connected)
  - ⚠️ Publish action (button present but not connected)

### 2. Devotee Communication (`/pr/devotees`)
- **Purpose**: Manage targeted messaging to devotees
- **Features**:
  - Booking-linked notifications
  - Reminder messages
  - Delay/reschedule alerts
  - Multi-channel delivery (SMS, WhatsApp, Email, App)
  - Delivery status tracking
  - Opt-out compliance
- **Admin Actions**:
  - ✅ View all messages
  - ✅ Create new message (if `canWrite`)
  - ✅ View delivery status
  - ⚠️ Send message action (button present but not connected)
  - ⚠️ Message scheduling (UI present but not functional)

### 3. Media & Press Management (`/pr/media`)
- **Purpose**: Manage press releases, spokesperson, media contacts, and queries
- **Features**:
  - Press release drafting and archival
  - Spokesperson management
  - Media contact directory
  - Media query tracking
  - Press briefing scheduling
  - Embargo handling
- **Admin Actions**:
  - ✅ View press releases (tab)
  - ✅ View spokespersons (tab)
  - ✅ View media contacts (tab)
  - ✅ View media queries (tab)
  - ✅ View press briefings (tab)
  - ✅ Create new press release (if `canWrite`)
  - ✅ Add spokesperson (if `canWrite`)
  - ✅ Add media contact (if `canWrite`)
  - ✅ Schedule briefing (if `canWrite`)
  - ⚠️ Edit/Delete actions (buttons present but not connected)
  - ⚠️ Respond to media queries (UI present but not functional)

### 4. Crisis & Emergency Communication (`/pr/crisis`)
- **Purpose**: Manage crisis alerts and emergency broadcasts
- **Features**:
  - Crisis alert creation
  - Pre-defined crisis templates
  - Priority broadcast mode
  - Geo-targeted alerts
  - Emergency override
  - Incident timeline logging
- **Admin Actions**:
  - ✅ View crisis alerts (tab)
  - ✅ View crisis templates (tab)
  - ✅ Create new crisis alert (if `canWrite`)
  - ✅ Create new template (if `canWrite`)
  - ⚠️ Emergency override workflow (UI present but not functional)
  - ⚠️ Geo-targeting configuration (UI present but not functional)

### 5. Social & Digital Channels (`/pr/digital`)
- **Purpose**: Manage official social media accounts and content
- **Features**:
  - Social channel management
  - Content publishing calendar
  - Post moderation workflow
  - Engagement metrics
  - Misinformation monitoring
- **Admin Actions**:
  - ✅ View social channels (tab)
  - ✅ View social posts (tab)
  - ✅ View content calendar (tab)
  - ✅ Create new post (if `canWrite`)
  - ✅ Add channel (if `canWrite`)
  - ✅ Schedule content (if `canWrite`)
  - ⚠️ Moderation actions (UI present but not functional)
  - ⚠️ Engagement metrics (displayed but not real-time)

### 6. Approval & Governance (`/pr/approvals`)
- **Purpose**: Manage communication approvals and unauthorized access
- **Features**:
  - Multi-level approval workflows
  - Approval status tracking
  - Emergency override tracking
  - Unauthorized attempt logging
- **Admin Actions**:
  - ✅ View pending approvals
  - ✅ View approval history
  - ✅ View unauthorized attempts
  - ✅ Approve/Reject (if `canApprove`)
  - ⚠️ Approval workflow routing (UI present but not functional)
  - ⚠️ Emergency override justification (UI present but not functional)

### 7. Communication Reports & Audit (`/pr/reports`)
- **Purpose**: View communication metrics and audit trails
- **Features**:
  - Channel-wise performance metrics
  - Delivery success rates
  - Status breakdown
  - Crisis alert statistics
  - Complete audit trail
- **Admin Actions**:
  - ✅ View metrics & analytics (tab)
  - ✅ View audit trail (tab)
  - ✅ Export reports (UI present but not functional)
  - ⚠️ Date range filtering (UI present but not functional)

## Navigation Flow (Admin Perspective)

### Entry Points:
1. **From Hub**: Click "PR & Communication" → Redirects to `/pr/announcements`
2. **From Sidebar**: Click "PR & Communication" → Shows sub-modules
3. **Direct URL**: Navigate to `/pr/*` → Redirects to `/pr/announcements`

### Sidebar Navigation:
- All 7 sub-modules visible in sidebar
- Active state highlighting works
- Navigation between sub-modules works

### User Roles & Permissions:

#### PR Admin (`pr_admin`):
- ✅ Full access to all sub-modules
- ✅ Create, edit, delete, publish
- ✅ Approve/reject communications
- ✅ Emergency override capability
- ✅ View all reports and audit logs

#### PR Manager (`pr_manager`):
- ✅ Read/write access
- ✅ Publish announcements
- ✅ Send devotee messages
- ✅ Approve media releases
- ✅ Approve/reject workflows
- ❌ No delete access
- ❌ No emergency override

#### Content Editor (`content_editor`):
- ✅ Create drafts
- ✅ Edit drafts
- ❌ Cannot publish
- ❌ Cannot approve
- ❌ Read-only on reports

#### Spokesperson (`spokesperson`):
- ✅ Read communications
- ✅ Write media statements
- ❌ Limited access

#### Digital Team (`digital_team`):
- ✅ Manage social posts
- ✅ Moderate content
- ❌ Limited to social channels

## Current Status

### ✅ Working:
- All 7 pages render correctly
- Navigation between sub-modules works
- Sidebar highlighting works
- Permission checks work
- Data tables display dummy data
- Summary cards show metrics
- Filters and search work
- Status badges display correctly

### ⚠️ Partially Implemented (UI Only):
- Create/Edit modals (buttons present but modals not implemented)
- Approval workflows (buttons present but actions not connected)
- Send message functionality
- Publish actions
- Emergency override workflow
- Geo-targeting configuration
- Moderation actions
- Export functionality

### ❌ Missing:
- Form modals for creating/editing entities
- Approval workflow logic
- Message sending integration
- Publishing workflow
- Real-time updates
- Date range filters
- Export to CSV/PDF

## Admin User Test Accounts

Added to `AuthContext.tsx`:
- `pradmin@temple.org` - PR Admin (full access)
- `prmanager@temple.org` - PR Manager (approve/publish)
- `contenteditor@temple.org` - Content Editor (drafts only)

## Recommendations

1. **Implement Form Modals**: Create modals for all "New" buttons
2. **Connect Approval Workflows**: Implement approval/reject actions
3. **Add Publishing Logic**: Connect publish buttons to actual workflow
4. **Implement Message Sending**: Connect send message functionality
5. **Add Export Features**: Implement CSV/PDF export for reports
6. **Add Date Filters**: Implement date range filtering in reports
7. **Real-time Updates**: Add real-time status updates for messages
