
import Link from "next/link";
import { FacebookIcon, InstagramIcon, PhoneIcon } from "../utils/socialicons";
import { getShippingRules, serverGet } from "../server/ssr";
import { categoryPath } from "../utils/seo";
import { formatRs } from "../utils/shipping";
import type { CategoryItem } from "../utils/types";

const HELP_LINKS = [
  { name: "About us", path: "/aboutus" },
  { name: "Contact", path: "/contact" },
  { name: "FAQ", path: "/faq" },
  { name: "My orders", path: "/orders" },
  { name: "Jewellery guides", path: "/blog" },
];

const LEGAL_LINKS = [
  { name: "Privacy policy", path: "/privacy" },
  { name: "Terms of service", path: "/terms" },
];

const CITIES = ["Karachi", "Lahore", "Islamabad"];

const SOCIALS = [
  {
    Icon: InstagramIcon,
    href: "https://instagram.com/bambotiaa",
    label: "Instagram",
  },
  {
    Icon: FacebookIcon,
    href: "https://facebook.com/bambotia",
    label: "Facebook",
  },
  {
    Icon: PhoneIcon,
    href: "tel:+923433083783",
    label: "Phone",
  },
];

const link =
  "text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-primary)]";

const heading =
  "mb-4 text-sm font-bold uppercase tracking-wider";

export async function Footer() {
  const [res, rules] = await Promise.all([
    serverGet<{ data: CategoryItem[] }>(
      "/categories/allcategories",
      { isAllRecord: true },
      { tag: "categories" }
    ),
    getShippingRules(),
  ]);

  const categories = res?.data ?? [];

  return (
    <footer className="mt-10 border-t border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="page-container grid grid-cols-2 gap-6 py-12 md:gap-10 lg:grid-cols-4">

        {/* Brand section */}
        <div className="col-span-2 lg:col-span-1">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]"
          >
            Bambotia
          </Link>

          <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--color-muted-foreground)]">
            Bridal sets, earrings, bangles and necklaces, delivered across
            Pakistan. Free delivery above Rs.{" "}
            {formatRs(rules.freeShippingAbove)}.
          </p>

          <div className="mt-5 flex gap-2">
            {SOCIALS.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target={
                  href.startsWith("tel:") ? undefined : "_blank"
                }
                rel={
                  href.startsWith("tel:")
                    ? undefined
                    : "noopener noreferrer"
                }
                className="grid h-10 w-10 place-items-center rounded-full border border-[var(--color-border)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primary-foreground)]"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Shop">
          <h2 className={heading}>Shop</h2>

          <ul className="space-y-2.5">
            <li>
              <Link href="/shop" className={link}>
                All jewellery
              </Link>
            </li>

            {categories.map((c) => (
              <li key={c._id}>
                <Link
                  href={categoryPath(c.categoryname)}
                  className={link}
                >
                  {c.categoryname}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Help">
          <h2 className={heading}>Help</h2>

          <ul className="space-y-2.5">
            {HELP_LINKS.map((l) => (
              <li key={l.path}>
                <Link href={l.path} className={link}>
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="We deliver to">
          <h2 className={heading}>We deliver to</h2>

          <ul className="space-y-2.5">
            {CITIES.map((c) => (
              <li key={c}>
                <Link
                  href={`/jewellery-in/${c.toLowerCase()}`}
                  className={link}
                >
                  Jewellery in {c}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

      </div>

      <div className="border-t border-[var(--color-border)]">
        <div className="page-container flex flex-col items-center justify-between gap-3 py-5 text-xs text-[var(--color-muted-foreground)] sm:flex-row">
          <p>
            © {new Date().getFullYear()} Bambotia. All rights reserved.
          </p>

          <ul className="flex gap-5">
            {LEGAL_LINKS.map((l) => (
              <li key={l.path}>
                <Link
                  href={l.path}
                  className="hover:text-[var(--color-primary)]"
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
