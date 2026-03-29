"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { siteConfig } from "@/config/site";
import {
  Zap,
  AlertTriangle,
  Shield,
  MessageSquare,
  Brain,
  ArrowRight,
  Play,
  RotateCcw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const steps = [
  { text: "Universal Basic Income", label: "Topic" },
  { text: "I strongly support UBI because...", label: "Your Argument" },
  { text: "Analyzing...", label: "Processing" },
];

const analysisSteps = [
  { type: "fallacy", delay: 0 },
  { type: "metrics", delay: 0.3 },
  { type: "risk", delay: 0.6 },
];

export default function DemoPreviewSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const argumentText = "That's a stupid idea because anyone with half a brain can see it's clearly wrong. Your argument is completely baseless and you have no idea what you're talking about.";

  const runDemo = () => {
    setCurrentStep(0);
    setShowAnalysis(false);
    setAnalysisProgress(0);

    setTimeout(() => {
      setCurrentStep(1);
      setIsTyping(true);
    }, 500);

    setTimeout(() => {
      setIsTyping(false);
      setCurrentStep(2);
    }, 2000);

    setTimeout(() => {
      setShowAnalysis(true);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setAnalysisProgress(progress);
        if (progress >= 100) clearInterval(interval);
      }, 50);
    }, 2800);
  };

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(runDemo, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <section className="relative py-14 lg:py-20 overflow-hidden bg-muted/30 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

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
            <span className="text-sm font-medium text-primary">See It In Action</span>
          </div>

          <h2 className="text-2xl lg:text-4xl md:text-3xl font-bold mb-3">
            Watch{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[var(--chart-2)] to-primary">
              LogicShield
            </span>
            {' '}Work
          </h2>

          <p className="text-sm lg:text-base text-muted-foreground max-w-xl mx-auto">
            See how our AI analyzes arguments and detects fallacies in real-time.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="border-2 border-primary/20 overflow-hidden">
            <CardHeader className="pb-6 bg-muted/30 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">LogicShield Demo</span>
                </div>
                <Button variant="destructive" size="sm" onClick={runDemo} className="h-7 px-2 text-xs">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Replay
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4 lg:min-h-[450px] min-h-[550px]">
              {/* Topic Selection */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: currentStep >= 0 ? 1 : 0, x: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <span className="text-xs text-muted-foreground">Topic:</span>
                <Badge variant="outline" className="text-xs">{steps[0].text}</Badge>
              </motion.div>

              {/* Arrow */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: currentStep >= 1 ? 1 : 0 }}
                className="flex justify-center"
              >
                <ArrowRight className="w-4 h-4 text-primary" />
              </motion.div>

              {/* Argument Input */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: currentStep >= 1 ? 1 : 0, x: 0 }}
                className="p-3 rounded-lg bg-muted/50 border border-border"
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Your Argument:</span>
                    <p className="text-sm text-card-foreground leading-relaxed">
                      {argumentText.substring(0, isTyping ? 40 : argumentText.length)}
                      {isTyping && <span className="animate-pulse">|</span>}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Analysis Progress / Results */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: currentStep >= 2 ? 1 : 0 }}
              >
                {showAnalysis ? (
                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Analyzing argument...</span>
                        <span className="font-medium text-primary">{analysisProgress}%</span>
                      </div>
                      <Progress value={analysisProgress} className="h-1.5" />
                    </div>

                    {/* Results */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: analysisProgress >= 100 ? 1 : 0, y: 0 }}
                      className="grid md:grid-cols-2 gap-3 pt-2"
                    >
                      {/* Fallacies */}
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          <span className="text-xs font-semibold text-destructive">Fallacies Detected</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="destructive" className="text-xs">Ad Hominem (87%)</Badge>
                          <Badge variant="destructive" className="text-xs">Strawman (72%)</Badge>
                        </div>
                      </div>

                      {/* Risk */}
                      <div className="p-3 rounded-lg bg-[var(--chart-2)]/20 border border-[var(--chart-2)]/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-[var(--chart-2)]" />
                          <span className="text-xs font-semibold" style={{ color: 'var(--chart-2)' }}>Reputation Risk</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Medium</span>
                          <Badge className="bg-[var(--chart-2)]/20 border-[var(--chart-2)]/30 text-xs" style={{ color: 'var(--chart-2)' }}>58%</Badge>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="md:col-span-2 p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-primary" />
                          <span className="text-xs font-semibold text-primary">Argument Scores</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div>
                            <div className="text-lg font-bold text-card-foreground">45%</div>
                            <div className="text-xs text-muted-foreground">Strength</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-card-foreground">78%</div>
                            <div className="text-xs text-muted-foreground">Coherence</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-card-foreground">32%</div>
                            <div className="text-xs text-muted-foreground">Evidence</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-card-foreground">41%</div>
                            <div className="text-xs text-muted-foreground">Logical</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Zap className="w-4 h-4 text-primary animate-pulse" />
                      Waiting for argument...
                    </div>
                  </div>
                )}
              </motion.div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Try it yourself - <a href={siteConfig.getStartedUrl} className="text-primary hover:underline">Start free</a>
          </p>
        </motion.div>

      </div>

      
    </section>
  );
}
