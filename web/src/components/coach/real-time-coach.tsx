"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QuickAnalysisResult } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap
} from "lucide-react";

interface RealTimeCoachProps {
  text: string;
  onSuggestionClick?: (suggestion: string) => void;
  disabled?: boolean;
  difficulty?: "basic" | "intermediate" | "advanced";
  context?: string;
  quickAnalyzeFn?: (text: string, context: string, difficulty: string) => Promise<QuickAnalysisResult>;
}

export function RealTimeCoach({
  text,
  onSuggestionClick,
  disabled = false,
  difficulty = "intermediate",
  context = "",
  quickAnalyzeFn
}: RealTimeCoachProps) {
  const [analysis, setAnalysis] = React.useState<QuickAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPanel, setShowPanel] = React.useState(true);
  const [lastAnalyzedText, setLastAnalyzedText] = React.useState("");

  React.useEffect(() => {
    if (!text.trim() || disabled) {
      if (!text.trim()) {
        setAnalysis(null);
        setLastAnalyzedText("");
      }
      return;
    }

    if (!quickAnalyzeFn) {
      console.warn("No quickAnalyzeFn provided to RealTimeCoach");
      return;
    }

    // Skip if we already analyzed this exact text
    if (text.trim() === lastAnalyzedText.trim()) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        console.log("RealTimeCoach: Analyzing:", text.substring(0, 50));
        const result = await quickAnalyzeFn(text, context, difficulty);
        console.log("RealTimeCoach: Result:", result);
        setAnalysis(result || null);
        setLastAnalyzedText(text);
      } catch (err) {
        console.error("Quick analysis failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [text, difficulty, context, disabled, quickAnalyzeFn, lastAnalyzedText]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case "medium":
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      default:
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/10 border-red-500/30";
      case "medium":
        return "bg-yellow-500/10 border-yellow-500/30";
      default:
        return "bg-green-500/10 border-green-500/30";
    }
  };

  if (!text.trim()) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Real-Time Coach</span>
            {isLoading && (
              <span className="text-xs text-muted-foreground animate-pulse">
                Analyzing...
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPanel(!showPanel)}
            className="h-6 px-2"
          >
            {showPanel ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {analysis && (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Argument Score</span>
                        <span className="font-medium">
                          {Math.round(analysis.overall_score * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={analysis.overall_score * 100}
                        className="h-1.5"
                      />
                    </div>
                    
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        analysis.is_healthy
                          ? "bg-green-500/20 text-green-600 dark:text-green-400"
                          : analysis.risk_level === "medium"
                          ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                          : "bg-red-500/20 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {analysis.is_healthy ? "Healthy" : analysis.risk_level}
                    </div>
                  </div>

                  {analysis.issues.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Issues Found:
                      </span>
                      {analysis.issues.map((issue, idx) => (
                        <TooltipProvider key={idx}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`flex items-center gap-2 p-2 rounded-md border text-sm ${getSeverityColor(issue.severity)}`}
                              >
                                {getSeverityIcon(issue.severity)}
                                <span className="capitalize">
                                  {issue.name.replace(/_/g, " ")}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                {issue.type === "fallacy"
                                  ? `Confidence: ${Math.round((issue.confidence || 0) * 100)}%`
                                  : `Risk level: ${issue.risk_level}`}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  )}

                  {analysis.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" />
                        Suggestions:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {analysis.suggestions.map((suggestion, idx) => (
                          <TooltipProvider key={idx}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors"
                                  onClick={() => onSuggestionClick?.(suggestion)}
                                >
                                  <Zap className="h-3 w-3 mr-1" />
                                  {suggestion.length > 40
                                    ? suggestion.slice(0, 40) + "..."
                                    : suggestion}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs max-w-[250px]">{suggestion}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.is_healthy && analysis.issues.length === 0 && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Your argument looks good!</span>
                    </div>
                  )}
                </>
              )}

              {!analysis && !isLoading && text.trim().length > 0 && (
                <div className="text-xs text-muted-foreground p-2">
                  Keep typing to get real-time feedback...
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}