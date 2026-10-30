"use client";

import React, { useState, forwardRef, useId } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: React.ReactNode;
  labelClassName?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  isTextArea?: boolean;
  rows?: number;
}

export const FormInput = forwardRef<
  HTMLInputElement & HTMLTextAreaElement,
  FormInputProps
>(
  (
    {
      label,
      labelClassName = "",
      error,
      helperText,
      leftIcon,
      rightIcon,
      type = "text",
      id,
      disabled,
      required,
      className = "",
      containerClassName = "",
      isTextArea = false,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const generatedId = useId();
    const inputId = id || generatedId;
    const isPassword = type === "password" && !isTextArea;

    // Dynamic Spacing for Icons
    const pLeft = leftIcon ? "pl-10" : "pl-3.5";
    const pRight = isPassword || rightIcon ? "pr-10" : "pr-3.5";

    // Theme Variables mapped cleanly to CSS Tokens
    const baseStyle =
      "w-full text-xs rounded-lg py-2.5 bg-muted/40 text-foreground border border-border placeholder:text-muted-foreground outline-none transition-all";
    
    const stateStyle = error
      ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
      : "focus:border-accent focus:ring-1 focus:ring-accent";

    const disableStyle = disabled
      ? "opacity-50 cursor-not-allowed bg-card"
      : "";

    return (
      <div className={`w-full flex flex-col ${containerClassName}`.trim()}>
        {/* Label Section */}
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-xs font-bold text-foreground mb-1.5 select-none ${labelClassName}`.trim()}
          >
            {label} {required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
          </label>
        )}

        {/* Input / Textarea Field Container */}
        <div className="relative flex items-center w-full">
          {/* Left Icon */}
          {leftIcon && (
            <div className={`absolute left-3.5 text-muted-foreground pointer-events-none flex items-center ${isTextArea ? "top-3" : ""}`}>
              {leftIcon}
            </div>
          )}

          {/* Render Input or Textarea */}
          {isTextArea ? (
            <textarea
              ref={ref}
              id={inputId}
              rows={rows}
              disabled={disabled}
              required={required}
              className={`${baseStyle} ${pLeft} ${pRight} ${stateStyle} ${disableStyle} ${className}`.trim()}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref}
              id={inputId}
              type={isPassword ? (showPassword ? "text" : "password") : type}
              disabled={disabled}
              required={required}
              className={`${baseStyle} ${pLeft} ${pRight} ${stateStyle} ${disableStyle} ${className}`.trim()}
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          )}

          {/* Right Icon / Password Toggle */}
          {isPassword ? (
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3.5 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer transition-colors disabled:cursor-not-allowed"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          ) : rightIcon ? (
            <div className={`absolute right-3.5 text-muted-foreground pointer-events-none flex items-center ${isTextArea ? "top-3" : ""}`}>
              {rightIcon}
            </div>
          ) : null}
        </div>

        {/* Validation Error / Helper Text */}
        {error ? (
          <p className="flex items-center space-x-1 text-xs text-[var(--color-danger)] mt-1.5 font-medium">
            <AlertCircle size={13} className="shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground mt-1.5 leading-snug">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";