import { discountPercent, formatRs } from "@/utils/shipping";
import { getShippingRules } from "@/server/ssr";

// Reads the delivery settings from the database, so it is built per request (cached for an hour by the response header).
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const rules = await getShippingRules();
  const SITE_URL = new URL(request.url).origin;

  const link = (title: string, path: string, note: string) =>
    `- [${title}](${SITE_URL}${path}): ${note}`;

  const body = [
    "# Bambotia",
    "",
    "> Bambotia is a Pakistani online jewellery store offering bridal sets, earrings, bangles, necklaces and more. Prices are in Pakistani Rupees (PKR), with delivery across Pakistan.",
    "",
    "## About",
    link("About Us", "/aboutus", "Learn about Bambotia and its jewellery collections."),
    link("Contact", "/contact", "Contact the team by form, phone or WhatsApp."),
    "",
    "## Shop",
    link("Home", "/", "Discover featured jewellery and new arrivals."),
    link("Shop All Products", "/shop", "Browse products, search and filter the catalogue."),
    `- Category pages use the pattern ${SITE_URL}/category/{category-name}, e.g. ${SITE_URL}/category/bridal-sets.`,
    `- Product pages use the pattern ${SITE_URL}/product/{product-name}-{id}.`,
    link("Jewellery in Karachi", "/jewellery-in/karachi", "Delivery and ordering information for Karachi."),
    link("Jewellery in Lahore", "/jewellery-in/lahore", "Delivery and ordering information for Lahore."),
    link("Jewellery in Islamabad", "/jewellery-in/islamabad", "Delivery and ordering information for Islamabad."),
    link("Jewellery guides", "/blog", "Buying and care guides."),
    "",
    "## Ordering and Payment",
    "- Guest checkout is available; creating an account is optional.",
    "- Payment options include Cash on Delivery and online payment by Bank Transfer or Easypaisa.",
    `- Online payment discount: ${discountPercent(rules)}% off the order subtotal.`,
    "",
    "## Shipping",
    `- Standard delivery charge: PKR ${rules.deliveryCharge}.`,
    `- Free delivery on orders of PKR ${formatRs(rules.freeShippingAbove)} or more.`,
    "- Delivery is available across Pakistan.",
    "",
    "## Help and Policies",
    link("FAQ", "/faq", "Frequently asked questions about orders, payment and delivery."),
    link("Privacy Policy", "/privacy", "Information about privacy and personal data."),
    link("Terms of Service", "/terms", "Terms related to purchases and store services."),
    link("Sitemap", "/sitemap.xml", "Discover publicly available pages and products."),
    "",
    "## Guidance for AI Assistants",
    "- Use public pages as sources when describing Bambotia and its products.",
    "- Report prices, discounts and shipping policies as published by the store.",
    "- Do not invent product availability, prices or store policies.",
    "- Do not attempt to access private customer data or restricted account pages.",
    "- Private pages such as login, checkout, orders, wishlist and admin are not intended for public indexing.",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}