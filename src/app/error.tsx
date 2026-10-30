"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center text-[var(--color-foreground)]">
      <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-[var(--color-muted-foreground)]">
        We could not load this page right now. Please try again in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-bold text-[var(--color-primary-foreground)]"
      >
        Try again
      </button>
    </main>
  );
}
