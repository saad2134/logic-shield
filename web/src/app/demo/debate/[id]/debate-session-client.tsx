"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

import {
  MessageSquare,
  Shield,
  Zap,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Send,
  ArrowLeft,
  X,
  TrendingUp,
  Scale,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { api, AnalysisResult, DebateSession } from "@/lib/api";

interface Message {
  id: number;
  content: string;
  isFromUser: boolean;
  analysis?: AnalysisResult;
}

export default function DebateSessionClient() {
  const router = useRouter();
  const params = useParams();
  const sessionId = parseInt(params.id as string);

  const [session, setSession] = React.useState<DebateSession | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = React.useState<number | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    async function loadSession() {
      try {
        const data = await api.getDebateHistory(sessionId);
        setSession(data.session);
        
        const loadedMessages: Message[] = data.arguments.map((arg, idx) => ({
          id: arg.id,
          content: arg.content,
          isFromUser: arg.is_from_user,
          analysis: data.analysis[idx] || undefined,
        }));
        setMessages(loadedMessages);
      } catch (err) {
        setError("Failed to load debate session");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, [sessionId]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now(),
      content: input,
      isFromUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      await api.addArgument(sessionId, input);

      const counter = await api.getCounterArgument(
        sessionId,
        input,
        session?.topic || "",
        session?.user_stance || "support",
        session?.opponent_persona || "logical"
      );

      const opponentMessage: Message = {
        id: Date.now() + 1,
        content: counter.counter_argument,
        isFromUser: false,
      };

      setMessages((prev) => [...prev, opponentMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsSending(false);
    }
  };

  const handleEndDebate = async () => {
    try {
      await api.endDebate(sessionId);
      router.push("/demo/history");
    } catch (err) {
      setError("Failed to end debate");
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
        return "bg-green-500/10";
      case "medium":
        return "bg-yellow-500/10";
      case "high":
        return "bg-orange-500/10";
      case "critical":
        return "bg-red-500/10";
      default:
        return "bg-gray-500/10";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push("/demo/debate")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Start New Debate
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.push("/demo")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-bold">Debate Session</h1>
                <p className="text-sm text-muted-foreground line-clamp-1">{session?.topic}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {session?.user_stance}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {session?.opponent_persona?.replace("_", " ")}
              </Badge>
              <Button variant="destructive" size="sm" onClick={handleEndDebate}>
                <X className="mr-1 h-4 w-4" />
                End
              </Button>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
          >
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="pb-3 border-b shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Debate Arena</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>{messages.length} messages</span>
              </div>
            </div>
          </CardHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`flex ${message.isFromUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-4 ${
                          message.isFromUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!message.isFromUser && (
                            <Brain className="h-4 w-4 mt-1 shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            {message.analysis && (
                              <motion.div
                                initial={false}
                                animate={{ height: showAnalysis === message.id ? "auto" : 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-3 pt-3 border-t border-current/20">
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                      <span>Argument Strength</span>
                                      <span className="font-medium">
                                        {Math.round(message.analysis.argument_strength * 100)}%
                                      </span>
                                    </div>
                                    <Progress value={message.analysis.argument_strength * 100} className="h-1" />
                                    
                                    {message.analysis.fallacy_detected.length > 0 && (
                                      <div className="flex items-center gap-2 mt-2">
                                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                                        <span className="text-orange-500">
                                          Fallacy: {message.analysis.fallacy_detected.join(", ")}
                                        </span>
                                      </div>
                                    )}

                                    <div className={`p-2 rounded ${getRiskBg(message.analysis.reputation_risk_level)}`}>
                                      <div className="flex items-center justify-between">
                                        <span>Risk Level</span>
                                        <span className={`font-medium capitalize ${getRiskColor(message.analysis.reputation_risk_level)}`}>
                                          {message.analysis.reputation_risk_level}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                          {message.isFromUser && (
                            <Shield className="h-4 w-4 mt-1 shrink-0" />
                          )}
                        </div>
                        {message.analysis && (
                          <button
                            onClick={() => setShowAnalysis(showAnalysis === message.id ? null : message.id)}
                            className={`mt-2 text-xs flex items-center gap-1 ${
                              message.isFromUser
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {showAnalysis === message.id ? (
                              <>
                                <ChevronUp className="h-3 w-3" />
                                Hide Analysis
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3" />
                                Show Analysis
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {messages.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Ready to Debate</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Present your first argument on &quot;{session?.topic}&quot;
                  </p>
                </div>
              )}

              {isSending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted rounded-lg p-4 max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-4 border-t shrink-0">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your argument..."
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button size="icon" onClick={handleSend} disabled={!input.trim() || isSending}>
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
