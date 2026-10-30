"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface Props { currentPage: number; totalPages: number; onPageChange: (p: number) => void; siblingCount?: number; showFirstLast?: boolean; className?: string; }

export const Pagination: React.FC<Props> = ({ currentPage, totalPages, onPageChange, siblingCount = 1, showFirstLast = true, className = "" }) => {
  if (totalPages <= 1) return null;

  const pages = (() => {
    if (siblingCount + 5 >= totalPages) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const l = Math.max(currentPage - siblingCount, 1), r = Math.min(currentPage + siblingCount, totalPages);
    const showL = l > 2, showR = r < totalPages - 2;
    if (!showL && showR) return [...Array.from({ length: 3 + 2 * siblingCount }, (_, i) => i + 1), "...", totalPages];
    if (showL && !showR) return [1, "...", ...Array.from({ length: 3 + 2 * siblingCount }, (_, i) => totalPages - (3 + 2 * siblingCount) + i + 1)];
    return [1, "...", ...Array.from({ length: r - l + 1 }, (_, i) => l + i), "...", totalPages];
  })();

  const btn = "flex items-center justify-center min-w-[32px] h-8 px-2.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <nav className={`flex items-center justify-center gap-1  select-none ${className}`}>
      {showFirstLast && <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className={`${btn} text-[var(--color-muted-foreground)] hover:bg-[var(--color-border)] cursor-pointer`} title="First"><ChevronsLeft className="w-4 h-4" /></button>}
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`${btn} text-[var(--color-muted-foreground)] hover:bg-[var(--color-border)] cursor-pointer`} title="Prev"><ChevronLeft className="w-4 h-4" /></button>
      
      {pages.map((p, i) => p === "..." ? (
        <span key={`d-${i}`} className="px-1 text-xs text-[var(--color-muted-foreground)]">•••</span>
      ) : (
        <button key={p} onClick={() => onPageChange(p as number)} className={`${btn} ${p === currentPage ? "bg-accent text-[var(--color-primary-foreground)] shadow-sm cursor-pointer" : "text-[var(--color-foreground)] hover:bg-[var(--color-border)] cursor-pointer"}`}>{p}</button>
      ))}

      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`${btn} text-[var(--color-muted-foreground)] hover:bg-[var(--color-border)] cursor-pointer`} title="Next"><ChevronRight className="w-4 h-4" /></button>
      {showFirstLast && <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={`${btn} text-[var(--color-muted-foreground)] hover:bg-[var(--color-border)] cursor-pointer`} title="Last"><ChevronsRight className="w-4 h-4" /></button>}
    </nav>
  );
};