"use client";

import { useState } from "react";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { siteConfig } from "@/config/site";
import { faqConfig } from "@/config/faqConfig";
import { Zap, Plus, Minus, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

function FAQItemComponent({ item, index }: { item: typeof faqConfig[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <Card 
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "border-primary/30 bg-card" : "bg-card/50 hover:bg-card"
        }`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 text-left flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <span className="font-medium text-card-foreground text-sm">
              {item.question}
            </span>
          </div>
          <div className={`flex-shrink-0 p-1 rounded-full transition-transform duration-300 ${isOpen ? "rotate-180 bg-primary/10" : "bg-muted"}`}>
            {isOpen ? (
              <Minus className="w-3 h-3 text-primary" />
            ) : (
              <Plus className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
        </button>
        
        <motion.div
          initial={false}
          animate={{ 
            height: isOpen ? "auto" : 0,
            opacity: isOpen ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-4 ml-7">
            <p className="text-sm text-muted-foreground leading-snug">
              {item.answer}
            </p>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}

export default function FAQSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <section id="faqs" className="relative py-14 lg:py-20 overflow-hidden bg-muted/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Side - Header */}
          <motion.div 
            ref={containerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 mb-4">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">FAQ</span>
            </div>
            
            <h2 className="text-2xl lg:text-4xl md:text-3xl font-bold mb-3">
              Frequently Asked{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[var(--chart-2)] to-primary">
                Questions
              </span>
            </h2>
            
            <p className="text-sm lg:text-base text-muted-foreground mb-6">
              Everything you need to know about {siteConfig.name}. Can&apos;t find an answer?{' '}
              <a href="/contact" className="text-primary hover:underline">Contact us</a>.
            </p>
          </motion.div>

          {/* Right Side - FAQ List */}
          <div className="lg:col-span-3 space-y-2">
            {faqConfig.map((item, index) => (
              <FAQItemComponent key={index} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
