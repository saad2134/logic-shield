"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  MessageSquarePlus, 
  Target, 
  Zap, 
  ChevronRight,
  Bot,
  Scale,
  Sparkles
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquarePlus,
    title: "Choose Your Topic & Stance",
    description: "Select any debate topic and specify whether you support or oppose the motion. Set the context for a focused argument session.",
    details: ["Any topic from politics to ethics", "Support, oppose, or neutral stance", "Custom context for depth"]
  },
  {
    number: "02",
    icon: Bot,
    title: "Face Your AI Opponent",
    description: "Engage in a real-time debate with an AI adversary. Choose from multiple personas - logical, aggressive, skeptical, or devil's advocate.",
    details: ["4 distinct AI personas", "Real-time counter-arguments", "Adaptive responses"]
  },
  {
    number: "03",
    icon: Scale,
    title: "Get Instant Analysis",
    description: "Receive comprehensive analysis of your arguments including fallacy detection, strength scoring, and coherence evaluation.",
    details: ["15+ fallacy types detected", "Multi-metric scoring", "Detailed feedback"]
  },
  {
    number: "04",
    icon: Sparkles,
    title: "Improve with AI Suggestions",
    description: "Get AI-powered rewrite suggestions to strengthen your arguments. Learn from every session with progress tracking.",
    details: ["Rewrite suggestions", "Progress analytics", "Continuous improvement"]
  }
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -15 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -15 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative flex gap-4"
    >
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
          {step.number}
        </div>
        {index < steps.length - 1 && (
          <div className="w-px h-16 bg-gradient-to-b from-primary/30 to-transparent mt-3" />
        )}
      </div>
      
      <div className="flex-1 pb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
          <step.icon className="w-4 h-4 text-primary" />
        </div>
        
        <h3 className="text-base font-bold mb-1.5 text-foreground">
          {step.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3 leading-snug">
          {step.description}
        </p>
        
        <ul className="space-y-1">
          {step.details.map((detail, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <ChevronRight className="w-3 h-3 text-primary/60" />
              {detail}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function HowItWorksSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <section className="relative py-14 lg:py-20 overflow-hidden bg-muted/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
        <motion.div 
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">How It Works</span>
          </div>
          
          <h2 className="text-2xl lg:text-4xl md:text-3xl font-bold mb-3">
            From Topic to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[var(--chart-2)] to-primary">
              Victory
            </span>
            {' '}in 4 Steps
          </h2>
          
          <p className="text-sm lg:text-base text-muted-foreground max-w-xl mx-auto">
            Master the art of argumentation with our systematic approach to debate training.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
