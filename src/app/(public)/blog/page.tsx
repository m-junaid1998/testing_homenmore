import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/content/blog";

export const metadata: Metadata = {
  title: "Jewellery Guides & Styling Tips",
  description: "Practical guides on choosing bridal jewellery, caring for fashion jewellery and picking earrings, from Bambotia.",
  alternates: { canonical: "/blog" },
};

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Jewellery Guides &amp; Styling Tips</h1>
      <ul className="mt-8 space-y-6">
        {posts.map((p) => (
          <li key={p.slug} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <h2 className="text-lg font-bold">
              <Link href={`/blog/${p.slug}`} className="hover:text-[var(--color-gold)]">{p.title}</Link>
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">{p.description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
