"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  Printer,
  X,
  Lock,
  Flame,
  Scale,
  Sparkles
} from "lucide-react";
import { api, LearningProgress } from "@/lib/api-app";
import { courses } from "@/config/courses";
import { useAuth } from "@/context/auth-context";

const parseMarkdown = (text: string) => {
  if (!text) return [];
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, idx) => {
    if (idx % 2 !== 0) {
      return (
        <strong key={idx} className="font-bold text-foreground">
          {part}
        </strong>
      );
    }
    
    const italicParts = part.split(/\*([^*]+)\*/g);
    return italicParts.map((subPart, subIdx) => {
      if (subIdx % 2 !== 0) {
        return (
          <em key={`${idx}-${subIdx}`} className="italic text-foreground">
            {subPart}
          </em>
        );
      }
      return subPart;
    });
  });
};

const renderMarkdown = (text: string) => {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    if (!line.trim()) {
      return <div key={idx} className="h-2" />;
    }
    
    const listMatch = line.match(/^(\d+\.\s+)(.*)/);
    const bulletMatch = line.match(/^(-\s+)(.*)/);
    
    if (listMatch) {
      const [, prefix, content] = listMatch;
      return (
        <div key={idx} className="flex gap-2 pl-4 py-0.5 text-xs sm:text-sm text-muted-foreground">
          <span className="font-bold text-primary shrink-0">{prefix}</span>
          <span className="leading-relaxed">{parseMarkdown(content)}</span>
        </div>
      );
    }
    
    if (bulletMatch) {
      const [, prefix, content] = bulletMatch;
      return (
        <div key={idx} className="flex gap-2 pl-4 py-0.5 text-xs sm:text-sm text-muted-foreground">
          <span className="font-bold text-primary shrink-0">•</span>
          <span className="leading-relaxed">{parseMarkdown(content)}</span>
        </div>
      );
    }
    
    return (
      <p key={idx} className="mb-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
        {parseMarkdown(line)}
      </p>
    );
  });
};

interface CoursePlayerClientProps {
  courseId: string;
}

