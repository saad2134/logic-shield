"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  History,
  MessageSquare,
  Calendar,
  ChevronRight,
  Loader2,
  AlertCircle,
  Brain,
  Shield,
  Zap,
  Scale
} from "lucide-react";
import { api, DebateSession } from "@/lib/api-app";

export default function HistoryClient() {
  const router = useRouter();
  const [sessions, setSessions] = React.useState<DebateSession[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    async function loadHistory() {
      try {
        const data = await api.getUserDebates(20, 0);
        setSessions(data.debates);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load history");
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStanceColor = (stance: string) => {
    switch (stance.toLowerCase()) {
      case "support":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "oppose":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Debate History</h1>
              <p className="text-muted-foreground mt-1">
                {total > 0 ? `View and review your ${total} past debate sessions` : "View and review your past debate sessions"}
              </p>
            </div>
            <Button asChild>
              <Link href="/app/debate">
                <Zap className="mr-2 h-4 w-4" />
                New Debate
              </Link>
            </Button>
          </div>
        </motion.div>

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

        {sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge variant="outline" className={getStanceColor(session.user_stance)}>
                            {session.user_stance}
                          </Badge>
                          <Badge variant="secondary" className="capitalize">
                            {session.opponent_persona?.replace("_", " ") || "logical"}
                          </Badge>
                          {session.ended_at && (
                            <Badge variant="outline">Completed</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                          {session.topic}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(session.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/app/debate/${session.id}`}>
                          <ChevronRight className="h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Debates Yet</h3>
              <p className="text-muted-foreground mb-4 max-w-xs mx-auto">
                Start your first debate to see your history here
              </p>
              <Button asChild>
                <Link href="/app/debate">
                  <Zap className="mr-2 h-4 w-4" />
                  Start Your First Debate
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="text-primary" size={20} />
                Tips for Better Debates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border">
                  <Scale className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-medium mb-1">Stay Logical</h4>
                  <p className="text-sm text-muted-foreground">
                    Use evidence and reasoning to support your points
                  </p>
                </div>
                <div className="p-4 rounded-lg border">
                  <Shield className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-medium mb-1">Avoid Fallacies</h4>
                  <p className="text-sm text-muted-foreground">
                    Watch out for common logical fallacies in your arguments
                  </p>
                </div>
                <div className="p-4 rounded-lg border">
                  <MessageSquare className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-medium mb-1">Be Clear</h4>
                  <p className="text-sm text-muted-foreground">
                    State your arguments clearly and concisely
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
