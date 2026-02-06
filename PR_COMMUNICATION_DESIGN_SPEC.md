# PR & Communication Module – Technical Design Specification

## 1. Overview
The **PR & Communication Module** is a centralized system within the Temple Management ERP designed to manage all external and internal communications. It unifies announcements, event calendars, newsletters, media management, grievance handling, and volunteer coordination into a single cohesive interface.

**Target Audience:** Super Admin, Temple Admin, PR Manager, Volunteer Coordinator, Devotee, Donor.

---

## 2. Functional Requirements & Sub-Modules

### 2.1 Announcements Management
**Purpose:** Disseminate official updates to devotees.
*   **Key Features:**
    *   Rich Text Editor for content.
    *   Media support (Images/Videos).
    *   Priority tagging (Urgent vs. General).
    *   Audience targeting (All, Donors, Volunteers, etc.).
    *   Scheduling (Publish At, Expire At).
    *   Workflow: Draft → Review → Publish → Archive.
    *   Engagement tracking (Views, Clicks).

### 2.2 Events Calendar
**Purpose:** Manage and showcase temple events.
*   **Key Features:**
    *   Event Types: Festival, Seva, Cultural, Religious.
    *   Recurring events support.
    *   Capacity management & RSVP tracking.
    *   Volunteer assignment to events.
    *   Calendar Views: Month, Week, Day.
    *   Automated reminder notifications.

### 2.3 Push Notifications & Deep Linking
**Purpose:** Instant mobile engagement.
*   **Key Features:**
    *   Instant & Scheduled notifications.
    *   Deep linking to specific app screens (e.g., specific event or donation page).
    *   Audience segmentation.
    *   Delivery tracking (Sent, Delivered, Read).
    *   Notification history log.

### 2.4 Multi-Channel Messaging (SMS/Email/WhatsApp)
**Purpose:** Broad reach communication.
*   **Key Features:**
    *   Bulk messaging capabilities.
    *   Template management with dynamic placeholders (e.g., `{devotee_name}`).
    *   Integration with third-party providers (e.g., Twilio, SendGrid).
    *   Delivery report tracking.
    *   Message scheduling (Campaigns).

### 2.5 Newsletter Management
**Purpose:** Periodic long-form content.
*   **Key Features:**
    *   Drag-and-drop template builder.
    *   Subscriber list management & segmentation.
    *   Automated monthly digests.
    *   Analytics: Open rates, Click-through rates, Bounce rates.
    *   Export functionality for subscriber lists (CSV/Excel).
    *   Unsubscribe management.

### 2.6 Media & Press Management
**Purpose:** Manage public image and assets.
*   **Key Features:**
    *   Centralized Media Library (Photos/Videos).
    *   Press Release publishing (with embargo dates).
    *   Social Media sharing integration (direct post to FB/Twitter).
    *   Live Event link management.
    *   Archival of past media coverage.
    *   Media contact database management.

### 2.7 Feedback & Grievance Management
**Purpose:** Listen and respond to devotee concerns.
*   **Key Features:**
    *   Digital Ticket creation with category selection (Facilities, Prasadam, etc.).
    *   Status Lifecycle: Open → In Progress → Resolved.
    *   Admin response portal with internal notes.
    *   Escalation workflow for breach of SLA (Service Level Agreement).
    *   SLA tracking and overdue alerts.

### 2.8 Volunteer Communication
**Purpose:** Coordinate operational workforce.
*   **Key Features:**
    *   Task assignment & tracking.
    *   Shift notifications and reminders.
    *   Event-based volunteer groups (e.g., "Maha Shivaratri Team").
    *   Emergency broadcasts to volunteers.
    *   Attendance tracking for events/shifts.

---

## 3. System Requirements
*   **Role-Based Access Control (RBAC):** Granular permissions for PR Admin, Editor, etc.
*   **Multi-Tenancy:** Isolation of data per temple.
*   **Multi-Language:** Content support for regional languages.
*   **Scalability:** Handling high traffic during festivals.
*   **Audit Logs:** Tracking who posted what and when.

---

## 4. API Specification & User Flows

