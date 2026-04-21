"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface DebateHistory {
  id: number;
  topic: string;
  user_stance: string;
  opponent_persona: string;
  created_at: string;
  ended_at?: string;
}

export default function HistoryClient() {
  const router = useRouter();
  const [sessions, setSessions] = React.useState<DebateHistory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/debate/history`);
        if (response.ok) {
          const data = await response.json();
          setSessions(Array.isArray(data) ? data : []);
        } else {
          setSessions([]);
        }
      } catch (err) {
        setSessions([]);
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-end gap-4 flex-wrap">
            <Button asChild>
              <Link href="/demo/debate">
                <Zap className="mr-2 h-4 w-4" />
                New Debate
              </Link>
            </Button>
          </div>
        </motion.div>

        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
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
                        <Link href={`/demo/debate/${session.id}`}>
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
                <Link href="/demo/debate">
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
