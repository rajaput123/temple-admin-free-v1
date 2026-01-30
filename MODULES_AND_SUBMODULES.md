# Temple Management ERP - Modules & Sub-Modules

## Complete Module Structure

| Module | Sub-Module | Route | Purpose |
|--------|------------|-------|---------|
| **People / HR** | Employees | `/hr/employees` | Manage employee profiles, onboarding, employee directory, and personal information |
| | Organization | `/hr/organization` | Define organizational structure, departments, designations, and reporting hierarchy |
| | Shifts | `/hr/shifts` | Configure work shifts, timings, and shift assignments for employees |
| | Leave & Holidays | `/hr/leave` | Manage leave applications, leave types, holidays, approval workflows, and leave balances |
| | Attendance | `/hr/attendance` | Track daily attendance, generate attendance reports, and manage attendance policies |
| | Expenses | `/hr/expenses` | Record and manage employee expense claims and reimbursements |
| **Temple Structure** | Temples | `/structure/temples` | Manage main temple information, status, and primary temple details |
| | Child Temples | `/structure/child-temples` | Manage subsidiary temples and their relationship to main temple |
| | Sacred | `/structure/sacred` | Manage deities, samadhis, and sacred entities within temples |
| | Zones | `/structure/zones` | Define temple zones (pradakshina paths, mantapas, queue areas, etc.) |
| | Halls & Rooms | `/structure/halls-rooms` | Manage halls and rooms within temple zones with capacity information |
| | Counters | `/structure/counters` | Manage seva counters, donation counters, and other service counters |
| | Hierarchy View | `/structure/hierarchy` | Visual representation of complete temple structure hierarchy |
| **Rituals & Darshan** | Offerings (Sevas & Darshan) | `/rituals/offerings` | Define and manage seva offerings and darshan types with timings, amounts, and capacity |
| | Daily Schedule | `/rituals/schedule` | View and manage daily ritual schedules and time slots |
| | Festival / Special Days | `/rituals/festivals` | Manage festival events, special days, and their impact on regular schedules |
| | Priest Assignment | `/rituals/priests` | Assign priests to specific offerings and manage priest schedules |
| **Seva Counter** | New Booking | `/seva/bookings/new` | Primary counter screen for creating new seva/darshan bookings with slot selection |
| | Today's Bookings | `/seva/bookings/today` | View and manage bookings for current day, mark complete, reprint receipts |
| | Booking History | `/seva/bookings/history` | View historical bookings with filters, export functionality, and audit trail |
| | Counter Summary | `/seva/bookings/summary` | End-of-day settlement report with cash/digital split and booking summary |
| **Stock / Inventory** | Items | `/inventory/items` | Manage inventory items, stock levels, categories, and item master data |
| | Stock Entries | `/inventory/entries` | Record stock movements, receipts, issues, and inventory transactions |
| | Purchase Orders | `/inventory/orders` | Create and manage purchase orders for inventory procurement |
| **Kitchen & Prasad** | Recipes | `/kitchen/recipes` | Manage recipe master data, versions, ingredients, and approvals |
| | Production Planning | `/kitchen/production-planning` | Plan daily production with demand forecasting and raw material validation |
| | Production Execution | `/kitchen/production-execution` | Execute production batches with quality checks and completion certification |
| | Kitchen Stores | `/kitchen/stores` | Manage kitchen raw material inventory and stock levels |
| **Prasad Management** | Prasad Master | `/prasad/master` | Manage finished prasad types, pack sizes, and pricing rules |
| | Prasad Inventory | `/prasad/inventory` | View finished prasad inventory with batch traceability and expiry tracking |
| | Prasad Distribution | `/prasad/distribution` | Manage prasad distribution to counters, VIP, Annadanam, and external events |
| **Asset Management** | Asset Register | `/assets/register` | Maintain complete asset register with asset details, locations, and values |
| | Maintenance Log | `/assets/maintenance` | Record and track asset maintenance activities and schedules |
| **PR & Communication** | Announcements | `/pr/announcements` | Create and manage temple announcements and public communications |
| | Events Calendar | `/pr/calendar` | Manage public events calendar and event schedules |
| **Projects** | Active Projects | `/projects/active` | Track ongoing temple projects, construction, and development work |
| | Tasks | `/projects/tasks` | Manage project tasks, assignments, and task tracking |
| **CRM** | Devotees | `/crm/devotees` | Manage devotee database, contact information, and devotee relationships |
| | Donations | `/crm/donations` | Track donations, donor information, and donation history |
| | Communications | `/crm/communications` | Manage communications with devotees and stakeholders |

## Module Summary

### Core Operational Modules
- **People / HR**: Complete human resource management for temple staff
- **Temple Structure**: Physical infrastructure and facility management
- **Rituals & Darshan**: Ritual scheduling and offering management
- **Seva Counter**: Real-time counter booking operations

### Support Modules
- **Stock / Inventory**: Material and inventory management
- **Kitchen & Prasad**: Kitchen operations and prasad management
- **Asset Management**: Physical asset tracking and maintenance

### Communication & Engagement
- **PR & Communication**: Public relations and announcements
- **CRM**: Devotee relationship management

### Project Management
- **Projects**: Temple development and construction projects

## Access Control

Each module has role-based access control:
- **Super Admin**: Full access to all modules
- **Temple Administrator**: Full access to operational modules
- **HR Manager**: Access to People/HR module
- **Priest**: Read-only access to Rituals & Darshan and bookings
- **Counter Staff**: Access to Seva Counter module only
- **Other Roles**: Module-specific access as configured

### Inventory Module Roles
- **Inventory Admin**: Full inventory module access + PO approvals
- **Store Keeper**: Items + stock entries + reorder requests
- **Purchase Manager**: POs + vendor management
- **Kitchen Supervisor**: Kitchen stock issues only
- **Counter Supervisor**: Counter stock issues only
- **Finance**: PO approvals + invoice verification
- **Audit**: Stock reports + variance analysis only
