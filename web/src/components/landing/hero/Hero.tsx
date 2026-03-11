"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Brain, Scale, Target } from "lucide-react";
import { motion } from "framer-motion";
import LightRays from './LightRays';

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Animated Light Rays Background */}
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#f59e0b"
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          className="custom-rays"
          pulsating={false}
          fadeDistance={1}
          saturation={1}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border text-sm mb-4"
          >
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">AI-Powered Debate Training</span>
          </motion.div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 tracking-tight leading-[1.3]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[var(--chart-2)] to-[var(--chart-3)]">
              {siteConfig.tagline}
            </span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
            {siteConfig.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mb-6">
            <Button asChild size="lg" className="px-6 h-10 text-sm font-semibold">
              <Link href={siteConfig.getStartedUrl}>
                Start Debating Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-6 h-10 text-sm">
              <Link href={siteConfig.links.github} target="_blank" rel="noopener noreferrer">
                View on GitHub
              </Link>
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/80 backdrop-blur-sm border border-border text-xs">
              <Brain className="w-3.5 h-3.5 text-primary" />
              <span>AI Debates</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/80 backdrop-blur-sm border border-border text-xs">
              <Scale className="w-3.5 h-3.5 text-primary" />
              <span>Fallacy Detection</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/80 backdrop-blur-sm border border-border text-xs">
              <Target className="w-3.5 h-3.5 text-primary" />
              <span>Risk Analysis</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
