"use client";

import React, { useEffect } from "react";
import { X, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { Button } from "./Button";

export interface ModalProps {
  isOpen: boolean; onClose: () => void; onConfirm?: () => void; title: string;
  description?: React.ReactNode; variant?: "danger" | "warning" | "info" | "success";
  confirmText?: string; cancelText?: string; isLoading?: boolean; children?: React.ReactNode;
  className?: string;
}

const ICONS = {
  danger: <AlertTriangle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-[var(--color-accent)]" />,
  success: <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />,
};

export const Modal: React.FC<ModalProps> = ({
  isOpen, onClose, onConfirm, title, description, className, variant = "danger",
  confirmText = "Confirm", cancelText = "Cancel", isLoading = false, children,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-hidden">
      <div className="absolute inset-0" onClick={onClose} />
      <div className={`relative w-full max-w-md bg-[var(--color-card)] text-[var(--color-foreground)] rounded-2xl shadow-2xl border border-[var(--color-border)] z-10 flex flex-col max-h-[85dvh] sm:max-h-[80dvh] overflow-hidden ${className ?? ""}`}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border)] shrink-0 bg-[var(--color-card)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] shrink-0">{ICONS[variant]}</div>
            <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider">{title}</h3>
          </div>
          <button onClick={onClose} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] p-1 cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-4 scrollbar-thin scrollbar-thumb-[var(--color-border)]">
          {description && <div className="text-xs text-[var(--color-muted-foreground)] leading-relaxed mb-2">{description}</div>}
          {children}
        </div>
        {(onConfirm || cancelText) && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--color-border)] bg-[var(--color-background)]/50 shrink-0">
            <Button className="border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] hover:bg-[var(--color-border)]/50" size="sm" onClick={onClose} disabled={isLoading}>{cancelText}</Button>
            {onConfirm && <Button variant={variant === "danger" ? "danger" : "primary"} size="sm" onClick={onConfirm} isLoading={isLoading}>{confirmText}</Button>}
          </div>
        )}
      </div>
    </div>
  );
};