# Pagination and Table Rules

## Overview
This document defines the standard rules and guidelines for pagination and table display across the Temple Management ERP application.

## Table Display Rules

### 1. Default Settings
- **Default Page Size**: 10 rows per page
- **Page Size Options**: 10, 25, 50, 100 rows per page
- **Default View**: Table view (not grid)
- **Search**: Enabled by default (can be disabled via `searchable={false}`)
- **Selection**: Enabled by default (can be disabled via `selectable={false}`)
- **View Toggle**: Enabled by default (can be disabled via `viewToggle={false}`)

### 2. Pagination Behavior

#### Page Reset Rules
- **When data changes**: Automatically reset to page 1
- **When page size changes**: Reset to page 1
- **When search query changes**: Reset to page 1 (implicit through data change)

#### Pagination Display
- **Format**: `{start}–{end} of {total}`
  - Example: `1–10 of 50`
  - Example: `11–20 of 50`
  - Example: `51–55 of 55` (last page)
- **Navigation**: Previous/Next buttons only (no page number buttons)
- **Button States**:
  - Previous button: Disabled on page 1
  - Next button: Disabled on last page

### 3. Search Functionality

#### Search Rules
- **Scope**: Searches across all column values in the table
- **Case Sensitivity**: Case-insensitive
- **Search Type**: Partial match (substring search)
- **Real-time**: Updates as user types
- **Placeholder**: Customizable via `searchPlaceholder` prop

#### Search Behavior
- Search filters the entire dataset before pagination
- Pagination applies to filtered results
- Empty search shows all data

### 4. Sorting Rules

#### Sort Behavior
- **Default**: No sorting applied initially
- **Sortable Columns**: Only columns with `sortable: true` can be sorted
- **Sort Direction**: Toggle between ascending (↑) and descending (↓)
- **Visual Indicator**: ChevronUp (↑) for ascending, ChevronDown (↓) for descending
- **Sort Priority**: Only one column sorted at a time

#### Sort Interaction
- Click column header to sort ascending
- Click again to sort descending
- Click third time: Reset to no sort (if implemented)

### 5. Selection Rules

#### Selection Behavior
- **Select All**: Selects only visible rows on current page (not all filtered data)
- **Individual Selection**: Click checkbox to select/deselect row
- **Selection Persistence**: Selection persists across page changes
- **Selection Count**: Displayed in toolbar when items are selected

#### Selection Use Cases
- Bulk actions (approve, reject, delete, publish, etc.)
- Export selected items
- Batch operations

### 6. View Modes

#### Table View (Default)
- **Layout**: Traditional table with rows and columns
- **Use Case**: Best for detailed data with many columns
- **Features**: Full column visibility, sorting, selection

#### Grid View
- **Layout**: Card-based grid layout
- **Columns Shown**: First 3 columns only
- **Use Case**: Quick overview, visual browsing
- **Grid Responsive**: 
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns
  - Large Desktop: 4 columns

### 7. Empty States

#### Empty Table Rules
- **Message**: Customizable via `emptyMessage` prop
- **Default Message**: "No data found"
- **Display**: Centered in table body
- **Colspan**: Spans all columns including selection and actions columns

### 8. Row Actions

#### Actions Column
- **Position**: Rightmost column
- **Trigger**: Three-dot menu (MoreHorizontal icon)
- **Click Behavior**: Actions menu click does not trigger row click
- **Common Actions**: Edit, Delete, View, Publish, etc.

#### Row Click Behavior
- **Enabled**: When `onRowClick` prop is provided
- **Visual**: Cursor changes to pointer
- **Use Case**: Navigate to detail page, open view modal
- **Prevent Propagation**: Checkbox and actions menu clicks don't trigger row click

### 9. Performance Rules

#### Data Handling
- **Client-side Pagination**: All data loaded, pagination is UI-only
- **Filtering**: Applied before pagination
- **Sorting**: Applied before pagination
- **Memoization**: Filtered and paginated data are memoized

#### Large Datasets
- **Warning**: Current implementation loads all data into memory
- **Future Consideration**: Server-side pagination for datasets > 1000 rows
- **Optimization**: Consider virtual scrolling for very large tables

### 10. Accessibility Rules

