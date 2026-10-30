import HeroSection from "./HeroSection";
import HomeSections from "./HomeSections";
import { TrustRow } from "@/components/TrustRow";
import { HomeIntro } from "@/components/HomeIntro";
import { SeoFaq } from "@/components/SeoFaq";
import { getShippingRules } from "@/server/ssr";
import { storeFaqs } from "@/utils/storeFacts";

export default async function Index() {
  const rules = await getShippingRules();
  return (
    <main>
      <HeroSection />
      <TrustRow rules={rules} />
      <HomeSections />
      <HomeIntro />
      <SeoFaq title="Frequently asked questions" faqs={storeFaqs(rules)} />
    </main>
  );
}
