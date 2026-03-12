"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  MessageSquare,
  Shield,
  Zap,
  ArrowRight,
  Loader2,
  AlertCircle,
  Brain,
  Target,
  Scale
} from "lucide-react";
import { api, PersonaInfo } from "@/lib/api";

export default function NewDebate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [personas, setPersonas] = React.useState<PersonaInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isStarting, setIsStarting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [topic, setTopic] = React.useState("");
  const [userStance, setUserStance] = React.useState<"support" | "oppose" | "neutral">("support");
  const [opponentPersona, setOpponentPersona] = React.useState(searchParams.get("persona") || "logical");

  React.useEffect(() => {
    async function loadPersonas() {
      try {
        const data = await api.getPersonas();
        setPersonas(data);
        if (searchParams.get("persona")) {
          setOpponentPersona(searchParams.get("persona") || "logical");
        }
      } catch (err) {
        console.error("Failed to load personas:", err);
        setError("Could not connect to backend. Make sure the server is running.");
      } finally {
        setIsLoading(false);
      }
    }
    loadPersonas();
  }, [searchParams]);

  const handleStartDebate = async () => {
    if (!topic.trim()) {
      setError("Please enter a debate topic");
      return;
    }

    setIsStarting(true);
    setError(null);

    try {
      const session = await api.startDebate(topic, userStance, opponentPersona);
      router.push(`/demo/debate/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start debate");
    } finally {
      setIsStarting(false);
    }
  };

  const getBgColor = (color: string | undefined) => color ? color.replace("text-", "bg-") : "bg-gray-500";

  const personaDescriptions: Record<string, { icon: React.ElementType; color: string; traits: string[] }> = {
    logical: {
      icon: Scale,
      color: "text-blue-500",
      traits: ["Facts-driven", "Calm", "Structured"],
    },
    aggressive: {
      icon: Zap,
      color: "text-red-500",
      traits: ["Challenging", "Direct", "Pressuring"],
    },
    skeptical: {
      icon: AlertCircle,
      color: "text-orange-500",
      traits: ["Questioning", "Doubting", "Critical"],
    },
    devil_advocate: {
      icon: Brain,
      color: "text-purple-500",
      traits: ["Contrarian", "Explosive", "Testing"],
    },
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Start a Debate</h1>
          <p className="text-muted-foreground mt-1">
            Challenge yourself against an AI opponent and improve your argumentation skills
          </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="text-primary" size={20} />
                  Debate Setup
                </CardTitle>
                <CardDescription>
                  Define your debate topic and position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="topic">Debate Topic</Label>
                  <Textarea
                    id="topic"
                    placeholder="e.g., Artificial intelligence will do more harm than good to society"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a clear, debatable statement to argue for or against
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Your Stance</Label>
                  <RadioGroup
                    value={userStance}
                    onValueChange={(value) => setUserStance(value as "support" | "oppose" | "neutral")}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="support" id="support" />
                      <Label htmlFor="support" className="cursor-pointer">Support</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="oppose" id="oppose" />
                      <Label htmlFor="oppose" className="cursor-pointer">Oppose</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="neutral" id="neutral" />
                      <Label htmlFor="neutral" className="cursor-pointer">Neutral</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleStartDebate}
                  disabled={isStarting || isLoading}
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting Debate...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Start Debate
                      <ArrowRight className="ml-2 h-4 w-4" />
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="text-primary" size={20} />
                  Choose Opponent
                </CardTitle>
                <CardDescription>
                  Select your AI debate partner persona
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {personas.map((persona) => {
                      const info: { icon: React.ElementType; color: string; traits: string[] } = personaDescriptions[persona.id] || {
                        icon: MessageSquare,
                        color: "text-gray-500",
                        traits: [],
                      };
                      const Icon = info.icon;
                      const isSelected = opponentPersona === persona.id;

                      return (
                        <motion.div
                          key={persona.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setOpponentPersona(persona.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold capitalize">{persona.name.replace("_", " ")}</h3>
                                {isSelected && (
                                  <Badge variant="default">Selected</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{persona.description}</p>
                              <div className="flex gap-2 mt-2">
                                {info.traits.map((trait) => (
                                  <Badge key={trait} variant="outline" className="text-xs">
                                    {trait}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold mb-1">Set Your Position</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a topic and decide whether you support or oppose it
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold mb-1">Debate with AI</h3>
                  <p className="text-sm text-muted-foreground">
                    Present arguments and respond to your AI opponent's counterarguments
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold mb-1">Get Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive feedback on fallacies, strength, and reputational risks
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
