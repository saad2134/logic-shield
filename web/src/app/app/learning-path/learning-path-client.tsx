"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Compass,
  GraduationCap,
  Zap,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Eye,
  Check
} from "lucide-react";
import { api, LearningProgress } from "@/lib/api-app";

const ASSESSMENT_QUESTIONS = [
  {
    question: "All humans are mortal. Socrates is human. Therefore, Socrates is mortal. This is an example of:",
    options: ["Deductive reasoning", "Inductive reasoning", "Fallacious argument", "Straw man"],
    correctAnswerIdx: 0,
    fallacyType: "Logical Reasoning",
    explanation: "Deductive reasoning goes from general rules to specific conclusions. Since the premises are true, the conclusion is guaranteed to be true."
  },
  {
    question: "Identify the fallacy: 'If we legalise recreational marijuana, next they will legalise cocaine, then heroin, and soon everyone will be addicted!'",
    options: ["Straw Man", "Slippery Slope", "Ad Hominem", "False Dilemma"],
    correctAnswerIdx: 1,
    fallacyType: "Slippery Slope",
    explanation: "This predicts a catastrophic chain of events starting from legalization without proving any causal link, representing a Slippery Slope."
  },
  {
    question: "Identify the fallacy: 'We either double the education budget today, or we declare that we don't care about our children's futures!'",
    options: ["False Dilemma", "Appeal to Authority", "Circular Reasoning", "Red Herring"],
    correctAnswerIdx: 0,
    fallacyType: "False Dilemma",
    explanation: "This restricts the choices to two extremes, ignoring options like partial budget increases or private funding, representing a False Dilemma."
  },
  {
    question: "A speaker says: 'You shouldn't listen to his tax suggestions; he owns a private yacht, so he is clearly just trying to help the rich!' What fallacy is this?",
    options: ["Ad Hominem", "Straw Man", "Hasty Generalization", "Circular Reasoning"],
    correctAnswerIdx: 0,
    fallacyType: "Ad Hominem",
    explanation: "This attacks the speaker's wealth rather than analyzing the details of their tax plan, representing an Ad Hominem attack."
  },
  {
    question: "A study shows that ice cream sales and sunburn rates are highly correlated. The researchers conclude that eating ice cream causes sunburn. What is the logical error?",
    options: ["Hasty Generalization", "Correlation vs Causation error", "Circular Reasoning", "Straw Man"],
    correctAnswerIdx: 1,
    fallacyType: "Correlation vs Causation",
    explanation: "This assumes correlation equals causation, ignoring the confounding factor (hot sun) driving both variables."
  }
];

const FALLACY_DETAILS: Record<string, { desc: string; tip: string; courseId: string; lessonId: string }> = {
  "Ad Hominem": {
    desc: "Attacking the speaker's character instead of the argument.",
    tip: "Redirect focus back to the argument's premises. Address only facts.",
    courseId: "logical-fallacies",
    lessonId: "ad-hominem"
  },
  "Straw Man": {
    desc: "Distorting or oversimplifying an opponent's argument.",
    tip: "Correct their misrepresentation immediately. Re-state your claim clearly.",
    courseId: "logical-fallacies",
    lessonId: "straw-man"
  },
  "False Dilemma": {
    desc: "Limiting options to two extremes when more exist.",
    tip: "Introduce a third, middle-ground option to shatter the binary frame.",
    courseId: "logical-fallacies",
    lessonId: "false-dilemma"
  },
  "Slippery Slope": {
    desc: "Predicting a long chain of events without any proof.",
    tip: "Ask the opponent to prove the causal mechanism for each link in their chain.",
    courseId: "logical-fallacies",
    lessonId: "slippery-slope"
  },
  "Correlation vs Causation": {
    desc: "Assuming that because two trends move together, one causes the other.",
    tip: "Point out the confounding variable that is driving both correlation factors.",
    courseId: "evidence-support",
    lessonId: "correlation-causation"
  }
};

