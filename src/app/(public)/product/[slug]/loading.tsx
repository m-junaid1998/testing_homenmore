import { Skeleton } from "@/components/Skeleton";

// Shown the instant a product card is clicked, while the server renders the real page.
export default function Loading() {
  return (
    <main className="page-container py-4 sm:py-6" aria-busy="true">
      <Skeleton className="my-3 h-4 w-56" />
      <div className="mt-2 grid gap-6 md:grid-cols-2 md:gap-8">
        <Skeleton variant="rounded" className="aspect-square" />
        <div className="space-y-5">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-9 w-40" />
          <Skeleton variant="rounded" className="h-10 w-2/3" />
          <Skeleton variant="rounded" className="h-12" />
          <Skeleton variant="rounded" className="h-12" />
          <Skeleton variant="rounded" className="h-32" />
        </div>
      </div>
    </main>
  );
}
