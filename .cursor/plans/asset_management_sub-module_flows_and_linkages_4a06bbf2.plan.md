---
name: Asset Management Sub-Module Flows and Linkages
overview: Create visual diagrams and documentation showing sub-module flows within Asset Management module and how it links to other modules (HR, etc.)
todos:
  - id: create-asset-internal-flow
    content: Create Asset Management internal sub-module flow diagram showing Asset Master, Locations, Custody, Movement, Maintenance, Audit, Disposal, and Reports connections
    status: pending
  - id: create-asset-data-flow
    content: Create sequence diagram showing data flow between Asset sub-modules
    status: pending
  - id: create-asset-hr-linkage
    content: Create diagram showing how Asset module links to HR module (departments, employees)
    status: pending
  - id: create-asset-navigation
    content: Create navigation flow diagram showing how users navigate between Asset sub-modules
    status: pending
  - id: document-asset-implementation
    content: Document implementation examples showing code for Asset module linking (HR imports, data sharing, navigation)
    status: pending
  - id: create-asset-architecture
    content: Create complete Asset module architecture diagram showing all sub-modules and external linkages
    status: pending
    dependencies:
      - create-asset-internal-flow
      - create-asset-hr-linkage
---

# Asset Management Module - Sub-Module Flows and Linkages

## 1. Asset Management Sub-Module Flow

### Internal Sub-Module Structure

```mermaid
graph TB
    subgraph AssetModule[Asset Management Module]
        AM[Asset Master<br/>Core Register]
        LOC[Locations<br/>Location Hierarchy]
        CUST[Custody Assignment<br/>Responsibility Tracking]
        MOV[Movement & Transfer<br/>Asset Movement]
        MAINT[Maintenance & AMC<br/>Maintenance Tracking]
        AUDIT[Audit & Verification<br/>Physical Verification]
        DISP[Disposal<br/>Asset Disposal]
        REP[Reports<br/>Analytics & Reports]
    end

    AM -->|"Uses Location Data"| LOC
    AM -->|"Creates Assets"| CUST
    AM -->|"Provides Asset Data"| MOV
    AM -->|"Provides Asset Data"| MAINT
    AM -->|"Provides Asset Data"| AUDIT
    AM -->|"Provides Asset Data"| DISP
    AM -->|"Provides Asset Data"| REP
    
    CUST -->|"Updates Asset Custodian"| AM
    MOV -->|"Updates Asset Location"| AM
    MAINT -->|"Updates Asset Status"| AM
    AUDIT -->|"Updates Verification Status"| AM
    DISP -->|"Updates Asset Status to Disposed"| AM
    
    LOC -->|"Location Hierarchy"| MOV
    MOV -->|"Uses Locations"| LOC
```

### Sub-Module Descriptions

1. **Asset Master** (`/assets/master`)

   - Central hub for all assets
   - Creates, edits, views assets
   - Stores asset master data in localStorage
   - File: `src/pages/assets/AssetMaster.tsx`

2. **Locations** (`/assets/locations`)

   - Manages location hierarchy (Building > Room > Section)
   - Used by Asset Master for asset location
   - Used by Movement for source/destination
   - File: `src/pages/assets/AssetLocations.tsx`

3. **Custody Assignment** (`/assets/custody`)

   - Assigns custodians to assets
   - Links assets to HR employees/departments
   - Updates asset custodian information
   - File: `src/pages/assets/AssetCustody.tsx`

4. **Movement & Transfer** (`/assets/movement`)

   - Transfers assets between locations
   - Uses locations from Locations module
   - Updates asset location in Asset Master
   - File: `src/pages/assets/AssetMovement.tsx`

5. **Maintenance & AMC** (`/assets/maintenance`)

   - Tracks maintenance schedules
   - Manages AMC contracts
   - Updates asset maintenance status
   - File: `src/pages/assets/Maintenance.tsx`

6. **Audit & Verification** (`/assets/audit`)

   - Physical verification of assets
   - Records audit results
   - Updates asset verification status
   - File: `src/pages/assets/AssetAudit.tsx`

7. **Disposal** (`/assets/disposal`)

   - Manages asset disposal requests
   - Approval workflow
   - Updates asset status to disposed
   - File: `src/pages/assets/AssetDisposal.tsx`

8. **Reports** (`/assets/reports`)

   - Aggregates data from all sub-modules
   - Generates analytics and reports
   - File: `src/pages/assets/AssetReports.tsx`

---

## 2. Data Flow Within Asset Module

### Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant AssetMaster
    participant Locations
    participant Custody
    participant Movement
    participant Maintenance
    participant Audit
    participant Disposal
    participant Reports

    User->>AssetMaster: Create Asset
    AssetMaster->>Locations: Get Location Options
    Locations-->>AssetMaster: Location List
    AssetMaster->>Custody: Assign Custodian
    Custody-->>AssetMaster: Update Custodian
    
    User->>Movement: Transfer Asset
    Movement->>Locations: Get Source/Destination
    Locations-->>Movement: Location Data
    Movement->>AssetMaster: Update Asset Location
    
    User->>Maintenance: Schedule Maintenance
    Maintenance->>AssetMaster: Update Maintenance Status
    
    User->>Audit: Verify Asset
    Audit->>AssetMaster: Update Verification Status
    
    User->>Disposal: Request Disposal
    Disposal->>AssetMaster: Update Status to Disposed
    
    User->>Reports: Generate Report
    Reports->>AssetMaster: Get All Asset Data
    Reports->>Custody: Get Custody Data
    Reports->>Movement: Get Movement Data
    Reports->>Maintenance: Get Maintenance Data
    Reports->>Audit: Get Audit Data
    Reports-->>User: Comprehensive Report
