"use client";

import React, { forwardRef, useId } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption { label: string; value: string | number; disabled?: boolean; }

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  containerClassName?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, options, placeholder, error, helperText, leftIcon, id, disabled, required, className = '', containerClassName = '', value, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const pLeft = leftIcon ? 'pl-10' : 'pl-3.5';
    const stateStyle = error ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[var(--color-border)] focus:ring-1 focus:ring-primary focus:border-primary';
    const disableStyle = disabled ? 'bg-[var(--color-background)] text-[var(--color-muted-foreground)] cursor-not-allowed border-[var(--color-border)]' : 'cursor-pointer';

    return (
      <div className={`w-full ${containerClassName}`.trim()}>
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[var(--color-foreground)] mb-1.5 select-none">
            {label} {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && <div className="absolute left-3.5 text-[var(--color-muted-foreground)] pointer-events-none flex items-center">{leftIcon}</div>}

          <select
            ref={ref}
            id={inputId}
            value={value}
            disabled={disabled}
            required={required}
            className={`w-full appearance-none bg-[var(--color-card)] text-sm rounded-lg py-2.5 pr-10 text-[var(--color-foreground)] border transition-all outline-none ${pLeft} ${stateStyle} ${disableStyle} ${value === '' || value === undefined ? 'text-[var(--color-muted-foreground)]' : ''} ${className}`.trim()}
            {...props}
          >
            {placeholder && <option value="" disabled hidden>{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled} className="text-[var(--color-foreground)]">
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3.5 text-[var(--color-muted-foreground)] pointer-events-none flex items-center">
            <ChevronDown size={18} />
          </div>
        </div>

        {error ? (
          <p className="flex items-center space-x-1 text-xs text-red-500 mt-1.5 font-medium"><AlertCircle size={13} className="shrink-0" /><span>{error}</span></p>
        ) : helperText ? (
          <p className="text-xs text-[var(--color-muted-foreground)] mt-1.5 leading-snug">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';