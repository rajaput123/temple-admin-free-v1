# Temple Management ERP - Module Purposes

## Overview
This document explains the purpose and functionality of each module in the Temple Management ERP system.

---

## 1. People / HR Module

**Purpose**: Complete human resource management for temple staff and employees.

**Key Functions**:
- Employee directory and profile management
- Organizational structure (departments, designations, hierarchy)
- Work shift configuration and assignments
- Leave and holiday management
- Daily attendance tracking
- Employee expense claims and reimbursements

**Who Uses It**: HR Managers, Department Heads, Supervisors, Finance Team

---

## 2. Temple Structure Module

**Purpose**: Manage physical infrastructure and facility layout of the temple.

**Key Functions**:
- Main temple information and details
- Child/subsidiary temple management
- Sacred entities (deities, samadhis) management
- Zone definition (pradakshina paths, mantapas, queue areas)
- Halls and rooms with capacity information
- Service counters (seva, donation counters)
- Visual hierarchy view of complete structure

**Who Uses It**: Temple Administrators, Facility Managers, Structure Coordinators

---

## 3. Rituals & Darshan Module

**Purpose**: Manage ritual schedules, offerings, and darshan services.

**Key Functions**:
- Seva offerings and darshan type definitions
- Daily ritual schedule management
- Festival and special day management
- Priest assignments
- Ritual timing and capacity management

**Who Uses It**: Ritual Administrators, Priests, Festival Coordinators

---

## 4. Seva Counter Module

**Purpose**: Real-time counter operations for booking and service management.

**Key Functions**:
- Counter booking operations
- Today's bookings management
- Booking history
- Counter summary and reports
- Cash settlement

**Who Uses It**: Counter Staff, Counter Supervisors, Cashiers

---

## 5. Stock / Inventory Module

**Purpose**: Material and inventory management for temple operations.

**Key Functions**:
- Item master management
- Stock entries and tracking
- Purchase order management
- Vendor management
- Reorder requests
- Stock reports and variance analysis

**Who Uses It**: Inventory Admins, Store Keepers, Purchase Managers, Kitchen Supervisors

---

## 6. Kitchen & Prasad Module

**Purpose**: Kitchen operations and prasad (sacred food offering) management.

**Key Functions**:
- Recipe management
- Production planning and tracking
- Kitchen stock management
- Prasad master data
- Prasad distribution (counters, VIP, Annadanam, events)
- Quality control

**Who Uses It**: Kitchen Managers, Kitchen Admins, Prasad Admins, Quality Incharge

---

## 7. Asset Management Module

**Purpose**: Physical asset tracking, maintenance, and lifecycle management.

**Key Functions**:
- Asset register (movable and immovable assets)
- Asset locations and custody assignments
- Asset movement and transfers
- Maintenance and AMC (Annual Maintenance Contract) tracking
- Asset audit and verification
- Asset disposal management
- Asset reports and analytics

**Who Uses It**: Asset Admins, Asset Managers, Maintenance Staff, Audit Team

---

## 8. PR & Communication Module

**Purpose**: Public relations, announcements, and external communications.

**Key Functions**:
- Announcement creation and publishing
- Events calendar management
- Newsletter creation and distribution
- Media and press release management
- Feedback and grievance management
- Volunteer communications
- Broadcast center for alerts

**Who Uses It**: PR Officers, PR Managers, Content Editors, Digital Team

---

## 9. Projects & Initiatives Module

**Purpose**: Temple development, construction, and project management.

**Key Functions**:
- Project registry and tracking
- Project planning and budgeting
- Vendor management for projects
- Project execution tracking
- Compliance and certification
- Payment management
- Change request management

**Who Uses It**: Project Managers, Project Admins, Site Engineers, Finance Team

---

## 10. Task Management Module

**Purpose**: Enterprise-wide task lifecycle management, assignment, and tracking.

**Key Functions**:
- Task creation and assignment
- Task board (Kanban view) for visual workflow
- Task registry with comprehensive filtering
- Task templates and recurring tasks
- SLA (Service Level Agreement) management
- Escalation management for overdue tasks
- Task reports and analytics
- Approval workflows and automation

**Who Uses It**: All Staff, Supervisors, Department Heads, Administrators

**Sub-modules**:
- **Dashboard**: Command center with metrics, alerts, and quick actions
- **Tasks**: Core task management (Board, Registry, My Tasks, Assigned Tasks)
- **Automation**: Templates and recurring task management
- **Operations**: SLA monitoring and escalation management
- **Admin**: Reports, insights, workflows, and configuration

---

## 11. Branch Management Module

**Purpose**: Manage multiple temple branches and their hierarchy.

**Key Functions**:
- Branch registry
- Branch hierarchy management
- Branch operations coordination
- Branch-specific reports

**Who Uses It**: Branch Administrators, Temple Administrators

---

## 12. Institution Module

**Purpose**: Manage educational institutions associated with the temple.

**Key Functions**:
- Institution management
- Program management
- Student management
- Faculty management
- Institution reports

**Who Uses It**: Institution Administrators, Academic Coordinators

---

## 13. Knowledge Management Module

**Purpose**: Centralized knowledge base and document management.

**Key Functions**:
- Knowledge categories management
- Document management
- Approval workflows for knowledge content
- Beta conversation testing
- Knowledge search and retrieval

**Who Uses It**: Content Editors, Knowledge Admins, All Staff (read access)

---

## 14. CRM (Customer Relationship Management) Module

**Purpose**: Devotee relationship management and engagement.

**Key Functions**:
- Devotee database management
- Donation tracking
- Communication history
- Devotee engagement tracking

**Who Uses It**: CRM Managers, Devotee Relations Team

---

## Module Interconnections

### Data Flow Examples:

1. **HR → Tasks**: Employee assignments create tasks
2. **Structure → Rituals**: Temple zones link to ritual schedules
3. **Inventory → Kitchen**: Stock items feed into kitchen production
4. **Kitchen → Prasad**: Production creates prasad distribution records
5. **Assets → Maintenance**: Assets trigger maintenance tasks
6. **Tasks → All Modules**: Tasks can be created from any module for workflow management
7. **PR → All Modules**: Announcements can reference events from any module

---

## Access Control Summary

- **Super Admin**: Full access to all modules
- **Temple Administrator**: Full operational access
- **Module-Specific Roles**: Limited to their domain (HR Manager, Asset Admin, etc.)
- **Viewer Roles**: Read-only access (Report Viewer, Audit)
- **Staff Roles**: Limited write access within their scope

---

## Module Priority (Implementation Order)

1. **Core Operational**: HR, Structure, Rituals, Seva Counter
2. **Support Operations**: Inventory, Kitchen, Assets
3. **Management Tools**: Tasks, Projects, PR
4. **Extended Features**: Branch, Institution, Knowledge, CRM

---

## Notes

- Each module maintains its own data store but can reference data from other modules
- Task Management acts as a cross-module workflow engine
- All modules support role-based access control
- Reporting capabilities are available across all modules
