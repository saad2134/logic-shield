"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { api, PersonaInfo, UserStats, DebateSession } from "@/lib/api-app";

export default function DashboardClient() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [healthStatus, setHealthStatus] = React.useState<Record<string, string> | null>(null);
  const [personas, setPersonas] = React.useState<PersonaInfo[]>([]);
  const [stats, setStats] = React.useState<UserStats | null>(null);
  const [recentDebates, setRecentDebates] = React.useState<DebateSession[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [quickAnalysisText, setQuickAnalysisText] = React.useState("");

  const handleQuickAnalysis = () => {
    if (quickAnalysisText.trim()) {
      router.push(`/app/argument-analysis?text=${encodeURIComponent(quickAnalysisText)}`);
    }
  };

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    } else if (!authLoading && user && !user.experience_level) {
      router.push("/app/onboarding");
    }
  }, [user, authLoading, router]);

  React.useEffect(() => {
    if (!user || authLoading) return;

    async function loadData() {
      try {
        const [healthData, personasData, statsData, debatesData] = await Promise.all([
          api.health(),
          api.getPersonas(),
          api.getUserStats().catch(() => null),
          api.getUserDebates(5, 0).catch(() => ({ debates: [], total: 0 })),
        ]);
        
        setHealthStatus(healthData.services);
        setPersonas(personasData);
        setStats(statsData);
        setRecentDebates(debatesData.debates);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user, authLoading]);

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

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-48" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Dashboard</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Welcome back, {user?.full_name || "User"}!
              </h1>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/app/debate">
                  <Zap className="mr-2 h-4 w-4" />
                  Start Debate
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/app/argument-analysis">
                  <Target className="mr-2 h-4 w-4" />
                  Analyze
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-xs">Total Debates</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.total_debates}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs">Win Rate</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.win_rate}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Brain className="h-4 w-4" />
                    <span className="text-xs">Avg Strength</span>
                  </div>
                  <div className="text-2xl font-bold">{Math.round(stats.avg_argument_strength * 100)}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs">Day Streak</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.current_streak}</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {personas.map((persona) => (
                      <motion.div
                        key={persona.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/app/debate?persona=${persona.id}`)}
                      >
                        <h3 className="font-semibold capitalize">{persona.name.replace("_", " ")}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{persona.description}</p>
                      </motion.div>
                    ))}
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
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <History className="text-primary" size={20} />
                    Recent Debates
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/app/history">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {recentDebates.length > 0 ? (
                    <div className="space-y-3">
                      {recentDebates.slice(0, 5).map((debate) => (
                        <Link
                          key={debate.id}
                          href={`/app/debate/${debate.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{debate.topic}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(debate.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize ml-2">
                            {debate.opponent_persona.replace("_", " ")}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">No debates yet</p>
                      <Button asChild>
                        <Link href="/app/debate">Start Your First Debate</Link>
                      </Button>
                    </div>
                  )}
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
                          <Badge variant={status === "active" ? "default" : "secondary"}>
                            {status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Checking status...</p>
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
                      value={quickAnalysisText}
                      onChange={(e) => setQuickAnalysisText(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleQuickAnalysis} disabled={!quickAnalysisText.trim()}>
                        <Zap className="mr-2 h-4 w-4" />
                        Analyze Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
