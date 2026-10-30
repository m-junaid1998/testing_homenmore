import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, posts } from "@/content/blog";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_URL } from "@/utils/seo";

type Params = Promise<{ slug: string }>;

export const generateStaticParams = () => posts.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return { title: "Not found", robots: { index: false } };
  return { title: post.title, description: post.description, alternates: { canonical: `/blog/${post.slug}` } };
}

export default async function Page({ params }: { params: Params }) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          dateModified: post.updated,
          mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
          author: { "@type": "Organization", name: SITE_NAME },
          publisher: { "@type": "Organization", name: SITE_NAME },
        }}
      />
      <p className="text-xs uppercase tracking-wider text-[var(--color-muted-foreground)]">
        <Link href="/blog" className="hover:text-[var(--color-gold)]">Guides</Link>
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold leading-tight">{post.title}</h1>
      <div className="mt-6 space-y-8">
        {post.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl font-bold">{s.heading}</h2>
            {s.body.map((para) => (
              <p key={para} className="mt-3 leading-7 text-[var(--color-muted-foreground)]">{para}</p>
            ))}
          </section>
        ))}
      </div>
      <p className="mt-10 text-sm">
        Ready to shop? Browse our <Link href="/shop" className="text-[var(--color-gold)] underline-offset-2 hover:underline">full jewellery collection</Link>.
      </p>
    </main>
  );
}