```

---

## 3. Asset Module Links to Other Modules

### Cross-Module Linkages

```mermaid
graph LR
    subgraph AssetModule[Asset Management]
        AM[Asset Master]
        CUST[Custody]
    end

    subgraph HRModule[HR Module]
        HR_ORG[Organization<br/>Departments]
        HR_EMP[Employees]
    end

    HR_ORG -.->|"Import Departments"| AM
    HR_EMP -.->|"Import Employees"| AM
    HR_EMP -.->|"Import Employees"| CUST
```

### Implementation Details

**File**: `src/components/assets/AssetMasterInlineForm.tsx` (lines 138-151)

```typescript
// Import HR module data
import { hrDepartments } from '@/data/hr-dummy-data';
import { getEmployees } from '@/lib/hr-employee-store';

// Use HR departments for asset department selection
const departmentOptions = useMemo(() => {
  return hrDepartments
    .filter(dept => dept.status === 'active')
    .map(dept => ({ value: dept.id, label: dept.name }));
}, []);

// Use HR employees for custodian selection
const custodianOptions = useMemo(() => {
  const employees = getEmployees();
  return employees.map(emp => ({ 
    value: emp.id, 
    label: `${emp.name}${emp.designation ? ` - ${emp.designation}` : ''}` 
  }));
}, []);
```

**File**: `src/components/assets/CustodyAssignmentModal.tsx`

```typescript
// Uses HR departments for custody assignment
import { departments } from '@/data/hr-dummy-data';
```

---

## 4. Navigation Flow Between Sub-Modules

### Navigation Patterns

```mermaid
graph LR
    AM[Asset Master] -->|"Edit Asset"| AM_FORM[Asset Master Form]
    AM -->|"View Details"| AM_SHEET[Asset Details Sheet]
    AM -->|"Assign Custody"| CUST[Custody]
    AM -->|"Transfer Asset"| MOV[Movement]
    AM -->|"Schedule Maintenance"| MAINT[Maintenance]
    AM -->|"Verify Asset"| AUDIT[Audit]
    AM -->|"Dispose Asset"| DISP[Disposal]
    AM -->|"View Reports"| REP[Reports]
    
    CUST -->|"View Asset"| AM
    MOV -->|"View Asset"| AM
    MAINT -->|"View Asset"| AM
    AUDIT -->|"View Asset"| AM
    DISP -->|"View Asset"| AM
```

### Implementation

**File**: `src/pages/assets/AssetMaster.tsx`

```typescript
// Navigate to edit asset
navigate(`/assets/master/${row.id}/edit`);

// Navigate to create new asset
navigate('/assets/master/new');
```

---

## 5. Data Storage and Sharing

### localStorage Keys

- `asset_master_data` - Stores all assets (Asset Master)
- `asset_categories` - Stores asset categories
- Asset locations, custody, movements, maintenance, audits stored in dummy data files

### Data Flow

```mermaid
graph TB
    AM_FORM[Asset Master Form] -->|"Save"| LOCAL[localStorage<br/>asset_master_data]
    LOCAL -->|"Load"| AM[Asset Master]
    AM -->|"Read"| CUST[Custody]
    AM -->|"Read"| MOV[Movement]
    AM -->|"Read"| MAINT[Maintenance]
    AM -->|"Read"| AUDIT[Audit]
    AM -->|"Read"| DISP[Disposal]
    AM -->|"Read"| REP[Reports]
```

---

## 6. Complete Asset Module Architecture

### Full Flow Diagram

```mermaid
graph TB
    subgraph Core[Core Infrastructure]
        AUTH[AuthContext]
        PERM[Permissions]
        ROUTER[React Router]
    end

    subgraph AssetModule[Asset Management Module]
        AM[Asset Master]
        LOC[Locations]
        CUST[Custody]
        MOV[Movement]
        MAINT[Maintenance]
        AUDIT[Audit]
        DISP[Disposal]
        REP[Reports]
    end

    subgraph HRModule[HR Module - External]
        HR_ORG[Organization]
        HR_EMP[Employees]
    end

    AUTH --> AM
    PERM --> AM
    ROUTER --> AM

    AM --> LOC
    AM --> CUST
    AM --> MOV
    AM --> MAINT
    AM --> AUDIT
    AM --> DISP
    AM --> REP

    LOC --> MOV
    CUST --> AM
    MOV --> AM
    MAINT --> AM
    AUDIT --> AM
    DISP --> AM

    HR_ORG -.->|"Import"| AM
    HR_EMP -.->|"Import"| AM
    HR_EMP -.->|"Import"| CUST
```

---

## 7. Files to Document

1. **Asset sub-module flow diagram** - Visual representation of internal flows
2. **Cross-module linkage documentation** - How Asset links to HR
3. **Navigation patterns** - How users move between sub-modules
4. **Data flow documentation** - How data flows between sub-modules
5. **Implementation examples** - Code snippets showing linkages

The documentation will be created as a markdown file with embedded mermaid diagrams showing:

- Internal sub-module flows within Asset Management
- Cross-module data dependencies (Asset → HR)
- Navigation patterns
- Code implementation examples