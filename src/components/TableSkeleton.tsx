"use client";

import React from "react";

interface Props { rows?: number; columns?: number; className?: string; }

export const TableSkeleton: React.FC<Props> = ({ rows = 5, columns = 6, className = "" }) => (
  <div className={`w-full animate-pulse ${className}`}>
    <div className="w-full overflow-x-auto no-scrollbar">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-card-bg)]">
            {Array.from({ length: columns }).map((_, i) => <th key={i} className="px-5 py-4"><div className="h-3 bg-[var(--color-border)] rounded-md w-20" /></th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="px-5 py-4"><div className={`h-4 bg-[var(--color-background)] rounded-md ${c === 0 ? "w-24 bg-[var(--color-border)]" : c === columns - 1 ? "w-12 ml-auto" : "w-32"}`} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex items-center justify-between p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-light)]">
      <div className="h-3 bg-[var(--color-border)] rounded-md w-36" />
      <div className="flex gap-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="w-8 h-8 bg-[var(--color-border)] rounded-lg" />)}</div>
    </div>
  </div>
);