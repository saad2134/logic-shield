import { siteConfig } from "@/config/site";
import ColorBends from '@/components/landing/hero/ColorBends';

export const metadata = {
  title: `${siteConfig.name} ✦ ${siteConfig.tagline}`,
  description:
    `${siteConfig.description}`,
};

export default function Home() {
  return (
    <div>
      <main className="min-h-screen w-full overflow-hidden bg-background text-foreground">
        
        <h1>Hello</h1>
      </main>
    </div>
  );
}
