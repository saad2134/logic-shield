import Link from "next/link";
import { siteConfig } from "@/config/site";
import ColorBends from "@/components/landing/hero/ColorBends";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <ColorBends
          colors={["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"]}
          speed={0.15}
          scale={1.2}
          frequency={1.5}
          warpStrength={1.2}
          mouseInfluence={0.8}
          parallax={0.4}
          noise={0.05}
          transparent={true}
          className="opacity-90"
        />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border text-sm mb-8">
            <Shield className="w-4 h-4" />
            <span>{siteConfig.version}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight">
            {siteConfig.name}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--chart-1)] via-[var(--chart-2)] to-[var(--chart-3)]">
              {siteConfig.tagline}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {siteConfig.description}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="px-8 h-12 text-base font-semibold">
              <Link href={siteConfig.getStartedUrl}>
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 h-12 text-base">
              <Link href={siteConfig.links.github} target="_blank" rel="noopener noreferrer">
                View on GitHub
              </Link>
            </Button>
          </div>
          
        </div>
      </div>
    </section>
  );
}
