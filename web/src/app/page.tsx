import { siteConfig } from "@/config/site";
import Hero from "@/components/landing/hero/Hero";

export const metadata = {
  title: `${siteConfig.name} ✦ ${siteConfig.tagline}`,
  description:
    `${siteConfig.description}`,
};

export default function Home() {
  return (
    <div>
      <main className="min-h-screen w-full overflow-hidden bg-background text-foreground">
        <Hero />
      </main>
    </div>
  );
}