#### Keyboard Navigation
- **Tab Order**: Search → Table → Pagination controls
- **Sort**: Click header (mouse) or Enter/Space (keyboard)
- **Pagination**: Tab to buttons, Enter/Space to activate

#### Screen Readers
- **Table Structure**: Proper `<table>`, `<thead>`, `<tbody>` structure
- **Sort Indicators**: Visual only (consider aria-labels)
- **Pagination**: Shows range information textually

### 11. Module-Specific Rules

#### HR Module
- **Employees**: Default 10 rows, searchable, selectable
- **Leave Applications**: No search bar (`searchable={false}`), no view toggle (`viewToggle={false}`)
- **Leave Types**: No search bar, no view toggle
- **Holidays**: No search bar, no view toggle
- **Attendance**: Standard settings

#### Temple Structure Module
- **All Pages**: Standard settings (searchable, selectable, view toggle)
- **Buttons**: Moved to PageHeader actions prop

#### Rituals & Darshan Module
- **Offerings**: Standard settings
- **Daily Schedule**: Read-only, no search, no selection
- **Festivals**: Standard settings
- **Priest Assignments**: Standard settings

### 12. Best Practices

#### When to Disable Search
- Very small datasets (< 10 items)
- Data is already filtered by other means
- Search is provided elsewhere (e.g., sidebar global search)

#### When to Disable Selection
- Read-only tables
- No bulk actions available
- Single-item operations only

#### When to Disable View Toggle
- Data structure doesn't work well in grid view
- Always need detailed table view
- Mobile-only or desktop-only interfaces

#### Page Size Recommendations
- **Small Lists** (< 50 items): 10 or 25 per page
- **Medium Lists** (50-200 items): 25 or 50 per page
- **Large Lists** (> 200 items): 50 or 100 per page
- **Very Large Lists** (> 1000 items): Consider server-side pagination

### 13. Implementation Guidelines

#### DataTable Props
```tsx
<DataTable
  data={data}                    // Required: Array of objects with 'id' field
  columns={columns}              // Required: Column definitions
  searchable={true}              // Optional: Default true
  searchPlaceholder="Search..."  // Optional: Custom placeholder
  selectable={true}              // Optional: Default true
  viewToggle={true}             // Optional: Default true
  onRowClick={handleRowClick}   // Optional: Row click handler
  actions={renderActions}        // Optional: Actions menu renderer
  emptyMessage="No data found"  // Optional: Custom empty message
/>
```

#### Column Definition
```tsx
{
  key: 'fieldName',           // Required: Field name or custom key
  label: 'Column Label',      // Required: Display label
  sortable: true,             // Optional: Enable sorting
  width: '100px',             // Optional: Column width
  render: (value, row) => {   // Optional: Custom render function
    return <CustomComponent value={value} row={row} />;
  }
}
```

### 14. Future Enhancements

#### Potential Improvements
1. **Server-side Pagination**: For large datasets
2. **Page Number Navigation**: Show page numbers for easier navigation
3. **Jump to Page**: Input field to jump to specific page
4. **Persistent Page Size**: Save user preference in localStorage
5. **Column Visibility Toggle**: Show/hide columns
6. **Export Selected**: Export only selected rows
7. **Advanced Filters**: Multi-column filtering
8. **Column Resizing**: Drag to resize columns
9. **Column Reordering**: Drag to reorder columns
10. **Virtual Scrolling**: For very large datasets

## Summary

### Key Rules
1. ✅ Default: 10 rows per page
2. ✅ Options: 10, 25, 50, 100
3. ✅ Reset to page 1 when data/search changes
4. ✅ Show range: "1–10 of 50"
5. ✅ Previous/Next navigation only
6. ✅ Search filters before pagination
7. ✅ Sort applies before pagination
8. ✅ Select all selects only current page
9. ✅ Empty state shows centered message
10. ✅ Row click opens detail/view modal

### Standard Configuration
- **ERP Tables**: `searchable={true}`, `selectable={false}`, `viewToggle={false}`
- **Management Tables**: `searchable={true}`, `selectable={true}`, `viewToggle={true}`
- **Read-only Tables**: `searchable={false}`, `selectable={false}`, `viewToggle={false}`
