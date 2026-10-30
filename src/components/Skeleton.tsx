"use client";

import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "text",
  width,
  height,
  className = "",
  style,
  ...props
}) => {
  const variantStyles = {
    text: "h-4 w-full rounded-md",
    circular: "rounded-full shrink-0",
    rectangular: "w-full rounded-none",
    rounded: "w-full rounded-xl",
  };

  return (
    <div
      className={`animate-pulse bg-[var(--color-border)]/80 dark:bg-gray-700/50 ${variantStyles[variant]} ${className}`}
      style={{ width, height, ...style }}
      {...props}
    />
  );
};