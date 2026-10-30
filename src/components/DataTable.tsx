"use client";
import { type ReactNode } from "react";
import { Pagination } from "./Pagination";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (p: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
  emptyMessage = "No records found.",
  className = "",
}: Props<T>) {
  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-light)] shadow-sm ${className}`}
    >
      <div className="w-full overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-muted)] uppercase tracking-wider font-bold">
              {columns.map((col, i) => (
                <th key={i} className={`px-5 py-4 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text-dark)]">
            {isLoading || data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-8 text-center text-[var(--color-muted)] bg-[var(--color-bg-light)]"
                >
                  {isLoading ? "Loading data..." : emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className="bg-[var(--color-bg-light)] hover:bg-[var(--color-card-bg)] transition-colors"
                >
                  {columns.map((col, i) => (
                    <td
                      key={i}
                      className={`px-5 py-4 font-medium whitespace-nowrap ${
                        col.className || ""
                      }`}
                    >
                      {col.render
                        ? col.render(row)
                        : col.accessorKey
                        ? String(row[col.accessorKey] ?? "")
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-[var(--color-border)] bg-[var(--color-card-bg)]">
          <p className="text-xs text-[var(--color-muted)]">
            Showing page{" "}
            <strong className="text-[var(--color-text-dark)]">{currentPage}</strong> of{" "}
            <strong className="text-[var(--color-text-dark)]">{totalPages}</strong> pages
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}