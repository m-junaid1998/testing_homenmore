"use client";

import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Ghost } from "lucide-react";
import { Button } from "../components/Button";

export default function PageNotFound() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4 text-[var(--color-foreground)]">
      <div className="w-full max-w-md space-y-7 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-gold)]">
          <Ghost size={38} className="animate-bounce" />
        </div>

        <div className="space-y-3">
          <h1 className="font-display text-7xl font-bold tracking-tight text-[var(--color-primary)]">
            404
          </h1>
          <h2 className="text-xl font-semibold">
            Page Not Found
          </h2>
          <p className="mx-auto max-w-xs text-sm leading-6 text-[var(--color-muted-foreground)]">
            The page you're looking for doesn't exist or may have been moved.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => router.back()}
            leftIcon={<ArrowLeft size={16} />}
            className="border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] hover:border-[var(--color-gold)]"
          >
            Go Back
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => router.push("/")}
            leftIcon={<Home size={16} />}
          >
            Home Page
          </Button>
        </div>
      </div>
    </main>
  );
}