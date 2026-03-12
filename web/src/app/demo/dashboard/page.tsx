"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MessageSquare,
  Shield,
  TrendingUp,
  AlertTriangle,
  History,
  Zap,
  Target,
  ArrowRight,
  Brain,
  BarChart3,
  Lightbulb,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { api, AnalysisResult } from "@/lib/api";

export default function Dashboard() {
  const router = useRouter();
  const [healthStatus, setHealthStatus] = React.useState<Record<string, string> | null>(null);
  const [personas, setPersonas] = React.useState<Array<{ id: string; name: string; description: string }>>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDemoMode, setIsDemoMode] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      try {
        const health = await api.health();
        setHealthStatus(health.services);
        const isDemo = health.status === "demo";
        setIsDemoMode(isDemo);
        const personasData = await api.getPersonas();
        setPersonas(personasData);
      } catch (error) {
        console.error("Failed to load data:", error);
        setIsDemoMode(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const services = [
    {
      name: "Fallacy Detection",
      description: "Identify logical fallacies in arguments",
      icon: AlertTriangle,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      name: "Argument Analysis",
      description: "Strength & coherence scoring",
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      name: "Reputation Risk",
      description: "Detect communication risks",
      icon: Shield,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      name: "Debate Simulator",
      description: "AI-powered sparring partner",
      icon: MessageSquare,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  const features = [
    {
      title: "AI Debate Simulation",
      description: "Practice against AI opponents with different personas",
      icon: Brain,
    },
    {
      title: "Fallacy Detection",
      description: "Automatically identifies common logical fallacies",
      icon: AlertCircle,
    },
    {
      title: "Argument Scoring",
      description: "Quantifies coherence, evidence, and logical structure",
      icon: BarChart3,
    },
    {
      title: "Risk Estimation",
      description: "Flags extreme phrasing and reputational risks",
      icon: Shield,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome to LogicShield</h1>
              <p className="text-muted-foreground mt-1">
                Strengthen your arguments, detect fallacies, and evaluate reputational risk
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/demo/debate">
                  <Zap className="mr-2 h-4 w-4" />
                  Start Debate
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/demo/analysis">
                  <Target className="mr-2 h-4 w-4" />
                  Analyze Text
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="text-primary" size={20} />
                    Core Features
                  </CardTitle>
                  <CardDescription>
                    What LogicShield can do for you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <feature.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="text-primary" size={20} />
                    Debate Personas
                  </CardTitle>
                  <CardDescription>
                    Choose your AI opponent style
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {personas.map((persona, index) => (
                      <motion.div
                        key={persona.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        className="p-4 rounded-lg border"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground capitalize">{persona.name.replace("_", " ")}</h3>
                            <p className="text-sm text-muted-foreground">{persona.description}</p>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/demo/debate?persona=${persona.id}`}>
                              Try <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                    {personas.length === 0 && !isLoading && (
                      <p className="text-muted-foreground text-center py-4">
                        Connect to backend to see available personas
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="text-primary" size={20} />
                    Quick Analysis
                  </CardTitle>
                  <CardDescription>
                    Instantly analyze any argument
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <textarea
                      placeholder="Enter your argument to analyze..."
                      className="w-full min-h-[100px] p-3 rounded-lg border bg-background resize-none"
                    />
                    <div className="flex justify-end">
                      <Button>
                        <Zap className="mr-2 h-4 w-4" />
                        Analyze Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-500" size={20} />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {healthStatus ? (
                    <div className="space-y-3">
                      {Object.entries(healthStatus).map(([service, status]) => (
                        <div key={service} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{service.replace("_", " ")}</span>
                          <Badge variant={status === "active" ? "default" : "destructive"}>
                            {status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : isLoading ? (
                    <p className="text-muted-foreground text-center py-4">Checking status...</p>
                  ) : (
                    <div className="text-center py-4">
                      <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Backend not connected</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Start the backend server to enable features
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="text-primary" size={20} />
                    Recent Debates
                  </CardTitle>
                  <CardDescription>
                    Your debate history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center py-4">
                      <p className="text-muted-foreground text-sm">No debates yet</p>
                      <Button variant="link" size="sm" asChild className="mt-2">
                        <Link href="/demo/debate">Start your first debate</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/demo/history">
                      <History className="mr-2 h-4 w-4" />
                      Debate History
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/demo/analysis">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Full Analysis
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
