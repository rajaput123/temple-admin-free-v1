# Task Management Module - Design Document

## Sidebar Structure

### Main Modules (6 modules)

1. **Dashboard**
   - Overview
   - My Tasks
   - Quick Actions

2. **Task Registry**
   - All Tasks
   - Create Task
   - Task Templates

3. **Task Board**
   - Kanban View
   - Calendar View
   - Filter & Search

4. **Assignments**
   - Staff Assignments
   - Reassign Tasks
   - Workload View

5. **Reports**
   - Task Status Report
   - Completion Report
   - Staff Performance

6. **Settings**
   - Task Types
   - Priority Levels
   - Staff Management

---

## Module Purposes & Admin Responsibilities

### 1. Dashboard
**Purpose:** Central command center providing overview of all task activities and quick access to key functions.

**Temple Admin Responsibilities:**
- View summary statistics (total tasks, pending, completed, overdue)
- Monitor urgent tasks requiring immediate attention
- Access quick actions (create task, view reports, manage assignments)
- Review recent task activities and updates
- Navigate to different task management sections

---

### 2. Task Registry
**Purpose:** Master repository for all tasks - creation, viewing, and management of complete task records.

**Temple Admin Responsibilities:**
- Create new tasks with all details (title, type, priority, assignee, due date)
- View complete list of all tasks in the system
- Edit existing task details
- Delete or archive completed tasks
- Use task templates to quickly create recurring tasks
- Search and filter tasks by various criteria

---

### 3. Task Board
**Purpose:** Visual execution interface for tracking task progress and status changes.

**Temple Admin Responsibilities:**
- View tasks organized by status (To Do, In Progress, Completed)
- Drag and drop tasks between status columns
- View tasks in calendar format to see due dates
- Filter tasks by staff member, priority, or type
- Quickly update task status without opening full details

---

### 4. Assignments
**Purpose:** Manage task assignments to staff members and monitor workload distribution.

**Temple Admin Responsibilities:**
- Assign tasks to specific staff members
- Reassign tasks when staff is unavailable
- View workload distribution across all staff
- Identify overburdened or underutilized staff
- Balance task assignments fairly

---

### 5. Reports
**Purpose:** Generate insights and reports on task completion, staff performance, and system usage.

**Temple Admin Responsibilities:**
- Generate task status reports (pending, in progress, completed)
- View completion rates and trends
- Analyze staff performance metrics
- Identify bottlenecks and delays
- Export reports for record keeping

---

### 6. Settings
**Purpose:** Configure task types, priority levels, and manage staff members in the system.

**Temple Admin Responsibilities:**
- Create and manage task types (e.g., Cleaning, Maintenance, Ritual Preparation)
- Define priority levels (Low, Medium, High, Urgent)
- Add or remove staff members from the system
- Update staff details and roles
- Configure system preferences

---

## Mock Staff Data

| Staff ID | Name | Role | Department | Contact |
|----------|------|------|------------|---------|
| STF001 | Swami Krishna Das | Priest | Rituals | krishna@temple.org |
| STF002 | Ramesh Kumar | Cleaner | Maintenance | ramesh@temple.org |
| STF003 | Priya Sharma | Accountant | Finance | priya@temple.org |
| STF004 | Mohan Singh | Security Guard | Security | mohan@temple.org |
| STF005 | Lakshmi Devi | Cook | Kitchen | lakshmi@temple.org |
| STF006 | Anil Patel | Maintenance Worker | Maintenance | anil@temple.org |

---

## Mock Task Types

1. **Cleaning** - Daily cleaning and maintenance of temple premises
2. **Ritual Preparation** - Preparing for daily puja and special ceremonies
3. **Maintenance** - Repair and upkeep of temple infrastructure
4. **Security** - Security rounds and monitoring activities
5. **Administrative** - Office work, documentation, and record keeping

---

## Mock Priority Levels

1. **Low** - Can be completed within a week, no urgency
2. **Medium** - Should be completed within 2-3 days
3. **High** - Needs attention within 24 hours
4. **Urgent** - Requires immediate action, same day

---

## Mock Task Records

| Task ID | Task Title | Task Type | Priority | Status | Assigned Staff | Due Date |
|---------|------------|-----------|----------|--------|----------------|----------|
| TSK001 | Clean main hall and sanctum | Cleaning | Medium | In Progress | Ramesh Kumar | 2024-01-15 |
| TSK002 | Prepare for morning aarti | Ritual Preparation | High | Completed | Swami Krishna Das | 2024-01-14 |
| TSK003 | Fix leaking tap in kitchen | Maintenance | High | Open | Anil Patel | 2024-01-16 |
| TSK004 | Night security rounds | Security | Medium | In Progress | Mohan Singh | 2024-01-15 |
| TSK005 | Update monthly accounts | Administrative | Low | Open | Priya Sharma | 2024-01-20 |
| TSK006 | Prepare prasad for 100 devotees | Ritual Preparation | High | In Progress | Lakshmi Devi | 2024-01-15 |
| TSK007 | Deep clean prayer hall | Cleaning | Medium | Open | Ramesh Kumar | 2024-01-18 |
| TSK008 | Repair broken door lock | Maintenance | Urgent | Open | Anil Patel | 2024-01-15 |
| TSK009 | Prepare for special festival | Ritual Preparation | High | In Progress | Swami Krishna Das | 2024-01-17 |
| TSK010 | Review security camera footage | Security | Low | Open | Mohan Singh | 2024-01-19 |

---

## Task Status Definitions

- **Open** - Task has been created but not yet started
- **In Progress** - Task is currently being worked on
- **Completed** - Task has been finished
- **On Hold** - Task is temporarily paused (not used in mock data)

---

## Notes

- All dates are in YYYY-MM-DD format
- Staff assignments are based on their roles and expertise
- Priority levels determine urgency and due date proximity
- Task types help categorize and organize temple operations
- Simple workflow: Open → In Progress → Completed
