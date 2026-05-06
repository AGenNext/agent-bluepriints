// OM UI - Table Components

import { ReactNode, useState, useMemo } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  loading?: boolean;
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selected?: T[];
  onSelectionChange?: (rows: T[]) => void;
}

export function Table<T>({ columns, data, keyField, loading, empty, onRowClick, selectable, selected, onSelectionChange }: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as any)[sortKey];
      const bVal = (b as any)[sortKey];
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? data : []);
    }
  };

  const handleSelectRow = (row: T, checked: boolean) => {
    if (!onSelectionChange || !selected) return;
    const key = row[keyField] as string;
    if (checked) {
      onSelectionChange([...selected, row]);
    } else {
      onSelectionChange(selected.filter(r => (r[keyField] as string) !== key));
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-surface-2">
          <tr>
            {selectable && (
              <th className="w-10 px-3 py-2">
                <input
                  type="checkbox"
                  checked={selected?.length === data.length && data.length > 0}
                  onChange={e => handleSelectAll(e.target.checked)}
                />
              </th>
            )}
            {columns.map(col => (
              <th
                key={col.key}
                className={`px-3 py-2 text-left text-sm font-medium ${
                  col.sortable ? 'cursor-pointer hover:text-primary' : ''
                }`}
                style={{ width: col.width }}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    <span className="text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {loading ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-3 py-8 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading...
                </div>
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-3 py-8 text-center text-muted">
                {empty || 'No data'}
              </td>
            </tr>
          ) : (
            sortedData.map((row, i) => {
              const key = row[keyField] as string;
              const isSelected = selected?.some(r => (r[keyField] as string) === key);
              return (
                <tr
                  key={key}
                  className={`hover:bg-surface-2 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${isSelected ? 'bg-primary/10' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => handleSelectRow(row, e.target.checked)}
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={col.key} className="px-3 py-2 text-sm">
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// Pagination
export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-3 py-2 border-t bg-surface-2">
      <div className="flex items-center gap-2 text-sm text-muted">
        Showing {start} to {end} of {total}
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            className="ml-2 px-2 py-1 border rounded"
          >
            {[10, 25, 50, 100].map(s => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-2 py-1 border rounded text-sm disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-2 text-sm">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-2 py-1 border rounded text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Simple Data Table
export function DataTable({ rows, columns }: { rows: Record<string, any>[]; columns: string[] }) {
  return (
    <Table
      columns={columns.map(c => ({ key: c, header: c, render: row => row[c]?.toString() || '-' }))}
      data={rows}
      keyField="id"
    />
  );
}