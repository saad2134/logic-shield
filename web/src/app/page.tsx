import { siteConfig } from "@/config/site";
import Hero from "@/components/landing/hero/Hero";
import FeaturesSection from "@/components/landing/features/features";
import HowItWorksSection from "@/components/landing/how-it-works/how-it-works";
import UseCasesSection from "@/components/landing/use-cases/use-cases";
import DemoPreviewSection from "@/components/landing/demo/demo-preview";
import { PricingSection } from "@/components/landing/pricing/pricing-card";
import CTASection from "@/components/landing/cta/cta-section";
import FAQSection from "@/components/landing/faq/faq-section";
import NavbarComponent from "@/components/navbar/navbar";
import FooterSection from "@/components/footer/footer";

export const metadata = {
  title: `${siteConfig.name} ✦ ${siteConfig.tagline}`,
  description:
    `${siteConfig.description}`,
};

export default function Home() {
  return (
    <div>
      <NavbarComponent />
      <main className="min-h-screen w-full overflow-hidden bg-background text-foreground">
        <Hero />
        <FeaturesSection />
        <HowItWorksSection />
        <UseCasesSection />
        <DemoPreviewSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
}
