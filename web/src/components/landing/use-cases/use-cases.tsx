"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { siteConfig } from "@/config/site";
import { 
  GraduationCap, 
  Scale, 
  Mic, 
  Building2, 
  Radio,
  Users,
  Zap,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

const useCases = [
  {
    icon: GraduationCap,
    title: "Students",
    description: "Prepare for debate competitions and improve critical thinking skills for academic success.",
    features: ["Competition preparation", "Critical thinking", "Research skills"],
    color: "from-primary to-[var(--chart-1)]"
  },
  {
    icon: Scale,
    title: "Law Professionals",
    description: "Practice legal argumentation and sharpen reasoning for courtroom presentations.",
    features: ["Legal arguments", "Case preparation", "Reasoning clarity"],
    color: "from-primary to-[var(--chart-2)]"
  },
  {
    icon: Mic,
    title: "Public Speakers",
    description: "Refine presentations with real-time argument analysis before going live.",
    features: ["Presentation prep", "Audience analysis", "Message strengthening"],
    color: "from-primary to-[var(--chart-3)]"
  },
  {
    icon: Building2,
    title: "Executives",
    description: "Prepare pitches with thorough risk assessment and argument optimization.",
    features: ["Pitch refinement", "Stakeholder comms", "Risk mitigation"],
    color: "from-primary to-[var(--chart-4)]"
  },
  {
    icon: Radio,
    title: "Content Creators",
    description: "Create stronger content with built-in fallacy detection and risk analysis.",
    features: ["Content credibility", "Audience trust", "Controversy mgmt"],
    color: "from-primary to-[var(--chart-5)]"
  },
  {
    icon: Users,
    title: "Everyone",
    description: "Improve daily communication skills with AI-powered analysis.",
    features: ["Everyday communication", "Relationship building", "Self-expression"],
    color: "from-primary to-[var(--chart-1)]"
  }
];

function UseCaseCard({ useCase, index }: { useCase: typeof useCases[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="group relative p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
    >
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${useCase.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
      
      <div className="relative">
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${useCase.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300`}>
          <useCase.icon className="w-4 h-4 text-white" />
        </div>
        
        <h3 className="text-base font-bold mb-1.5 text-card-foreground group-hover:text-primary transition-colors">
          {useCase.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3 leading-snug">
          {useCase.description}
        </p>
        
        <ul className="space-y-1">
          {useCase.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${useCase.color}`} />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function UseCasesSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <section className="relative py-14 lg:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
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
            <span className="text-sm font-medium text-primary">Use Cases</span>
          </div>
          
          <h2 className="text-2xl lg:text-4xl md:text-3xl font-bold mb-3">
            Built for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[var(--chart-2)] to-primary">
              Every Scenario
            </span>
          </h2>
          
          <p className="text-sm lg:text-base text-muted-foreground max-w-xl mx-auto">
            Whether you&apos;re a student, professional, or just want to communicate better - 
            LogicShield adapts to your needs.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCases.map((useCase, index) => (
            <UseCaseCard key={useCase.title} useCase={useCase} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
