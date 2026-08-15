"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  Loader2,
  AlertCircle,
  Check,
  Copy,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  FileText,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Flame,
  UserCheck,
  Scale
} from "lucide-react";
import { api, RiskScanResult } from "@/lib/api-app";

export default function RiskScannerClient() {
  const [text, setText] = React.useState("");
  const [context, setContext] = React.useState("");
  const [result, setResult] = React.useState<RiskScanResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [applied, setApplied] = React.useState(false);
  const [isFlashing, setIsFlashing] = React.useState(false);

  const handleScan = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    setApplied(false);

    try {
      const response = await api.scanCommunicationRisk(text, context);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze communication risk.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setText("");
    setContext("");
    setResult(null);
    setError(null);
    setApplied(false);
  };

  const handleCopyRewrite = () => {
    if (!result?.rewrite_suggestion) return;
    navigator.clipboard.writeText(result.rewrite_suggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyRewrite = () => {
    if (!result?.rewrite_suggestion) return;
    setText(result.rewrite_suggestion);
    setApplied(true);
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 1000);
    setTimeout(() => setApplied(false), 3000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "#10b981"; // Emerald/Green
    if (score >= 0.5) return "#f59e0b"; // Amber/Yellow
    return "#ef4444"; // Red
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 0.8) return "text-emerald-500 border-emerald-500/20 bg-emerald-500/10";
    if (score >= 0.5) return "text-amber-500 border-amber-500/20 bg-amber-500/10";
    return "text-red-500 border-red-500/20 bg-red-500/10";
  };

  const getRiskLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10">Low Risk</Badge>;
      case "medium":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/10">Medium Risk</Badge>;
      case "high":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/10">High Risk</Badge>;
      default:
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10">{level}</Badge>;
    }
  };

  // SVG parameters for circular meter
  const radius = 70;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const scorePercent = result ? result.publish_safe_score : 0;
  const strokeDashoffset = circumference - scorePercent * circumference;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
          >
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <Card className="border-foreground/10 bg-background/50 backdrop-blur-sm shadow-xl flex-grow flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Input Communication
              </CardTitle>
              <CardDescription>
                Paste your drafted email, proposal, or message to scan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow flex flex-col">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-foreground/80">Context / Intent (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Email toVC pitching seed deck, Reply to frustrated client, Press release"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md border-foreground/10 bg-background/30 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/60 transition-colors"
                />
              </div>

              <div className="flex flex-col space-y-2 flex-grow min-h-[250px]">
                <label className="text-sm font-semibold text-foreground/80">Content</label>
                <div className="relative flex-grow flex flex-col">
                  <Textarea
                    placeholder="Enter your professional communication draft here (at least 10 words for best analysis)..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className={`flex-grow resize-none border-foreground/10 bg-background/30 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/60 transition-all min-h-[200px] duration-300 ${
                      isFlashing ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/5" : ""
                    }`}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                    {text.split(/\s+/).filter(Boolean).length} words
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={handleScan}
                  disabled={isLoading || !text.trim()}
                  className="flex-grow shadow-md hover:shadow-lg transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing Content...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" /> Scan & Optimize
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isLoading || (!text && !context)}
                  className="border-foreground/10 hover:bg-foreground/5"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Side-by-Side Comparison (Displays only after Scan) */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <Card className="border-foreground/10 bg-background/40 backdrop-blur-sm shadow-lg overflow-hidden">
                  <div className="bg-primary/5 px-6 py-3 border-b border-foreground/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      <span className="font-semibold text-sm">Safer & Professional Suggestion</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopyRewrite}
                        className="h-8 text-xs hover:bg-foreground/5 gap-1.5"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={handleApplyRewrite}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                      >
                        {applied ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Applied Quick Fix
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-3.5 h-3.5" /> Apply Rewrite
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-background/20 divide-y md:divide-y-0 md:divide-x divide-foreground/5">
                    {/* Original Column */}
                    <div className="space-y-2 pr-0 md:pr-4">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Original Draft</h4>
                      <p className="text-sm leading-relaxed text-foreground/80 break-words whitespace-pre-wrap">
                        {text}
                      </p>
                    </div>

                    {/* Rewritten Column */}
                    <div className="space-y-2 pt-4 md:pt-0 md:pl-6">
                      <h4 className="text-xs font-semibold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                        Suggested Rewrite
                      </h4>
                      <p className="text-sm leading-relaxed text-emerald-600/90 dark:text-emerald-400/90 font-medium break-words whitespace-pre-wrap">
                        {result.rewrite_suggestion}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Analysis Panel */}
        <div className="lg:col-span-5 flex flex-col">
          <Card className="border-foreground/10 bg-background/50 backdrop-blur-sm shadow-xl flex-grow flex flex-col overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Safety Assessment</CardTitle>
              <CardDescription>
                Detailed risk evaluation of the drafted communication.
              </CardDescription>
            </CardHeader>
            <CardContent className={`flex-grow flex flex-col ${!result ? "justify-center" : "justify-start"}`}>
              <AnimatePresence mode="wait">
                {!result ? (
                  /* Placeholder State */
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12 flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center border border-foreground/10 shadow-inner">
                      <Shield className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2 max-w-sm">
                      <h3 className="font-semibold text-lg">No Active Scan</h3>
                      <p className="text-sm text-muted-foreground">
                        Enter your drafted communication on the left and click **Scan & Optimize** to verify publication safety.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  /* Active Scan State */
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 py-4"
                  >
                    {/* Score Circle & Risk Badge */}
                    <div className="flex flex-col items-center justify-center py-2 space-y-4">
                      <div className="relative flex items-center justify-center">
                        <svg className="w-44 h-44 transform -rotate-90">
                          {/* Background gauge */}
                          <circle
                            cx="88"
                            cy="88"
                            r={radius}
                            className="stroke-foreground/5 fill-none"
                            strokeWidth={strokeWidth}
                          />
                          {/* Foreground gauge */}
                          <motion.circle
                            cx="88"
                            cy="88"
                            r={radius}
                            className="fill-none"
                            stroke={getScoreColor(result.publish_safe_score)}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-4xl font-extrabold tracking-tight">
                            {Math.round(result.publish_safe_score * 100)}%
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
                            Publish-Safe
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center space-y-1">
                        {getRiskLevelBadge(result.risk_level)}
                        {result.demo_mode && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            Demo Mode Fallback
                          </span>
                        )}
                      </div>
                    </div>

                    <hr className="border-foreground/10" />

                    {/* Score Breakdown Sliders */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Risk Breakdown
                      </h4>
                      
                      {/* Tone Score */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-foreground/80">
                            <Scale className="w-3.5 h-3.5 text-blue-500" /> Professional Tone
                          </span>
                          <span className="font-semibold">{Math.round(result.tone_score * 100)}%</span>
                        </div>
                        <Progress value={result.tone_score * 100} className="h-2 bg-foreground/5" />
                        <p className="text-[11px] text-muted-foreground">
                          Measures emotional restraint, objectivity, and balance.
                        </p>
                      </div>

                      {/* Factuality Score */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-foreground/80">
                            <FileText className="w-3.5 h-3.5 text-purple-500" /> Evidence & Factuality
                          </span>
                          <span className="font-semibold">{Math.round(result.factuality_score * 100)}%</span>
                        </div>
                        <Progress value={result.factuality_score * 100} className="h-2 bg-foreground/5" />
                        <p className="text-[11px] text-muted-foreground">
                          Scans for citation indicators, references, and verifiable statements.
                        </p>
                      </div>

                      {/* Sensitivity Score */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-foreground/80">
                            <Flame className="w-3.5 h-3.5 text-orange-500" /> Safety & Sensitivity
                          </span>
                          <span className="font-semibold">{Math.round(result.sensitivity_score * 100)}%</span>
                        </div>
                        <Progress value={result.sensitivity_score * 100} className="h-2 bg-foreground/5" />
                        <p className="text-[11px] text-muted-foreground">
                          Analyzes lack of toxic speech, bias, or offensive keywords.
                        </p>
                      </div>
                    </div>

                    <hr className="border-foreground/10" />

                    {/* Risk Factors List */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Identified Risks
                      </h4>
                      {result.risk_factors.length === 0 ? (
                        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-lg text-sm">
                          <ThumbsUp className="w-4 h-4 shrink-0" />
                          <span>No communication risks identified. This draft is ready to publish!</span>
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {result.risk_factors.map((factor, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex items-start gap-2.5 text-sm text-foreground/90 bg-foreground/5 border border-foreground/10 px-3 py-2.5 rounded-lg"
                            >
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <span>{factor}</span>
                            </motion.li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  </div>
  );
}
