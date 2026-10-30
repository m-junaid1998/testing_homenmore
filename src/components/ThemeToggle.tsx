"use client";

import { Moon, Sun } from "lucide-react";

export const THEME_KEY = "bambotia:theme";

// Flips the theme on <html data-theme> and remembers it. The icon switches through CSS (globals.css), so no React state is needed.
export function ThemeToggle() {
  const toggle = () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  };

  return (
    <button type="button" onClick={toggle} aria-label="Switch between light and dark theme" className="transition-colors hover:text-[var(--color-primary)] cursor-pointer">
      <Moon size={22} className="theme-moon" />
      <Sun size={22} className="theme-sun" />
    </button>
  );
}
