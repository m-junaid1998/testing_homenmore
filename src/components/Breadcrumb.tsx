import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem { label: string; link?: string; }

export const Breadcrumb: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => (
  <nav className="flex items-center gap-0.5 sm:gap-2 text-xs sm:text-sm font-medium py-3 text-[var(--color-muted)]">
    {items.map((item, idx) => {
      const isLast = idx === items.length - 1;
      return (
        <React.Fragment key={idx}>
          {isLast || !item.link ? (
            <span className="text-[var(--gold)] font-bold">{item.label}</span>
          ) : (
            <Link href={item.link} className="hover:text-[var(--gold)] transition-colors">
              {item.label}
            </Link>
          )}
          {!isLast && <ChevronRight size={14} className="text-[var(--color-muted)] shrink-0" />}
        </React.Fragment>
      );
    })}
  </nav>
);