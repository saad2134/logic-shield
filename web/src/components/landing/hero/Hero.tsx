import Link from "next/link";
import { siteConfig } from "@/config/site";
import ColorBends from "@/components/landing/hero/ColorBends";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Brain, TrendingUp } from "lucide-react";

const themeColors = {
  chart1: "c45d32",
  chart2: "a85429",
  chart3: "8c4d28",
  chart4: "6f4020",
  chart5: "53321b",
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <ColorBends
          colors={[themeColors.chart1, themeColors.chart2, themeColors.chart3, themeColors.chart4, themeColors.chart5]}
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white/90 mb-8">
            <Shield className="w-4 h-4" />
            <span>{siteConfig.version}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            {siteConfig.name}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--chart-1)] via-[var(--chart-2)] to-[var(--chart-3)] leading-21">
              {siteConfig.tagline}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            {siteConfig.description}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-white/90 px-8 h-12 text-base font-semibold">
              <Link href={siteConfig.getStartedUrl}>
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white px-8 h-12 text-base">
              <Link href={siteConfig.links.github}>
                View on GitHub
              </Link>
            </Button>
          </div>
          
          
        </div>
      </div>
    </section>
  );
}
