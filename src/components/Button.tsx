"use client";

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  enableFlash?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANTS = {
  primary: 'bg-primary hover:bg-primary-hover text-[var(--color-primary-foreground)] shadow-md',
  secondary: 'bg-accent hover:bg-accent/90 text-[var(--color-primary-foreground)] shadow-sm',
  outline: 'border border-[var(--color-border)] bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-border)]',
  ghost: 'bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-border)]',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
};

const SIZES = { sm: 'text-[11px] py-2 px-3 gap-1.5', md: 'text-xs py-3 px-4 gap-2', lg: 'text-sm py-3.5 px-6 gap-2.5' };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', isLoading = false, enableFlash = true, disabled = false, leftIcon, rightIcon, className = '', type = 'button', ...props }, ref) => {
    const isInteractive = !disabled && !isLoading;
    const flashStyles = enableFlash && isInteractive ? 'before:absolute before:inset-0 before:-translate-x-full hover:before:translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:transition-transform before:duration-700' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`relative overflow-hidden inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all duration-300 outline-none select-none rounded-lg disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] cursor-pointer ${flashStyles} ${VARIANTS[variant]} ${SIZES[size]} ${className}`.trim()}
        {...props}
      >
        {isLoading ? <Loader2 size={16} className="animate-spin shrink-0 z-10" /> : leftIcon && <span className="shrink-0 z-10">{leftIcon}</span>}
        <span className="z-10">{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0 z-10">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';