export default function CoursePlayerClient({ courseId }: CoursePlayerClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const course = courses.find(c => c.id === courseId);
  
  const [progress, setProgress] = React.useState<LearningProgress | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeLessonIdx, setActiveLessonIdx] = React.useState(0);
  const [viewMode, setViewMode] = React.useState<"lesson" | "final-quiz" | "certificate">("lesson");
  
  // Slide progression state
  const [activeSlideIdx, setActiveSlideIdx] = React.useState(0);
  const [completedSlides, setCompletedSlides] = React.useState<boolean[]>([]);
  
  // Slide interactive states
  const [selectedOptionIdx, setSelectedOptionIdx] = React.useState<number | null>(null);
  const [selectedIndices, setSelectedIndices] = React.useState<number[]>([]);
  const [clickedBubbleIdx, setClickedBubbleIdx] = React.useState<number | null>(null);
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [isCorrect, setIsCorrect] = React.useState(false);
  
  // Course Final Quiz State
  const [quizProgress, setQuizProgress] = React.useState({
    activeQuestionIdx: 0,
    score: 0,
    answers: [] as number[],
    completed: false
  });
  const [finalQuizOption, setFinalQuizOption] = React.useState<number | null>(null);
  const [showFinalFeedback, setShowFinalFeedback] = React.useState(false);

  React.useEffect(() => {
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
    loadData();
  }, [courseId]);

  React.useEffect(() => {
    if (progress && !progress.assessment) {
      router.push("/app/learning-path");
    }
  }, [progress, router]);

  const activeLesson = course?.lessons[activeLessonIdx];

  // Initialize slides state when lesson changes
  React.useEffect(() => {
    if (activeLesson) {
      setActiveSlideIdx(0);
      const initialCompleted = activeLesson.slides.map(s => s.type === "concept");
      setCompletedSlides(initialCompleted);
      resetSlideStates();
    }
  }, [activeLessonIdx, activeLesson]);

  if (!course) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Course Not Found</h2>
        <Button asChild>
          <Link href="/app/academy">Back to Academy</Link>
        </Button>
      </div>
    );
  }

  const resetSlideStates = () => {
    setSelectedOptionIdx(null);
    setSelectedIndices([]);
    setClickedBubbleIdx(null);
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const handleSelectLesson = (idx: number) => {
    setViewMode("lesson");
    setActiveLessonIdx(idx);
  };

  const handlePrevSlide = () => {
    if (activeSlideIdx > 0) {
      setActiveSlideIdx(prev => prev - 1);
      resetSlideStates();
    }
  };

  const handleNextSlide = async () => {
    if (!activeLesson) return;
    
    // Mark current slide as completed locally
    const newCompleted = [...completedSlides];
    newCompleted[activeSlideIdx] = true;
    setCompletedSlides(newCompleted);

    if (activeSlideIdx < activeLesson.slides.length - 1) {
      setActiveSlideIdx(prev => prev + 1);
      resetSlideStates();
    } else {
      // Complete lesson in DB
      try {
        const updated = await api.completeLesson(course.id, activeLesson.id);
        setProgress(prev => prev ? {
          ...prev,
          completed_lessons: updated.completed_lessons
        } : null);
      } catch (err) {
        console.error("Failed to update completed lesson:", err);
      }
      
      resetSlideStates();
      if (activeLessonIdx < course.lessons.length - 1) {
        setActiveLessonIdx(prev => prev + 1);
      } else {
        setViewMode("final-quiz");
      }
    }
  };

  const handleVerifyAnswer = () => {
    const slide = activeLesson?.slides[activeSlideIdx];
    if (!slide) return;

    if (slide.type === "quiz" && slide.quiz) {
      if (selectedOptionIdx === null) return;
      const correct = selectedOptionIdx === slide.quiz.correctAnswerIdx;
      setIsCorrect(correct);
      setShowFeedback(true);
      if (correct) {
        const newCompleted = [...completedSlides];
        newCompleted[activeSlideIdx] = true;
        setCompletedSlides(newCompleted);
      }
    } else if (slide.type === "puzzle" && slide.puzzleData) {
      const data = slide.puzzleData;
      if (slide.visualType === "argument-flow") {
        if (selectedIndices.length !== (data.items?.length || 0)) return;
        const correct = selectedIndices.every((val, index) => val === data.correctSequence?.[index]);
        setIsCorrect(correct);
        setShowFeedback(true);
        if (correct) {
          const newCompleted = [...completedSlides];
          newCompleted[activeSlideIdx] = true;
          setCompletedSlides(newCompleted);
        }
      }
    }
  };

  const handleFinalQuizSubmit = () => {
    if (finalQuizOption === null) return;
    
    const currentQ = course.finalQuiz[quizProgress.activeQuestionIdx];
    const correct = finalQuizOption === currentQ.correctAnswerIdx;
    
    const newScore = correct ? quizProgress.score + 1 : quizProgress.score;
    const newAnswers = [...quizProgress.answers, finalQuizOption];
    
    setShowFinalFeedback(true);
    
    setTimeout(() => {
      setShowFinalFeedback(false);
      setFinalQuizOption(null);
      
      if (quizProgress.activeQuestionIdx < course.finalQuiz.length - 1) {
        setQuizProgress(prev => ({
          ...prev,
          activeQuestionIdx: prev.activeQuestionIdx + 1,
          score: newScore,
          answers: newAnswers
        }));
      } else {
        setQuizProgress(prev => ({
          ...prev,
          score: newScore,
          answers: newAnswers,
          completed: true
        }));
      }
    }, 2500);
  };

  const handleResetQuiz = () => {
    setQuizProgress({
      activeQuestionIdx: 0,
      score: 0,
      answers: [],
      completed: false
    });
    setFinalQuizOption(null);
    setShowFinalFeedback(false);
    setViewMode("final-quiz");
  };

  const isLessonCompleted = (lessonId: string) => {
    if (!progress) return false;
    return progress.completed_lessons.includes(`${course.id}:${lessonId}`);
  };

  const allLessonsCompleted = course.lessons.every(l => isLessonCompleted(l.id));
  const finalQuizPassed = quizProgress.completed && (quizProgress.score / course.finalQuiz.length) >= 0.8;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-80 lg:col-span-1" />
          <Skeleton className="h-[450px] lg:col-span-3" />
        </div>
      </div>
    );
  }

  const activeSlide = activeLesson?.slides[activeSlideIdx];
  const canContinue = activeSlide?.type === "concept" || completedSlides[activeSlideIdx];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 print:p-0 print:max-w-none">
      
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/academy" className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Back to Academy
          </Link>
        </Button>
        <span className="text-xs text-muted-foreground font-medium">
          {course.title} &bull; {course.difficulty}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:block">
        
        {/* Sidebar: Lessons Outline */}
        <div className="lg:col-span-1 space-y-4 print:hidden">
          <Card className="border border-muted/80 backdrop-blur-md bg-card/60">
            <CardHeader className="p-4 border-b border-muted/50">
              <CardTitle className="text-xs font-bold tracking-wider uppercase text-muted-foreground">Course Outline</CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-2 space-y-1">
              {course.lessons.map((lesson, idx) => {
                const isActive = viewMode === "lesson" && activeLessonIdx === idx;
                const done = isLessonCompleted(lesson.id);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectLesson(idx)}
                    className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 text-xs transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                        : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="shrink-0">
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-500/10" />
                      ) : (
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                          isActive ? "border-primary text-primary" : "border-muted-foreground/30 text-muted-foreground/50"
                        }`}>
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <span className="truncate flex-1">{lesson.title}</span>
                  </button>
                );
              })}

              {/* Final Course Quiz */}
              <button
                disabled={!allLessonsCompleted}
                onClick={() => setViewMode("final-quiz")}
                className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 text-xs transition-all ${
                  viewMode === "final-quiz"
                    ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                    : allLessonsCompleted
                    ? "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    : "opacity-40 cursor-not-allowed text-muted-foreground/50"
                }`}
              >
                <div className="shrink-0">
                  {quizProgress.completed ? (
                    <Award className={`h-4 w-4 ${finalQuizPassed ? "text-amber-500" : "text-red-500"}`} />
                  ) : !allLessonsCompleted ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <HelpCircle className="h-4 w-4" />
                  )}
                </div>
                <span className="truncate flex-1">Final Course Quiz</span>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Content Box */}
        <div className="lg:col-span-3 print:w-full">
          <AnimatePresence mode="wait">
            {viewMode === "lesson" && activeLesson && activeSlide && (
              <motion.div
                key={`${activeLesson.id}-${activeSlideIdx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <Card className="border border-muted/80 shadow-lg relative overflow-hidden bg-gradient-to-b from-card to-card/95">
                  <CardHeader className="pb-3 border-b border-muted/50">
                    {/* Slide Progress Step Bubbles */}
                    <div className="flex items-center justify-between gap-1.5 mb-4">
                      {activeLesson.slides.map((s, sIdx) => {
                        const isCurrent = sIdx === activeSlideIdx;
                        const isDone = completedSlides[sIdx];
                        return (
                          <React.Fragment key={sIdx}>
                            <button
                              disabled={sIdx > activeSlideIdx && !completedSlides[sIdx]}
                              onClick={() => {
                                setActiveSlideIdx(sIdx);
                                resetSlideStates();
                              }}
                              className={`flex items-center justify-center h-5 w-5 rounded-full border text-[9px] font-bold transition-all shrink-0 ${
                                isCurrent
                                  ? "border-primary bg-primary text-primary-foreground scale-110 shadow-md shadow-primary/20"
                                  : isDone
                                  ? "border-green-500 bg-green-500 text-white"
                                  : "border-muted text-muted-foreground hover:bg-muted/50"
                              }`}
                            >
                              {isDone ? "✓" : sIdx + 1}
                            </button>
                            {sIdx < activeLesson.slides.length - 1 && (
                              <div className={`flex-1 h-0.5 rounded transition-all ${
                                completedSlides[sIdx] ? "bg-green-500" : "bg-muted"
                              }`} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-primary font-bold tracking-wider uppercase bg-primary/15 px-2 py-0.5 rounded-full border border-primary/20">
                        {activeSlide.type === "concept" ? "💡 Concept" : activeSlide.type === "puzzle" ? "🧩 Puzzle" : "❓ Quiz"}
                      </span>
                      {isLessonCompleted(activeLesson.id) && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 border border-green-500/20">
                          Lesson Completed
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight mt-2 text-foreground">
                      {activeSlide.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    {/* Visual vs Non-Visual Layout */}
                    {activeSlide.visualType === "none" && activeSlide.type === "concept" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-sm">
                        {renderMarkdown(activeSlide.content)}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                        {/* Left Side: Markdown Text */}
                        <div className="md:col-span-5 prose prose-sm dark:prose-invert text-muted-foreground leading-relaxed text-sm">
                          {renderMarkdown(activeSlide.content)}
                        </div>

                        {/* Right Side: Interactive Animated Canvas */}
                        <div className="md:col-span-7 border border-muted/50 rounded-2xl p-5 bg-muted/10 shadow-inner min-h-[300px] flex flex-col justify-center">
                          
                          {/* 1. Argument Flow Syllogism Puzzle */}
                          {activeSlide.visualType === "argument-flow" && activeSlide.puzzleData && (
                            <div className="space-y-4">
                              <div className="bg-slate-900/5 dark:bg-slate-950/60 p-4 rounded-xl border border-muted space-y-3 relative">
                                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground border-b pb-1 border-muted/50">Deductive Syllogism</div>
                                {[0, 1, 2].map((slotIdx) => {
                                  const itemIdx = selectedIndices[slotIdx];
                                  const isFilled = itemIdx !== undefined;
                                  return (
                                    <div key={slotIdx} className="flex items-center gap-2">
                                      <div className="h-6 w-20 bg-muted/80 rounded flex items-center justify-center text-[9px] font-bold text-muted-foreground uppercase border shrink-0">
                                        {slotIdx === 0 ? "Premise 1" : slotIdx === 1 ? "Premise 2" : "Conclusion"}
                                      </div>
                                      <motion.div
                                        layout
                                        onClick={() => {
                                          if (showFeedback && isCorrect) return;
                                          if (isFilled) {
                                            setSelectedIndices(prev => prev.slice(0, slotIdx));
                                            setShowFeedback(false);
                                          }
                                        }}
                                        className={`flex-1 min-h-[44px] rounded-lg border flex items-center px-3 text-xs font-semibold transition-all ${
                                          isFilled
                                            ? "border-primary bg-primary/10 text-foreground cursor-pointer hover:bg-primary/20"
                                            : "border-dashed border-muted-foreground/30 bg-muted/20 text-muted-foreground/40 italic"
                                        }`}
                                      >
                                        {isFilled ? activeSlide.puzzleData?.items?.[itemIdx] : `Select statement...`}
                                      </motion.div>
                                    </div>
                                  );
                                })}

                                {showFeedback && isCorrect && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500"
                                  >
                                    <CheckCircle2 className="h-8 w-8 fill-green-500/10 animate-pulse" />
                                  </motion.div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Select statements in order:</div>
                                <div className="grid grid-cols-1 gap-1.5">
                                  {activeSlide.puzzleData.items?.map((item, idx) => {
                                    const isUsed = selectedIndices.includes(idx);
                                    return (
                                      <button
                                        key={idx}
                                        disabled={isUsed || (showFeedback && isCorrect)}
                                        onClick={() => {
                                          if (selectedIndices.length < 3) {
                                            setSelectedIndices(prev => [...prev, idx]);
                                          }
                                        }}
                                        className={`w-full text-left p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                                          isUsed
                                            ? "border-muted bg-muted/20 opacity-30 cursor-default"
                                            : "border-muted hover:border-primary hover:bg-primary/5 bg-background shadow-sm hover:scale-[1.01] active:scale-95 text-foreground"
                                        }`}
                                      >
                                        {item}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {selectedIndices.length === 3 && !showFeedback && (
                                <Button size="sm" onClick={handleVerifyAnswer} className="w-full text-xs h-8">
                                  Verify Sequence
                                </Button>
                              )}

                              {showFeedback && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`p-3 rounded-lg border text-xs leading-relaxed ${
                                    isCorrect
                                      ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400"
                                      : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
                                  }`}
                                >
                                  <div className="flex gap-2 items-start font-medium mb-1">
                                    {isCorrect ? (
                                      <>
                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                        <span>Correct Order!</span>
                                      </>
                                    ) : (
                                      <>
                                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                        <span>Logical structure error</span>
                                      </>
                                    )}
                                  </div>
                                  <p className="text-muted-foreground mt-1 text-[11px]">
                                    {isCorrect ? activeSlide.puzzleData.explanation : "Incorrect sequence. Syllogisms combine a general rule and a specific observation to form a logical deduction. Clear the slots to retry."}
                                  </p>
                                  {!isCorrect && (
                                    <Button size="sm" variant="outline" onClick={() => { setSelectedIndices([]); setShowFeedback(false); setIsCorrect(false); }} className="mt-2 text-xs h-7 py-1">
                                      Reset Choices
                                    </Button>
                                  )}
                                </motion.div>
                              )}
                            </div>
                          )}

                          {/* 2. Dialogue Fallacy Highlighter */}
                          {activeSlide.visualType === "dialogue-fallacy" && activeSlide.puzzleData && (
                            <div className="space-y-4">
                              <div className="bg-slate-900/5 dark:bg-slate-950/40 p-4 rounded-xl border border-muted space-y-3 max-h-[300px] overflow-y-auto">
                                <div className="flex items-center justify-between border-b pb-1.5 border-muted/50 mb-2">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                  </div>
                                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Dialogue Player</span>
                                </div>

                                <div className="space-y-3">
                                  {activeSlide.puzzleData.dialogue?.map((msg, idx) => {
                                    const isSelected = clickedBubbleIdx === idx;
                                    const isSpeakerRight = idx % 2 !== 0;
                                    
                                    let bubbleStyle = "bg-background border-muted text-foreground";
                                    if (showFeedback && isSelected) {
                                      if (msg.fallacy) {
                                        bubbleStyle = "bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/20 text-amber-900 dark:text-amber-300";
                                      } else {
                                        bubbleStyle = "bg-red-500/10 border-red-500 text-red-950 dark:text-red-300";
                                      }
                                    } else if (isSelected) {
                                      bubbleStyle = "border-primary bg-primary/5 text-foreground";
                                    }

                                    return (
                                      <motion.div
                                        key={idx}
                                        className={`flex items-start gap-2 ${isSpeakerRight ? "flex-row-reverse" : ""}`}
                                      >
                                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white ${
                                          isSpeakerRight ? "bg-indigo-600" : "bg-emerald-600"
                                        }`}>
                                          {msg.speaker.charAt(0)}
                                        </div>
                                        
                                        <button
                                          disabled={showFeedback && isCorrect}
                                          onClick={() => {
                                            setClickedBubbleIdx(idx);
                                            const correct = msg.fallacy === true;
                                            setIsCorrect(correct);
                                            setShowFeedback(true);
                                            if (correct) {
                                              const newCompleted = [...completedSlides];
                                              newCompleted[activeSlideIdx] = true;
                                              setCompletedSlides(newCompleted);
                                            }
                                          }}
                                          className={`max-w-[80%] text-left p-2.5 rounded-2xl border text-xs transition-all shadow-sm hover:scale-[1.01] active:scale-95 ${bubbleStyle}`}
                                        >
                                          <div className="font-bold text-[9px] text-muted-foreground mb-0.5">
                                            {msg.speaker}
                                          </div>
                                          <p className="leading-relaxed text-[11px]">{msg.text}</p>
                                        </button>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>

                              {showFeedback && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`p-3 rounded-lg border text-xs leading-relaxed ${
                                    isCorrect
                                      ? "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-300"
                                      : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
                                  }`}
                                >
                                  <div className="flex gap-2 items-start font-medium mb-1">
                                    {isCorrect ? (
                                      <>
                                        <Award className="h-4 w-4 text-amber-500 shrink-0" />
                                        <span>Logical Fallacy Exposed!</span>
                                      </>
                                    ) : (
                                      <>
                                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                        <span>Clean logic</span>
                                      </>
                                    )}
                                  </div>
                                  <p className="text-muted-foreground mt-1 text-[11px]">
                                    {isCorrect ? activeSlide.puzzleData.explanation : "This response does not contain any fallacies. It makes valid claims or introduces background. Click Bob/Senator's bubble to check!"}
                                  </p>
                                </motion.div>
                              )}
                            </div>
                          )}

                          {/* 3. Causal Sun Confounder Puzzle */}
                          {activeSlide.visualType === "causal-sun" && activeSlide.puzzleData && (
                            <div className="space-y-4">
                              <div className="bg-slate-900/5 dark:bg-slate-950/50 p-4 rounded-xl border border-muted flex flex-col items-center justify-center relative min-h-[160px] overflow-hidden">
                                <style>{`
                                  @keyframes flow {
                                    from { stroke-dashoffset: 24; }
                                    to { stroke-dashoffset: 0; }
                                  }
                                  .causal-path {
                                    stroke-dasharray: 6 4;
                                    animation: flow 1.2s linear infinite;
                                  }
                                  @keyframes spin-slow {
                                    from { transform: rotate(0deg); }
                                    to { transform: rotate(360deg); }
                                  }
                                  .sun-spin {
                                    animation: spin-slow 20s linear infinite;
                                    transform-origin: center center;
                                  }
                                `}</style>

                                <div className="flex justify-between items-center w-full max-w-sm relative z-10 gap-6">
                                  <div className="flex flex-col items-center p-2.5 bg-background border border-muted rounded-xl w-24 text-center shadow-sm">
                                    <span className="text-2xl">🍦</span>
                                    <span className="text-[9px] font-bold mt-1 text-foreground">Ice Cream Sales</span>
                                    <span className="text-[8px] text-green-500 font-bold mt-0.5">+142% Increase</span>
                                  </div>

                                  <div className="flex-1 flex flex-col items-center">
                                    {!isCorrect && (
                                      <div className="text-[10px] text-muted-foreground font-bold bg-muted px-2 py-0.5 rounded border border-dashed animate-pulse">
                                        Correlated 🔗
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-col items-center p-2.5 bg-background border border-muted rounded-xl w-24 text-center shadow-sm">
                                    <span className="text-2xl">🥵</span>
                                    <span className="text-[9px] font-bold mt-1 text-foreground">Sunburn Cases</span>
                                    <span className="text-[8px] text-red-500 font-bold mt-0.5">+160% Increase</span>
                                  </div>
                                </div>

                                <AnimatePresence>
                                  {isCorrect && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -30, scale: 0.6 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      className="absolute inset-0 flex flex-col items-center justify-start pt-1.5 z-0"
                                    >
                                      <svg className="w-12 h-12 text-amber-500 sun-spin" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.01c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
                                      </svg>
                                      <span className="text-[8px] font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full mt-1 border border-amber-500/20 backdrop-blur-sm z-10">
                                        Confounder: Summer Heat
                                      </span>

                                      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 350 180">
                                        <path d="M 175 40 L 70 120" fill="none" stroke="#F59E0B" strokeWidth="2" className="causal-path" />
                                        <path d="M 175 40 L 280 120" fill="none" stroke="#F59E0B" strokeWidth="2" className="causal-path" />
                                      </svg>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              <div className="space-y-1.5">
                                {activeSlide.puzzleData.options?.map((option, idx) => {
                                  const isSelected = selectedOptionIdx === idx;
                                  let btnStyle = "border-muted hover:border-primary hover:bg-primary/5 bg-background text-foreground";
                                  if (showFeedback) {
                                    if (idx === activeSlide.puzzleData?.correctAnswerIdx) {
                                      btnStyle = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
                                    } else if (isSelected) {
                                      btnStyle = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                                    } else {
                                      btnStyle = "border-muted opacity-50";
                                    }
                                  } else if (isSelected) {
                                    btnStyle = "border-primary bg-primary/10 text-primary";
                                  }

                                  return (
                                    <button
                                      key={idx}
                                      disabled={showFeedback && isCorrect}
                                      onClick={() => {
                                        setSelectedOptionIdx(idx);
                                        const correct = idx === activeSlide.puzzleData?.correctAnswerIdx;
                                        setIsCorrect(correct);
                                        setShowFeedback(true);
                                        if (correct) {
                                          const newCompleted = [...completedSlides];
                                          newCompleted[activeSlideIdx] = true;
                                          setCompletedSlides(newCompleted);
                                        }
                                      }}
                                      className={`w-full text-left p-2.5 rounded-xl border text-[11px] transition-all flex gap-2 shadow-sm hover:scale-[1.01] active:scale-95 ${btnStyle}`}
                                    >
                                      <span className="font-bold text-muted-foreground">{String.fromCharCode(65 + idx)}.</span>
                                      <span className="font-medium leading-normal">{option}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {showFeedback && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`p-3 rounded-lg border text-xs leading-relaxed ${
                                    isCorrect
                                      ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400"
                                      : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
                                  }`}
                                >
                                  <div className="flex gap-2 items-start font-medium mb-1">
                                    {isCorrect ? (
                                      <>
                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                        <span>Confounder Unlocked!</span>
                                      </>
                                    ) : (
                                      <>
                                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                        <span>False Causality</span>
                                      </>
                                    )}
                                  </div>
                                  <p className="text-muted-foreground mt-1 text-[11px]">
                                    {isCorrect ? activeSlide.puzzleData.explanation : "Correlation means variables move together, but they may be driven by a third confounding variable. Try option C!"}
                                  </p>
                                </motion.div>
                              )}
                            </div>
                          )}

                          {/* 4. Reframe Balance Scale */}
                          {activeSlide.visualType === "reframe-scale" && activeSlide.puzzleData && (
                            <div className="space-y-4">
                              <div className="bg-slate-900/5 dark:bg-slate-950/50 p-4 rounded-xl border border-muted flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
                                <div className="w-full max-w-[280px] h-[130px] flex items-center justify-center relative">
                                  <svg className="w-full h-full" viewBox="0 0 300 180" fill="none">
                                    <rect x="146" y="40" width="8" height="95" fill="#64748B" rx="1.5" />
                                    <path d="M 125 135 L 175 135" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
                                    <circle cx="150" cy="40" r="6" fill="#475569" />

                                    <g style={{
                                      transform: `rotate(${isCorrect ? 12 : -12}deg)`,
                                      transformOrigin: "150px 40px",
                                      transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
                                    }}>
                                      <line x1="60" y1="40" x2="240" y2="40" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
                                      
                                      {/* Left Pan */}
                                      <g style={{
                                        transform: `rotate(${isCorrect ? -12 : 12}deg)`,
                                        transformOrigin: "60px 40px",
                                        transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
                                      }}>
                                        <line x1="60" y1="40" x2="35" y2="90" stroke="#94A3B8" strokeWidth="1.2" />
                                        <line x1="60" y1="40" x2="85" y2="90" stroke="#94A3B8" strokeWidth="1.2" />
                                        <path d="M 30 90 Q 60 98 90 90" stroke="#475569" strokeWidth="4" fill="#334155" />
                                        
                                        <rect x="25" y="96" width="70" height="34" fill="rgba(239, 68, 68, 0.08)" stroke="#EF4444" strokeWidth="1" rx="4" />
                                        <text x="60" y="110" fill="#EF4444" fontSize="7" fontWeight="bold" textAnchor="middle">Opponent:</text>
                                        <text x="60" y="120" fill="#EF4444" fontSize="6" textAnchor="middle">Remote = Lazy</text>
                                      </g>

                                      {/* Right Pan */}
                                      <g style={{
                                        transform: `rotate(${isCorrect ? -12 : 12}deg)`,
                                        transformOrigin: "240px 40px",
                                        transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
                                      }}>
                                        <line x1="240" y1="40" x2="215" y2="90" stroke="#94A3B8" strokeWidth="1.2" />
                                        <line x1="240" y1="40" x2="265" y2="90" stroke="#94A3B8" strokeWidth="1.2" />
                                        <path d="M 210 90 Q 240 98 270 90" stroke="#475569" strokeWidth="4" fill="#334155" />
                                        
                                        <rect x="205" y="96" width="70" height="34" 
                                              fill={isCorrect ? "rgba(34, 197, 94, 0.08)" : "rgba(148, 163, 184, 0.08)"} 
                                              stroke={isCorrect ? "#22C55E" : "#94A3B8"} 
                                              strokeDasharray={isCorrect ? "0" : "2,2"} 
                                              strokeWidth="1" rx="4" />
                                        <text x="240" y="110" fill={isCorrect ? "#22C55E" : "#64748B"} fontSize="7" fontWeight="bold" textAnchor="middle">
                                          {isCorrect ? "Reframe:" : "Select Reframe"}
                                        </text>
                                        <text x="240" y="120" fill={isCorrect ? "#22C55E" : "#64748B"} fontSize="6" textAnchor="middle">
                                          {isCorrect ? "Focused Output" : "???"}
                                        </text>
                                      </g>
                                    </g>
                                  </svg>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                {activeSlide.puzzleData.options?.map((option, idx) => {
                                  const isSelected = selectedOptionIdx === idx;
                                  let btnStyle = "border-muted hover:border-primary hover:bg-primary/5 bg-background text-foreground";
                                  if (showFeedback) {
                                    if (idx === activeSlide.puzzleData?.correctAnswerIdx) {
                                      btnStyle = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
                                    } else if (isSelected) {
                                      btnStyle = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                                    } else {
                                      btnStyle = "border-muted opacity-50";
                                    }
                                  } else if (isSelected) {
                                    btnStyle = "border-primary bg-primary/10 text-primary";
                                  }

                                  return (
                                    <button
                                      key={idx}
                                      disabled={showFeedback && isCorrect}
                                      onClick={() => {
                                        setSelectedOptionIdx(idx);
                                        const correct = idx === activeSlide.puzzleData?.correctAnswerIdx;
                                        setIsCorrect(correct);
                                        setShowFeedback(true);
                                        if (correct) {
                                          const newCompleted = [...completedSlides];
                                          newCompleted[activeSlideIdx] = true;
                                          setCompletedSlides(newCompleted);
                                        }
                                      }}
                                      className={`w-full text-left p-2.5 rounded-xl border text-[11px] transition-all flex gap-2 shadow-sm hover:scale-[1.01] active:scale-95 ${btnStyle}`}
                                    >
                                      <span className="font-bold text-muted-foreground">{String.fromCharCode(65 + idx)}.</span>
                                      <span className="font-medium leading-normal">{option}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {showFeedback && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`p-3 rounded-lg border text-xs leading-relaxed ${
                                    isCorrect
                                      ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400"
                                      : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
                                  }`}
                                >
                                  <div className="flex gap-2 items-start font-medium mb-1">
                                    {isCorrect ? (
                                      <>
                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                        <span>Scale Tilted In Your Favor!</span>
                                      </>
                                    ) : (
                                      <>
                                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                        <span>Weak Reframe</span>
                                      </>
                                    )}
                                  </div>
                                  <p className="text-muted-foreground mt-1 text-[11px]">
                                    {isCorrect ? activeSlide.puzzleData.explanation : "Denying claims doesn't shift the lens. Choose the option that reframes remote work from a perspective of stress-free focus."}
                                  </p>
                                </motion.div>
                              )}
                            </div>
                          )}

                          {/* 5. Rhetoric Highlighter */}
                          {activeSlide.visualType === "highlight-rhetoric" && activeSlide.puzzleData && (
                            <div className="space-y-4">
                              <div className="bg-slate-900/5 dark:bg-slate-950/60 p-4 rounded-xl border border-muted relative shadow-sm">
                                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest border-b pb-1.5 mb-2.5">
                                  Highlight Mode: PATHOS
                                </div>
                                <div className="space-y-2 font-serif text-[11px] leading-relaxed">
                                  {activeSlide.puzzleData.options?.map((option, idx) => {
                                    const isSelected = selectedOptionIdx === idx;
                                    let highlightStyle = "hover:bg-muted/40 cursor-pointer p-2 rounded transition-all border border-transparent";
                                    
                                    if (showFeedback) {
                                      if (idx === activeSlide.puzzleData?.correctAnswerIdx) {
                                        highlightStyle = "bg-rose-500/20 border-rose-500 text-rose-900 dark:text-rose-300 p-2 rounded";
                                      } else if (isSelected) {
                                        highlightStyle = "bg-red-500/10 border-red-500 text-red-800 dark:text-red-400 p-2 rounded opacity-50";
                                      } else {
                                        highlightStyle = "opacity-40 p-2 rounded";
                                      }
                                    } else if (isSelected) {
                                      highlightStyle = "bg-primary/10 border-primary/40 text-primary p-2 rounded";
                                    }

                                    return (
                                      <motion.div
                                        key={idx}
                                        onClick={() => {
                                          if (showFeedback && isCorrect) return;
                                          setSelectedOptionIdx(idx);
                                          const correct = idx === activeSlide.puzzleData?.correctAnswerIdx;
                                          setIsCorrect(correct);
                                          setShowFeedback(true);
                                          if (correct) {
                                            const newCompleted = [...completedSlides];
                                            newCompleted[activeSlideIdx] = true;
                                            setCompletedSlides(newCompleted);
                                          }
                                        }}
                                        className={highlightStyle}
                                        whileHover={{ scale: (showFeedback && isCorrect) ? 1 : 1.01 }}
                                        whileTap={{ scale: (showFeedback && isCorrect) ? 1 : 0.99 }}
                                      >
                                        <div className="flex gap-2 items-start">
                                          <span className="shrink-0 text-[9px] font-sans font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                            Sentence {idx + 1}
                                          </span>
                                          <span className="text-foreground leading-normal">{option}</span>
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>

                              {showFeedback && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`p-3 rounded-lg border text-xs leading-relaxed ${
                                    isCorrect
                                      ? "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-300"
                                      : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
                                  }`}
                                >
                                  <div className="flex gap-2 items-start font-medium mb-1">
                                    {isCorrect ? (
                                      <>
                                        <Flame className="h-4 w-4 text-rose-500 shrink-0" />
                                        <span>Pathos Detected!</span>
                                      </>
                                    ) : (
                                      <>
                                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                        <span>Logical/Credibility appeal</span>
                                      </>
                                    )}
                                  </div>
                                  <p className="text-muted-foreground mt-1 text-[11px]">
                                    {isCorrect ? activeSlide.puzzleData.explanation : "Sentence 1 is Ethos (credentials) and Sentence 3 is Logos (statistics). Try highlighting Sentence 2!"}
                                  </p>
                                </motion.div>
                              )}
                            </div>
                          )}

                          {/* 6. Objection Handshake */}
                          {activeSlide.visualType === "objection-handshake" && activeSlide.puzzleData && (
                            <div className="space-y-4">
                              <div className="bg-slate-900/5 dark:bg-slate-950/50 p-4 rounded-xl border border-muted flex flex-col items-center justify-center min-h-[150px] relative overflow-hidden">
                                <div className="flex items-center justify-center gap-6 w-full max-w-xs relative z-10">
                                  <div className="flex flex-col items-center gap-1.5">
                                    <div className="text-[9px] font-bold text-muted-foreground uppercase">Buyer</div>
                                    <motion.div
                                      animate={isCorrect ? { scale: [1, 1.1, 1] } : {}}
                                      className={`h-12 w-12 rounded-full flex items-center justify-center shadow-md border-2 ${
                                        isCorrect 
                                          ? "bg-green-500/10 border-green-500 text-green-500" 
                                          : showFeedback 
                                          ? "bg-red-500/10 border-red-500 text-red-500" 
                                          : "bg-indigo-500/10 border-indigo-500 text-indigo-500"
                                      }`}
                                    >
                                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                        {isCorrect ? (
                                          <path d="M9 10c.8 1 2.2 1 3 0" stroke="currentColor" strokeWidth="1.5" />
                                        ) : showFeedback ? (
                                          <path d="M9 10h6" stroke="currentColor" strokeWidth="1.5" />
                                        ) : (
                                          <path d="M10 10.5h4" stroke="currentColor" strokeWidth="1.5" />
                                        )}
                                      </svg>
                                    </motion.div>
                                    <span className="text-[9px] font-bold text-foreground">Skeptical</span>
                                  </div>

                                  <div className="flex-1 flex justify-center items-center h-12 relative">
                                    <AnimatePresence>
                                      {isCorrect ? (
                                        <motion.div
                                          initial={{ scale: 0, rotate: -30 }}
                                          animate={{ scale: 1, rotate: 0 }}
                                          className="text-3xl text-amber-500 flex flex-col items-center gap-0.5"
                                        >
                                          <span>🤝</span>
                                        </motion.div>
                                      ) : (
                                        <motion.div className="text-xl text-muted-foreground opacity-30 animate-pulse">
                                          ⚡
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>

                                  <div className="flex flex-col items-center gap-1.5">
                                    <div className="text-[9px] font-bold text-muted-foreground uppercase">Consultant</div>
                                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 flex items-center justify-center shadow-md">
                                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                      </svg>
                                    </div>
                                    <span className="text-[9px] font-bold text-foreground">You</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                {activeSlide.puzzleData.options?.map((option, idx) => {
                                  const isSelected = selectedOptionIdx === idx;
                                  let btnStyle = "border-muted hover:border-primary hover:bg-primary/5 bg-background text-foreground";
                                  if (showFeedback) {
                                    if (idx === activeSlide.puzzleData?.correctAnswerIdx) {
                                      btnStyle = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
                                    } else if (isSelected) {
                                      btnStyle = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                                    } else {
                                      btnStyle = "border-muted opacity-50";
                                    }
                                  } else if (isSelected) {
                                    btnStyle = "border-primary bg-primary/10 text-primary";
                                  }

                                  return (
                                    <button
                                      key={idx}
                                      disabled={showFeedback && isCorrect}
                                      onClick={() => {
                                        setSelectedOptionIdx(idx);
                                        const correct = idx === activeSlide.puzzleData?.correctAnswerIdx;
                                        setIsCorrect(correct);
                                        setShowFeedback(true);
                                        if (correct) {
                                          const newCompleted = [...completedSlides];
                                          newCompleted[activeSlideIdx] = true;
                                          setCompletedSlides(newCompleted);
                                        }
                                      }}
                                      className={`w-full text-left p-2.5 rounded-xl border text-[11px] transition-all flex gap-2 shadow-sm hover:scale-[1.01] active:scale-95 ${btnStyle}`}
                                    >
                                      <span className="font-bold text-muted-foreground">{String.fromCharCode(65 + idx)}.</span>
                                      <span className="font-medium leading-normal">{option}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {showFeedback && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`p-3 rounded-lg border text-xs leading-relaxed ${
                                    isCorrect
                                      ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400"
                                      : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
                                  }`}
                                >
                                  <div className="flex gap-2 items-start font-medium mb-1">
                                    {isCorrect ? (
                                      <>
                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                        <span>Alignment Achieved!</span>
                                      </>
                                    ) : (
                                      <>
                                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                        <span>Defensive posture</span>
                                      </>
                                    )}
                                  </div>
                                  <p className="text-muted-foreground mt-1 text-[11px]">
                                    {isCorrect ? activeSlide.puzzleData.explanation : "Arguing directly creates immediate barriers. Choose the answer that validates their budget constraint first."}
                                  </p>
                                </motion.div>
                              )}
                            </div>
                          )}

                          {/* 7. Slide Quiz Element */}
                          {activeSlide.type === "quiz" && activeSlide.quiz && (() => {
                            const quiz = activeSlide.quiz;
                            return (
                              <div className="space-y-4">
                                <div className="bg-primary/5 p-4 border border-primary/10 rounded-xl space-y-3">
                                  <h4 className="text-xs font-bold flex items-center gap-1.5 text-foreground uppercase tracking-wider">
                                    <HelpCircle className="h-4 w-4 text-primary" />
                                    Check your understanding
                                  </h4>
                                  <p className="text-xs font-semibold text-foreground leading-normal">
                                    {quiz.question}
                                  </p>
                                  <div className="space-y-1.5">
                                    {quiz.options.map((option, idx) => {
                                      const isSelected = selectedOptionIdx === idx;
                                      const isCorrectAns = idx === quiz.correctAnswerIdx;
                                      let btnStyle = "border-muted hover:border-primary hover:bg-primary/5 bg-background text-foreground";
                                      
                                      if (showFeedback) {
                                        if (isCorrectAns) {
                                          btnStyle = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
                                        } else if (isSelected) {
                                          btnStyle = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                                        } else {
                                          btnStyle = "border-muted opacity-50";
                                        }
                                      } else if (isSelected) {
                                        btnStyle = "border-primary bg-primary/10 text-primary";
                                      }

                                      return (
                                        <button
                                          key={idx}
                                          disabled={showFeedback && isCorrect}
                                          onClick={() => {
                                            setSelectedOptionIdx(idx);
                                            const correct = idx === quiz.correctAnswerIdx;
                                            setIsCorrect(correct);
                                            setShowFeedback(true);
                                            if (correct) {
                                              const newCompleted = [...completedSlides];
                                              newCompleted[activeSlideIdx] = true;
                                              setCompletedSlides(newCompleted);
                                            }
                                          }}
                                          className={`w-full text-left p-2.5 rounded-xl border text-[11px] transition-all flex gap-2 shadow-sm hover:scale-[1.01] active:scale-95 ${btnStyle}`}
                                        >
                                          <span className="font-bold text-muted-foreground">{String.fromCharCode(65 + idx)}.</span>
                                          <span className="leading-normal">{option}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {showFeedback && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className={`p-3 rounded-lg border text-xs leading-relaxed ${
                                        isCorrect
                                          ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400"
                                          : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
                                      }`}
                                    >
                                      <div className="flex gap-2 items-start font-medium mb-1">
                                        {isCorrect ? (
                                          <>
                                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                            <span>Correct Answer!</span>
                                          </>
                                        ) : (
                                          <>
                                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                            <span>Incorrect response</span>
                                          </>
                                        )}
                                      </div>
                                      <p className="text-muted-foreground mt-1 text-[11px]">{quiz.explanation}</p>
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex justify-between items-center p-4 border-t bg-muted/10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevSlide}
                      disabled={activeSlideIdx === 0}
                      className="text-xs h-8"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={handleNextSlide}
                      disabled={!canContinue}
                      className="text-xs h-8 group"
                    >
                      {activeSlideIdx < activeLesson.slides.length - 1 ? (
                        <>
                          Continue <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      ) : activeLessonIdx < course.lessons.length - 1 ? (
                        <>
                          Next Lesson <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      ) : (
                        <>
                          Proceed to Final Quiz <Award className="ml-1 h-4 w-4 group-hover:scale-110 transition-transform" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {viewMode === "final-quiz" && (
              <motion.div
                key="final-quiz"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {!quizProgress.completed ? (
                  <Card className="border border-muted/80 shadow-lg">
                    <CardHeader className="border-b border-muted/50">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-primary font-bold tracking-wider uppercase bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                          Final Exam: Q{quizProgress.activeQuestionIdx + 1} of {course.finalQuiz.length}
                        </span>
                        <span className="text-xs text-muted-foreground font-semibold">
                          Passing requirement: 80%
                        </span>
                      </div>
                      <Progress 
                        value={(quizProgress.activeQuestionIdx / course.finalQuiz.length) * 100} 
                        className="h-1.5 mt-3" 
                      />
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <p className="text-sm font-semibold text-foreground leading-relaxed">
                        {course.finalQuiz[quizProgress.activeQuestionIdx].question}
                      </p>
                      
                      <div className="space-y-2">
                        {course.finalQuiz[quizProgress.activeQuestionIdx].options.map((option, idx) => {
                          const isSelected = finalQuizOption === idx;
                          let borderStyle = "border-muted bg-background/50 hover:bg-background";
                          
                          if (showFinalFeedback) {
                            const isCorrectAns = idx === course.finalQuiz[quizProgress.activeQuestionIdx].correctAnswerIdx;
                            if (isCorrectAns) borderStyle = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
                            else if (isSelected) borderStyle = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                            else borderStyle = "border-muted opacity-60";
                          } else if (isSelected) {
                            borderStyle = "border-primary bg-primary/10 text-primary";
                          }

                          return (
                            <button
                              key={idx}
                              disabled={showFinalFeedback}
                              onClick={() => setFinalQuizOption(idx)}
                              className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex gap-3 shadow-sm hover:scale-[1.01] active:scale-95 ${borderStyle}`}
                            >
                              <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span>
                              <span>{option}</span>
                            </button>
                          );
                        })}
                      </div>

                      {showFinalFeedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3 rounded-lg border text-xs leading-relaxed ${
                            finalQuizOption === course.finalQuiz[quizProgress.activeQuestionIdx].correctAnswerIdx
                              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400"
                              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
                          }`}
                        >
                          <div className="flex gap-2 items-start font-medium mb-1">
                            {finalQuizOption === course.finalQuiz[quizProgress.activeQuestionIdx].correctAnswerIdx ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                <span>Correct response!</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                <span>Incorrect</span>
                              </>
                            )}
                          </div>
                          <p className="text-muted-foreground mt-0.5 text-[11px]">{course.finalQuiz[quizProgress.activeQuestionIdx].explanation}</p>
                        </motion.div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end p-4 border-t bg-muted/10">
                      <Button
                        size="sm"
                        disabled={finalQuizOption === null || showFinalFeedback}
                        onClick={handleFinalQuizSubmit}
                        className="text-xs"
                      >
                        Submit Question
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card className="text-center py-10 border border-muted/80 shadow-lg bg-gradient-to-b from-card to-card/95">
                    <CardContent className="space-y-6">
                      <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-primary/10">
                        <Award className={`h-8 w-8 ${finalQuizPassed ? "text-amber-500 animate-bounce" : "text-muted-foreground"}`} />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-extrabold tracking-tight">Quiz Completed!</h3>
                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                          You scored <span className="font-bold text-foreground">{quizProgress.score} out of {course.finalQuiz.length}</span> (
                          {Math.round((quizProgress.score / course.finalQuiz.length) * 100)}%).
                        </p>
                      </div>

                      {finalQuizPassed ? (
                        <div className="space-y-4 max-w-sm mx-auto p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                          <p className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-green-500" />
                            Congratulations! Certificate unlocked.
                          </p>
                          <Button onClick={() => setViewMode("certificate")} className="w-full text-xs">
                            <Award className="mr-2 h-4 w-4" /> View Certificate
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4 max-w-sm mx-auto p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                          <p className="text-xs text-destructive font-semibold">
                            You did not meet the 80% passing threshold.
                          </p>
                          <Button onClick={handleResetQuiz} variant="outline" className="w-full text-xs">
                            Try Again
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {viewMode === "certificate" && (
              <motion.div
                key="certificate"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6 print:m-0 print:border-none print:shadow-none"
              >
                <Card className="border-4 border-double border-amber-500/30 p-8 bg-gradient-to-br from-amber-500/5 via-background to-amber-500/5 relative overflow-hidden shadow-2xl rounded-xl print:border-amber-600 print:bg-white print:p-12 print:text-black">
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-500/40 print:border-amber-600"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-500/40 print:border-amber-600"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-500/40 print:border-amber-600"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-500/40 print:border-amber-600"></div>

                  <CardContent className="text-center space-y-6 pt-8">
                    <span className="text-[9px] font-extrabold tracking-widest text-amber-500 uppercase print:text-amber-600">
                      LogicShield Rhetoric Academy
                    </span>
                    
                    <h2 className="text-xl font-serif font-semibold tracking-wide text-foreground print:text-black mt-2">
                      Certificate of Accomplishment
                    </h2>
                    
                    <p className="text-xs italic text-muted-foreground print:text-slate-600">
                      This is proudly presented to
                    </p>
                    
                    <h3 className="text-2xl font-bold tracking-tight text-foreground print:text-black font-serif underline decoration-amber-500 decoration-double underline-offset-8">
                      {user?.full_name || user?.email || "Student Name"}
                    </h3>
                    
                    <p className="text-xs text-muted-foreground print:text-slate-600 max-w-md mx-auto leading-relaxed">
                      for successfully completing the course <span className="font-semibold text-foreground print:text-black font-serif">"{course.title}"</span> with distinction, demonstrating expertise in analytical reasoning, structured persuasion, and cognitive fallacy detection.
                    </p>

                    <div className="pt-6 flex justify-between items-end max-w-lg mx-auto gap-12">
                      <div className="text-left border-t border-muted-foreground/30 pt-2 w-40 print:border-slate-400">
                        <p className="text-[10px] font-medium text-foreground print:text-black">LogicShield Board</p>
                        <p className="text-[9px] text-muted-foreground print:text-slate-500">Academy Director</p>
                      </div>
                      
                      <div className="w-14 h-14 rounded-full border-4 border-amber-500/30 flex items-center justify-center bg-amber-500/10 shrink-0 relative rotate-12 print:border-amber-600 print:bg-amber-100">
                        <Award className="h-7 w-7 text-amber-500 print:text-amber-600" />
                        <span className="absolute text-[6px] font-bold tracking-tighter uppercase text-amber-500/80 rotate-45 print:text-amber-700">
                          VERIFIED
                        </span>
                      </div>

                      <div className="text-right border-t border-muted-foreground/30 pt-2 w-40 print:border-slate-400">
                        <p className="text-[10px] font-medium text-foreground print:text-black">
                          {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                        <p className="text-[9px] text-muted-foreground print:text-slate-500">Date Issued</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3 justify-center print:hidden">
                  <Button variant="outline" size="sm" onClick={() => setViewMode("final-quiz")} className="text-xs">
                    Back to Quiz
                  </Button>
                  <Button size="sm" onClick={() => window.print()} className="bg-amber-600 hover:bg-amber-700 text-white text-xs">
                    <Printer className="mr-2 h-4 w-4" /> Print Certificate
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
