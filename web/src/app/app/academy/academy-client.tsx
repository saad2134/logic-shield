"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Play, 
  Clock, 
  ChevronRight, 
  Flame, 
  ShieldQuestion 
} from "lucide-react";
import { api, LearningProgress } from "@/lib/api-app";
import { courses } from "@/config/courses";

export default function AcademyClient() {
  const router = useRouter();
  const [progress, setProgress] = React.useState<LearningProgress | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (progress && !progress.assessment) {
      router.push("/app/learning-path");
    }
  }, [progress, router]);

  React.useEffect(() => {
    async function loadProgress() {
      try {
        const data = await api.getLearningProgress();
        setProgress(data);
      } catch (err) {
        console.error("Failed to load learning progress:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProgress();
  }, []);

  const getCourseCompletedCount = (courseId: string) => {
    if (!progress) return 0;
    const courseObj = courses.find(c => c.id === courseId);
    if (!courseObj) return 0;

    let completed = 0;
    courseObj.lessons.forEach(lesson => {
      const key = `${courseId}:${lesson.id}`;
      if (progress.completed_lessons.includes(key)) {
        completed++;
      }
    });
    return completed;
  };

  const totalLessons = courses.reduce((acc, c) => acc + c.lessons.length, 0);
  const completedCount = progress?.completed_lessons.length || 0;
  const overallPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Determine completed courses count
  const completedCoursesCount = courses.filter(c => {
    return getCourseCompletedCount(c.id) === c.lessons.length;
  }).length;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-background/40 backdrop-blur-md border-foreground/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
              <GraduationCap size={120} />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Overall Progress</CardDescription>
              <CardTitle className="text-3xl font-extrabold text-primary">
                {overallPercent}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={overallPercent} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                {completedCount} of {totalLessons} lessons finished
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-background/40 backdrop-blur-md border-foreground/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
              <BookOpen size={120} />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Courses Completed</CardDescription>
              <CardTitle className="text-3xl font-extrabold text-green-500">
                {completedCoursesCount} <span className="text-sm font-normal text-muted-foreground">/ {courses.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Finish all lessons in a course to claim your certificate
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-background/40 backdrop-blur-md border-foreground/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
              <Award size={120} />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Rhetoric Level</CardDescription>
              <CardTitle className="text-3xl font-extrabold text-blue-500 capitalize">
                {progress?.assessment?.level || "Beginner"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {progress?.assessment ? "Determined by assessment quiz" : "Take onboarding assessment to calculate"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Course Catalog */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Structured Courses</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course, idx) => {
            const completedLessons = getCourseCompletedCount(course.id);
            const totalLessonsInCourse = course.lessons.length;
            const coursePercent = totalLessonsInCourse > 0 ? Math.round((completedLessons / totalLessonsInCourse) * 100) : 0;
            const isCompleted = completedLessons === totalLessonsInCourse;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:border-primary/20 hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          {course.title}
                          {isCompleted && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-xs">
                          {course.description}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        course.difficulty === "Beginner" ? "secondary" :
                        course.difficulty === "Intermediate" ? "outline" : "default"
                      } className="shrink-0 text-[10px]">
                        {course.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {course.duration}
                      </span>
                      <span>
                        {completedLessons} / {totalLessonsInCourse} lessons completed
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Progress</span>
                        <span>{coursePercent}%</span>
                      </div>
                      <Progress value={coursePercent} className="h-1.5" />
                    </div>

                    <Button asChild className="w-full mt-2" variant={isCompleted ? "outline" : "default"}>
                      <Link href={`/app/academy/${course.id}`}>
                        <Play className="mr-2 h-3.5 w-3.5 fill-current" />
                        {completedLessons > 0 ? (isCompleted ? "Review Course" : "Continue Course") : "Start Course"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
