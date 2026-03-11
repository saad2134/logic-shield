import NavbarComponent from "@/components/navbar/navbar";
import FooterSection from "@/components/footer/footer";
import { PricingSection } from "@/components/landing/pricing/pricing-card";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: `Pricing ✦ ${siteConfig.name}`,
  description: "Choose the plan that fits your debate training needs. Start free, upgrade when you're ready to enhance your argument analysis skills.",
};


export default async function Pricing() {
  return (
    <>
      <main className="min-h-screen w-full overflow-hidden">
        <NavbarComponent />
        <div className="pt-16">
          <PricingSection />
        </div>
        <FooterSection />
      </main>
    </>
  );
}