const FLASHCARDS: Record<string, { front: string; back: string }> = {
  "Ad Hominem": {
    front: "How do you define an Ad Hominem fallacy and what is the best way to counter it?",
    back: "Definition: Attacking the person's character or background instead of the argument itself. Counter: Expose the irrelevance of the attack and politely steer the focus back to the core premises."
  },
  "Straw Man": {
    front: "What is a Straw Man fallacy and how do you disarm it?",
    back: "Definition: Caricaturing or exaggerating an argument to make it easier to attack. Counter: Call out the distortion directly ('I never claimed X, my claim is Y') and ask them to address your actual statement."
  },
  "False Dilemma": {
    front: "Describe a False Dilemma and explain how to break it.",
    back: "Definition: Presenting only two options when more exist. Counter: Refuse to pick either extreme and introduce viable alternative options to expose the false binary."
  },
  "Slippery Slope": {
    front: "Define a Slippery Slope fallacy and how to rebut it.",
    back: "Definition: Claiming a first step will trigger a disastrous chain reaction without showing evidence. Counter: Request evidence for the causal link between the initial action and the predicted disaster."
  },
  "Correlation vs Causation": {
    front: "Explain the difference between correlation and causation.",
    back: "Definition: Correlation means two things happen together; causation means one causes the other. Counter: Expose the third (confounding) factor that is driving both trends."
  }
};

