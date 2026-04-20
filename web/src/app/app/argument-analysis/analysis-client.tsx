"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  Zap,
  Loader2,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  Brain,
  Target,
  CheckCircle2,
  XCircle,
  TriangleAlert,
  BarChart3,
  Scale,
  MessageSquare
} from "lucide-react";
import { api, AnalysisResult } from "@/lib/api-app";

export default function AnalysisClient() {
  const searchParams = useSearchParams();
  const [text, setText] = React.useState("");
  const [context, setContext] = React.useState("");
  const [analysis, setAnalysis] = React.useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"overview" | "fallacies" | "risks">("overview");

  React.useEffect(() => {
    const textParam = searchParams.get("text");
    if (textParam) {
      setText(textParam);
      setTimeout(() => handleAnalyze(textParam), 100);
    }
  }, [searchParams]);

  const handleAnalyze = async (textToAnalyze?: string) => {
    const textToUse = textToAnalyze || text;
    if (!textToUse.trim()) {
      setError("Please enter text to analyze");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await api.analyze(textToUse, context);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze text");
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "high":
        return "text-orange-500";
      case "critical":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getRiskBg = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return "bg-green-500/10 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 border-yellow-500/20";
      case "high":
        return "bg-orange-500/10 border-orange-500/20";
      case "critical":
        return "bg-red-500/10 border-red-500/20";
      default:
        return "bg-gray-500/10 border-gray-500/20";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return CheckCircle2;
      case "medium":
        return AlertTriangle;
      case "high":
        return TriangleAlert;
      case "critical":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const RiskIcon = analysis ? getRiskIcon(analysis.reputation_risk_level) : AlertCircle;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
          >
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="text-primary" size={20} />
                  Input Text
                </CardTitle>
                <CardDescription>
                  Enter the argument you want to analyze
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Argument</label>
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter your argument here..."
                    className="min-h-[150px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Context (optional)</label>
                  <Textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Additional context about the argument..."
                    className="min-h-[80px]"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleAnalyze()}
                  disabled={isLoading || !text.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Analyze Argument
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {analysis ? (
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="text-primary" size={20} />
                    Analysis Results
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of your argument
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2 p-1 bg-muted rounded-lg">
                      {(["overview", "fallacies", "risks"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                            activeTab === tab
                              ? "bg-background shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>

                    {activeTab === "overview" && (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-lg border ${getRiskBg(analysis.reputation_risk_level)}`}>
                          <div className="flex items-center gap-3">
                            <RiskIcon className={`h-6 w-6 ${getRiskColor(analysis.reputation_risk_level)}`} />
                            <div>
                              <h3 className={`font-semibold ${getRiskColor(analysis.reputation_risk_level)}`}>
                                Reputational Risk: {analysis.reputation_risk_level}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Score: {Math.round(analysis.reputation_risk_score * 100)}%
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium">Argument Strength</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Overall Strength</span>
                              <span className="font-medium">{Math.round(analysis.argument_strength * 100)}%</span>
                            </div>
                            <Progress value={analysis.argument_strength * 100} className="h-2" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                              <Scale className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Coherence</span>
                            </div>
                            <span className="text-xl font-bold">{Math.round(analysis.coherence_score * 100)}%</span>
                          </div>
                          <div className="p-3 rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                              <Target className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Evidence</span>
                            </div>
                            <span className="text-xl font-bold">{Math.round(analysis.evidence_score * 100)}%</span>
                          </div>
                          <div className="p-3 rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Sentiment</span>
                            </div>
                            <span className="text-xl font-bold">{Math.round(analysis.sentiment_score * 100)}%</span>
                          </div>
                          <div className="p-3 rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                              <Brain className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Logic</span>
                            </div>
                            <span className="text-xl font-bold">{Math.round(analysis.logical_score * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "fallacies" && (
                      <div className="space-y-4">
                        {analysis.fallacy_detected.length > 0 ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-orange-500">
                              <AlertTriangle className="h-5 w-5" />
                              <span className="font-medium">Fallacies Detected</span>
                            </div>
                            {analysis.fallacy_detected.map((fallacy, idx) => (
                              <motion.div
                                key={fallacy}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-3 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium capitalize">{fallacy.replace(/_/g, " ")}</span>
                                  <Badge variant="outline">
                                    {Math.round((analysis.fallacy_confidences[fallacy] || 0) * 100)}% confidence
                                  </Badge>
                                </div>
                                {analysis.fallacy_descriptions[fallacy] && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {analysis.fallacy_descriptions[fallacy]}
                                  </p>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                            <h3 className="font-semibold">No Fallacies Detected</h3>
                            <p className="text-sm text-muted-foreground">
                              Your argument appears to be logically sound
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "risks" && (
                      <div className="space-y-4">
                        {analysis.risk_factors.length > 0 ? (
                          <div className="space-y-3">
                            {analysis.risk_factors.map((risk, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-3 rounded-lg border"
                              >
                                <p className="text-sm text-foreground">{risk}</p>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Shield className="h-12 w-12 text-green-500 mx-auto mb-3" />
                            <h3 className="font-semibold">No Risks Detected</h3>
                            <p className="text-sm text-muted-foreground">
                              Your argument appears safe for public discourse
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Analysis Yet</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    Enter an argument and click &quot;Analyze&quot; to see detailed results
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