| Module | Sub-Module | Endpoint | Method | Functional Description | Request Body Example | Response | UI Flow |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Announcements** | Create | `/api/announcements` | POST | Create new announcement | `{ "title": "...", "priority": "Urgent", "publishAt": "..." }` | `{ "id": "uuid", "msg": "Created" }` | PR → Announcements → +Create → Save |
| **Announcements** | List | `/api/announcements` | GET | List with filters | `?status=published&page=1` | `[ { "id": "...", "title": "..." } ]` | PR → Announcements (Table View) |
| **Events** | Create | `/api/events` | POST | Create event with RSVP | `{ "title": "Festival", "capacity": 500, "rsvp": true }` | `{ "id": "uuid", "msg": "Created" }` | PR → Events → +Add Event → Save |
| **Events** | RSVP | `/api/events/:id/rsvp` | POST | Devotee confirms attendance | `{ "userId": "...", "count": 2 }` | `{ "msg": "Confirmed", "seatsLeft": 48 }` | Mobile → Event → RSVP → Confirm |
| **Notifications** | Send | `/api/notifications` | POST | Send push notification | `{ "message": "...", "deepLink": "/events/123" }` | `{ "jobId": "...", "status": "Queued" }` | PR → Notifications → Compose → Send |
| **Messaging** | Broadcast | `/api/messages/broadcast` | POST | Bulk SMS/Email/WA | `{ "channel": "SMS", "templateId": "tmpl_1", "users": [] }` | `{ "batchId": "..." }` | PR → Broadcast → Select Channel → Send |
| **Newsletter** | Create | `/api/newsletters` | POST | Create & Schedule Newsletter | `{ "subject": "Monthly Digest", "content": "<html>..." }` | `{ "id": "...", "status": "Scheduled" }` | PR → Newsletter → Editor → Schedule |
| **Media** | Upload | `/api/media` | POST | Upload asset | `{ "file": (binary), "category": "Event" }` | `{ "url": "https://...", "id": "..." }` | PR → Media → Upload Modal → Save |
| **Feedback** | Submit | `/api/feedback` | POST | Devotee submits grievance | `{ "category": "Hygiene", "desc": "..." }` | `{ "ticketId": "TK-101" }` | Mobile → Feedback → Submit |
| **Feedback** | Update | `/api/feedback/:id` | PATCH | Admin updates status | `{ "status": "Resolved", "response": "Fixed." }` | `{ "msg": "Updated" }` | PR → Feedback → Ticket → Reply |
| **Volunteer** | Broadcast | `/api/volunteers/broadcast` | POST | Alert volunteers | `{ "msg": "Report to Kitchen", "priority": "High" }` | `{ "sentCount": 45 }` | PR → Broadcast → Filter Volunteers → Send |

---

## 5. Proposed Data Model (Schema Overview)

### `announcements`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `temple_id` | UUID | Foreign Key (Tenant) |
| `title` | String | |
| `content` | Text/HTML | |
| `media_urls` | JSON[] | Array of attachment URLs |
| `priority` | Enum | `URGENT`, `GENERAL` |
| `audience_type` | Enum | `ALL`, `DONORS`, `VOLUNTEERS` |
| `publish_at` | Timestamp | Scheduled time |
| `expire_at` | Timestamp | Auto-removal time |
| `status` | Enum | `DRAFT`, `PUBLISHED`, `ARCHIVED` |

### `events`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `title` | String | |
| `start_time` | Timestamp | |
| `end_time` | Timestamp | |
| `category` | Enum | `FESTIVAL`, `SEVA`, `CULTURAL` |
| `capacity` | Integer | Max attendees |
| `rsvp_enabled` | Boolean | |
| `rsvp_count` | Integer | Current confirmations |

### `feedback_tickets`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Reporter |
| `category` | String | |
| `description` | Text | |
| `status` | Enum | `OPEN`, `IN_PROGRESS`, `RESOLVED` |
| `admin_notes` | Text | Internal tracking notes |
| `response` | Text | Public response to user |

### `notification_logs`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `type` | Enum | `PUSH`, `SMS`, `EMAIL`, `WHATSAPP` |
| `recipient_id` | UUID | |
| `content` | Text | |
| `status` | Enum | `SENT`, `DELIVERED`, `FAILED` |
| `sent_at` | Timestamp | |

---

## 6. UI/UX Guidelines

*   **Dashboard:** High-level metrics (Active Announcements, Upcoming Events, Open Tickets).
*   **Tables:** Use standard data tables with Sort, Filter, and Pagination.
*   **Forms:** Use modal dialogs for quick actions (e.g., "New Announcement") and full pages for complex ones (e.g., "Newsletter Builder").
*   **Feedback:** Toast notifications for success/error states ("Announcement Published").
*   **Mobile:** Responsive design for Devotee-facing pages (RSVP, Feedback).
