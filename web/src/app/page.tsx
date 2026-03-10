import { siteConfig } from "@/config/site";
import Hero from "@/components/landing/hero/Hero";
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
      </main>
      <FooterSection />
    </div>
  );
}
