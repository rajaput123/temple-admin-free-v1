import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  selectedRows?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;
  viewToggle?: boolean;
  defaultViewMode?: 'table' | 'grid';
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
  imageKey?: keyof T | string; // Key for image URL in data
  toolbarActions?: React.ReactNode; // Custom actions for toolbar
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = "Search...",
  selectable = true,
  selectedRows,
  onSelectionChange,
  viewToggle = true,
  defaultViewMode = 'table',
  onRowClick,
  actions,
  emptyMessage = "No data found",
  imageKey,
  toolbarActions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(defaultViewMode);

  // Use controlled selection if provided, otherwise use internal state
  const selectedIds = selectedRows !== undefined ? selectedRows : internalSelectedIds;
  const setSelectedIds = onSelectionChange || setInternalSelectedIds;

  // Reset page to 1 when data changes
  useEffect(() => {
    setPage(1);
  }, [data]);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortKey];
        const bVal = (b as Record<string, unknown>)[sortKey];
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, search, sortKey, sortDir]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map(row => row.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const getValue = (row: T, key: string) => {
    return (row as Record<string, unknown>)[key];
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {searchable && (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          )}
          {selectedIds.size > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {toolbarActions}

          {viewToggle && (
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                {selectable && (
                  <th className="w-12">
                    <Checkbox
                      checked={paginatedData.length > 0 && selectedIds.size === paginatedData.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    style={{ width: column.width }}
                    className={cn(
                      column.sortable && "cursor-pointer hover:bg-muted select-none"
                    )}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {column.sortable && sortKey === column.key && (
                        sortDir === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </th>
                ))}
                {actions && <th className="w-12"></th>}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      onRowClick && "cursor-pointer",
                      selectedIds.has(row.id) && "bg-accent/50"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(row.id)}
                          onCheckedChange={() => toggleSelect(row.id)}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={String(column.key)}>
                        {column.render
                          ? column.render(getValue(row, String(column.key)), row)
                          : String(getValue(row, String(column.key)) ?? '')}
                      </td>
                    ))}
                    {actions && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions(row)}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (() => {
        // Calculate responsive grid columns based on data length
        const dataLength = paginatedData.length;
        let gridCols = 'grid-cols-1';
        if (dataLength === 1) {
          gridCols = 'grid-cols-1';
        } else if (dataLength === 2) {
          gridCols = 'grid-cols-1 sm:grid-cols-2';
        } else if (dataLength === 3) {
          gridCols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
        } else if (dataLength <= 4) {
          gridCols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4';
        } else if (dataLength <= 6) {
          gridCols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
        } else {
          gridCols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
        }

        return (
          <div className={cn("grid gap-4", gridCols)}>
            {paginatedData.map((row) => {
              const imageUrl = imageKey ? getValue(row, String(imageKey)) as string : null;
              return (
                <div
                  key={row.id}
                  className={cn(
                    "module-card overflow-hidden",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {imageUrl && (
                    <div className="w-full h-48 bg-muted rounded-t-lg overflow-hidden mb-3">
                      <img
                        src={imageUrl}
                        alt={String(getValue(row, columns[0]?.key || 'name'))}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    {columns.slice(0, 3).map((column) => (
                      <div key={String(column.key)} className="mb-2 last:mb-0">
                        <span className="helper-text">{column.label}</span>
                        <p className="text-sm font-medium text-foreground">
                          {column.render
                            ? column.render(getValue(row, String(column.key)), row)
                            : String(getValue(row, String(column.key)) ?? '')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredData.length)} of {filteredData.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
