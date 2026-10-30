import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Open_Sans, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/app/providers";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_URL } from "@/utils/seo";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans", display: "swap" });

const description ="Shop bridal jewellery sets, earrings, bangles and necklaces online in Pakistan. Cash on delivery and delivery to Karachi, Lahore, Islamabad and all cities.";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF6EF" },
    { media: "(prefers-color-scheme: dark)", color: "#08100d" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "BAMBOTIA | Online Jewellery Store in Pakistan", template: "%s | BAMBOTIA" },
  icons: { icon: "/favicon.png"},
  description,
  applicationName: SITE_NAME,
  authors: [{ name: "Muhammad Junaid Bambotia" }],
  creator: "Muhammad Junaid Bambotia",
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  verification: { google: "xGpr02xdnP6KG74Xtn6XRrz09YjXSqkfedZmUleD4N8" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_PK",
    title: "BAMBOTIA | Online Jewellery Store in Pakistan",
    description,
  },
  twitter: { card: "summary_large_image", site: "@bambotia", title: "BAMBOTIA | Online Jewellery Store in Pakistan", description },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "OnlineStore",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.png` },
      description,
      areaServed: { "@type": "Country", name: "Pakistan" },
      currenciesAccepted: "PKR",
      paymentAccepted: "Cash on delivery, Bank transfer, Easypaisa",
      sameAs: ["https://instagram.com/bambotiaa", "https://facebook.com/bambotia"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      inLanguage: "en-PK",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/shop?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

const BOOT_SCRIPT = `try{var d=document.documentElement,t=localStorage.getItem("bambotia:theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";d.dataset.theme=t;if(sessionStorage.getItem("bambotia:splash-seen"))d.setAttribute("data-splash-seen","")}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-PK" className={`${jakarta.variable} ${outfit.variable} ${openSans.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <JsonLd data={structuredData} />
      </head>
      <body className="bg-[var(--color-background)] font-sans">
        <Providers>{children}</Providers>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-4Q1KW0MV1F" strategy="lazyOnload" />
        <Script id="google-analytics" strategy="lazyOnload">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','G-4Q1KW0MV1F');`}
        </Script>
      </body>
    </html>
  );
}
