"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  Brain, 
  Shield, 
  Target, 
  MessageSquare, 
  TrendingUp, 
  Zap,
  Scale,
  AlertTriangle,
  Sparkles,
  Users,
  Mic,
  FileText
} from "lucide-react";
import { siteConfig } from "@/config/site";

const features = [
  {
    icon: Brain,
    title: "AI Debate Simulation",
    description: "Practice against an AI opponent with selectable personas - from logical challenger to aggressive skeptic. Real-time responses that adapt to your arguments.",
    color: "from-primary to-[var(--chart-1)]"
  },
  {
    icon: Scale,
    title: "Fallacy Detection",
    description: "Automatically identify 15+ logical fallacies including ad hominem, strawman, false dilemma, and slippery slope using transformer-based ML models.",
    color: "from-primary to-[var(--chart-2)]"
  },
  {
    icon: Target,
    title: "Argument Strength Scoring",
    description: "Quantify your argument quality across coherence, evidence support, sentiment, and logical structure. Get detailed scores to improve.",
    color: "from-primary to-[var(--chart-3)]"
  },
  {
    icon: AlertTriangle,
    title: "Reputation Risk Analysis",
    description: "Evaluate potential public reception with toxicity and hate speech detection. Flag extreme phrasing before you publish or present.",
    color: "from-primary to-[var(--chart-4)]"
  },
  {
    icon: TrendingUp,
    title: "Progress Analytics",
    description: "Track your improvement across debate sessions with detailed analytics. Visualize your growth in real-time.",
    color: "from-primary to-[var(--chart-5)]"
  },
  {
    icon: Sparkles,
    title: "AI Rewrite Suggestions",
    description: "Get AI-powered suggestions to strengthen and clarify your arguments for maximum impact and clarity.",
    color: "from-primary to-[var(--chart-1)]"
  }
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group relative p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
    >
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className={`relative w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300`}>
        <feature.icon className="w-5 h-5 text-white" />
      </div>
      
      <h3 className="text-base font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
        {feature.title}
      </h3>
      
      <p className="text-sm text-muted-foreground leading-snug">
        {feature.description}
      </p>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <section id="features" className="relative py-16 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
        <motion.div 
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powerful Features</span>
          </div>
          
          <h2 className="text-2xl lg:text-4xl md:text-3xl font-bold mb-3">
            Everything You Need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[var(--chart-2)] to-primary">
              Win Debates
            </span>
          </h2>
          
          <p className="text-sm lg:text-base text-muted-foreground max-w-3xl mx-auto">
            {siteConfig.name} combines adversarial argument simulation with structured NLP analysis 
            to help you improve both logic and long-term communication safety.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
