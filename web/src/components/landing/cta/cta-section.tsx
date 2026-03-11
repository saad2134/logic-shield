"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Github, CheckCircle2 } from "lucide-react";

export default function CTASection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <section className="relative py-14 lg:py-20 overflow-hidden px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[var(--chart-2)]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
      
      <div className="relative max-w-4xl mx-auto px-4 lg:px-6 text-center">
        <motion.div 
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl lg:text-5xl md:text-4xl font-bold mb-4">
            Ready to Sharpen Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[var(--chart-2)] to-primary">
              Arguments
            </span>
            ?
          </h2>
          
          <p className="text-sm lg:text-base text-muted-foreground mb-6 max-w-xl mx-auto">
            Join thousands of debaters and professionals who use {siteConfig.name} to improve their argumentation skills.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Button asChild size="lg" className="px-6 h-10 text-sm font-semibold min-w-[180px]">
              <Link href={siteConfig.getStartedUrl}>
                Start Debating Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-6 h-10 text-sm min-w-[180px]">
              <Link href={siteConfig.links.github} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 w-4 h-4" />
                View on GitHub
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