export default function LearningPathClient() {
  const [progress, setProgress] = React.useState<LearningProgress | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Assessment Quiz State
  const [quizIdx, setQuizIdx] = React.useState(0);
  const [quizScore, setQuizScore] = React.useState(0);
  const [quizAnswers, setQuizAnswers] = React.useState<number[]>([]);
  const [quizOption, setQuizOption] = React.useState<number | null>(null);
  const [showQuizFeedback, setShowQuizFeedback] = React.useState(false);
  const [isAssessmentSubmitting, setIsAssessmentSubmitting] = React.useState(false);

  // Flashcard review state
  const [activeCard, setActiveCard] = React.useState<string | null>(null);
  const [revealFlashcard, setRevealFlashcard] = React.useState(false);
  const [isReviewing, setIsReviewing] = React.useState(false);

  async function loadData() {
    try {
      const data = await api.getLearningProgress();
      setProgress(data);
    } catch (err) {
      console.error("Failed to load progress:", err);
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  const handleRetakeQuiz = async () => {
    try {
      await api.resetAssessment();
      window.dispatchEvent(new Event("learning-progress-updated"));
      await loadData();
      setQuizIdx(0);
      setQuizScore(0);
      setQuizAnswers([]);
      setQuizOption(null);
      setShowQuizFeedback(false);
    } catch (err) {
      console.error("Failed to reset assessment:", err);
    }
  };

  const handleAssessmentSubmit = async () => {
    if (quizOption === null) return;
    
    const currentQ = ASSESSMENT_QUESTIONS[quizIdx];
    const correct = quizOption === currentQ.correctAnswerIdx;
    
    const newScore = correct ? quizScore + 1 : quizScore;
    const newAnswers = [...quizAnswers, quizOption];
    
    setQuizScore(newScore);
    setQuizAnswers(newAnswers);
    setShowQuizFeedback(true);
    
    setTimeout(async () => {
      setShowQuizFeedback(false);
      setQuizOption(null);
      
      if (quizIdx < ASSESSMENT_QUESTIONS.length - 1) {
        setQuizIdx(prev => prev + 1);
      } else {
        // Submit quiz results to backend
        setIsAssessmentSubmitting(true);
        try {
          // Identify weak fallacy types
          const weakFallacies: string[] = [];
          newAnswers.forEach((ans, idx) => {
            const q = ASSESSMENT_QUESTIONS[idx];
            if (ans !== q.correctAnswerIdx && q.fallacyType !== "Logical Reasoning") {
              weakFallacies.push(q.fallacyType);
            }
          });
          
          let level = "Beginner";
          if (newScore === 3 || newScore === 4) level = "Intermediate";
          else if (newScore === 5) level = "Advanced";

          const result = await api.saveAssessment(newScore, level, weakFallacies);
          setProgress(prev => prev ? {
            ...prev,
            assessment: result.assessment,
            spaced_repetition: [
              ...prev.spaced_repetition,
              ...weakFallacies.map(f => ({
                fallacy: f,
                next_review: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                interval_days: 1,
                created_at: new Date().toISOString()
              }))
            ]
          } : null);
          window.dispatchEvent(new Event("learning-progress-updated"));
        } catch (err) {
          console.error("Failed to save assessment:", err);
        } finally {
          setIsAssessmentSubmitting(false);
        }
      }
    }, 2500);
  };

  const handleReviewCard = async (fallacy: string) => {
    setIsReviewing(true);
    try {
      const result = await api.updateSpacedRepetition(fallacy, "review");
      setProgress(prev => prev ? {
        ...prev,
        spaced_repetition: result.spaced_repetition
      } : null);
      setRevealFlashcard(false);
      setActiveCard(null);
    } catch (err) {
      console.error("Failed to submit card review:", err);
    } finally {
      setIsReviewing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Show onboarding quiz if assessment is not completed
  if (!progress?.assessment) {
    const currentQ = ASSESSMENT_QUESTIONS[quizIdx];
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-primary/20">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Compass className="text-primary h-5 w-5" />
                Rhetoric Assessment Quiz
              </CardTitle>
              <CardDescription className="text-xs">
                Complete this 5-question logic assessment to build your personalized learning path:
              </CardDescription>
              <Progress value={(quizIdx / ASSESSMENT_QUESTIONS.length) * 100} className="h-1.5 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {isAssessmentSubmitting ? (
                <div className="text-center py-12 space-y-4">
                  <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">Calculating your custom debater level...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Question {quizIdx + 1} of {ASSESSMENT_QUESTIONS.length}</span>
                    <span>Target: {currentQ.fallacyType}</span>
                  </div>
                  
                  <p className="text-sm font-semibold text-foreground leading-relaxed">
                    {currentQ.question}
                  </p>

                  <div className="space-y-2">
                    {currentQ.options.map((option, idx) => {
                      const isSelected = quizOption === idx;
                      
                      let borderStyle = "border-foreground/10 bg-background/50 hover:bg-background";
                      if (showQuizFeedback) {
                        const isCorrect = idx === currentQ.correctAnswerIdx;
                        if (isCorrect) borderStyle = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
                        else if (isSelected) borderStyle = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                        else borderStyle = "border-foreground/10 opacity-60";
                      } else if (isSelected) {
                        borderStyle = "border-primary bg-primary/10 text-primary";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={showQuizFeedback}
                          onClick={() => setQuizOption(idx)}
                          className={`w-full text-left p-3.5 rounded-md border text-xs transition-all flex gap-3 ${borderStyle}`}
                        >
                          <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {showQuizFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg border text-xs leading-relaxed ${
                        quizOption === currentQ.correctAnswerIdx
                          ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400"
                          : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
                      }`}
                    >
                      <div className="flex gap-2 items-start font-medium mb-1">
                        {quizOption === currentQ.correctAnswerIdx ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            <span>Correct!</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                            <span>Incorrect</span>
                          </>
                        )}
                      </div>
                      {currentQ.explanation}
                    </motion.div>
                  )}
                </div>
              )}
            </CardContent>
            {!isAssessmentSubmitting && (
              <CardFooter className="flex justify-end p-4 border-t bg-muted/20">
                <Button
                  size="sm"
                  disabled={quizOption === null || showQuizFeedback}
                  onClick={handleAssessmentSubmit}
                >
                  Submit Answer
                </Button>
              </CardFooter>
            )}
          </Card>
        </motion.div>
      </div>
    );
  }

  // Extract weak fallacy types
  const weakFallacies = new Set([
    ...(progress.assessment.weak_fallacies || []),
    ...(progress.db_detected_fallacies || [])
  ]);

  // Spaced Repetition Due Checks
  const todayStr = new Date().toISOString().split('T')[0];
  const dueReviews = progress.spaced_repetition.filter(item => {
    return item.next_review <= todayStr;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-muted/50">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Personalized Learning Path</h1>
          <p className="text-xs text-muted-foreground">Monitor logic weaknesses, flashcards, and AI-recommended actions.</p>
        </div>
        <Button variant="outline" size="xs" onClick={handleRetakeQuiz} className="text-[11px] h-8 shrink-0 self-start sm:self-auto">
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retake Assessment
        </Button>
      </div>
      
      {/* Upper Layout: Weakness Analysis & SRS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weakness Analyzer Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="text-primary h-4.5 w-4.5" />
                Logical Weakness Analyzer
              </CardTitle>
              <CardDescription className="text-xs">
                We've analyzed your onboarding assessment and debate logs to identify your focus areas:
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {weakFallacies.size === 0 ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
                  <p className="text-sm font-semibold">No Weaknesses Detected!</p>
                  <p className="text-xs text-muted-foreground">Keep debating to analyze your logic structure further.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from(weakFallacies).map(fallacy => {
                    const details = FALLACY_DETAILS[fallacy];
                    if (!details) return null;

                    return (
                      <div key={fallacy} className="p-3 border rounded-lg space-y-2 bg-muted/20">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-xs text-primary">{fallacy}</span>
                          <Badge variant="destructive" className="text-[9px] px-1.5 py-0">Review Needed</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{details.desc}</p>
                        <div className="text-[11px] font-medium text-foreground bg-primary/5 p-2 rounded border border-primary/10">
                          <span className="text-primary font-bold">Counter-Tip:</span> {details.tip}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Recommended Tasks Card */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Zap className="text-primary h-4.5 w-4.5" />
                AI Learning Recommendations
              </CardTitle>
              <CardDescription className="text-xs">
                Targeted lessons and debate practice scheduled to resolve your weaknesses:
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {Array.from(weakFallacies).length > 0 ? (
                Array.from(weakFallacies).map(fallacy => {
                  const details = FALLACY_DETAILS[fallacy];
                  if (!details) return null;

                  return (
                    <div key={fallacy} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 border rounded-lg hover:border-primary/20 transition-all">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                          <BookOpen className="h-3.5 w-3.5 text-primary" />
                          Study: {fallacy} Lesson
                        </span>
                        <p className="text-[10px] text-muted-foreground">
                          Recommended because you struggled with {fallacy} logic.
                        </p>
                      </div>
                      <Button size="sm" variant="outline" asChild className="text-xs self-stretch sm:self-auto">
                        <Link href={`/app/academy/${details.courseId}`}>
                          Start Lesson <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 border rounded-lg hover:border-primary/20 transition-all">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      Study: Introduction to Arguments
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      Start building your argumentation foundation.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" asChild className="text-xs self-stretch sm:self-auto">
                    <Link href="/app/academy/intro-arguments">
                      Start Lesson <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              )}

              {/* Debate practice recommendation */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 border rounded-lg hover:border-primary/20 transition-all">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    Practice: Debate against Aggressive Persona
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    Practice holding logical frames under emotional arguments.
                  </p>
                </div>
                <Button size="sm" asChild className="text-xs self-stretch sm:self-auto">
                  <Link href="/app/debate">
                    Start Debate <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spaced Repetition (SRS) Cards */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <RefreshCw className="text-primary h-4.5 w-4.5" />
                Spaced Repetition Cards
              </CardTitle>
              <CardDescription className="text-xs">
                Active recall cards to commit critical logic models to long-term memory:
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col justify-between space-y-4">
              
              <div className="space-y-3">
                {dueReviews.length > 0 ? (
                  dueReviews.map(item => {
                    const card = FLASHCARDS[item.fallacy];
                    if (!card) return null;

                    const isCurrent = activeCard === item.fallacy;

                    return (
                      <div key={item.fallacy} className="space-y-2 border p-3 rounded-lg bg-background shadow-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-semibold text-primary">{item.fallacy}</span>
                          <span className="text-[9px] text-muted-foreground">Interval: {item.interval_days}d</span>
                        </div>
                        
                        {!isCurrent ? (
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-xs text-muted-foreground">Due for review</span>
                            <Button size="xs" onClick={() => {
                              setActiveCard(item.fallacy);
                              setRevealFlashcard(false);
                            }}>
                              Review
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3 pt-2">
                            <p className="text-xs font-medium text-foreground">{card.front}</p>
                            
                            {revealFlashcard ? (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="text-xs text-muted-foreground border-t pt-2 leading-relaxed"
                              >
                                {card.back}
                                <div className="flex gap-2 justify-end pt-3">
                                  <Button 
                                    size="xs" 
                                    disabled={isReviewing}
                                    onClick={() => handleReviewCard(item.fallacy)}
                                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                                  >
                                    <Check className="h-3 w-3" /> Got it!
                                  </Button>
                                </div>
                              </motion.div>
                            ) : (
                              <Button size="xs" onClick={() => setRevealFlashcard(true)} className="w-full">
                                Reveal Answer
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 space-y-2 text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto opacity-80" />
                    <p className="text-sm font-semibold">SRS Inbox Clear!</p>
                    <p className="text-[10px]">No logic cards due for review today. Great job!</p>
                  </div>
                )}
              </div>

              {/* Show upcoming cards scheduled */}
              {progress.spaced_repetition.length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Upcoming Reviews</p>
                  <div className="flex flex-wrap gap-1.5">
                    {progress.spaced_repetition.map(item => {
                      const isDue = item.next_review <= todayStr;
                      if (isDue) return null;
                      return (
                        <Badge key={item.fallacy} variant="outline" className="text-[9px] px-1.5 py-0.5">
                          {item.fallacy} ({item.next_review})
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
