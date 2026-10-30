import Link from "next/link";
import { getShippingRules, serverGet } from "@/server/ssr";
import { categoryPath } from "@/utils/seo";
import { discountPercent, formatRs } from "@/utils/shipping";

/**
 * The one visible <h1> of the home page + a short crawlable intro with links into every category.
 * Server component: ships zero JavaScript.
 */
export async function HomeIntro() {
  const rules = await getShippingRules();
  const res = await serverGet<{ data: { _id: string; categoryname: string }[] }>(
    "/categories/allcategories",
    { isAllRecord: true },
    { tag: "categories" }
  );
  const categories = res?.data ?? [];

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 text-center sm:py-14">
      <h1 className="font-display text-2xl font-semibold tracking-wide sm:text-4xl">
        Online Jewellery Store in Pakistan: Bridal Sets, Earrings, Bangles &amp; Necklaces
      </h1>
      <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted-foreground)] sm:text-base">
        Shop Bambotia for bridal jewellery sets, earrings, bangles, necklaces and more, delivered across Pakistan including
        Karachi, Lahore and Islamabad. Pay by cash on delivery or get {discountPercent(rules)}% off when you pay online.
        Delivery is Rs. {rules.deliveryCharge}, and free on orders above Rs. {formatRs(rules.freeShippingAbove)}.
      </p>
      {categories.length > 0 && (
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <li key={c._id}>
              <Link
                href={categoryPath(c.categoryname)}
                className="inline-block rounded-full border border-[var(--color-border)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                {c.categoryname}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-xs text-[var(--color-muted-foreground)]">
        Shipping to:{" "}
        {["karachi", "lahore", "islamabad"].map((c, i) => (
          <span key={c}>
            {i > 0 && " · "}
            <Link href={`/jewellery-in/${c}`} className="underline-offset-2 hover:text-[var(--color-gold)] hover:underline">
              {c[0].toUpperCase() + c.slice(1)}
            </Link>
          </span>
        ))}
      </p>
    </section>
  );
}
