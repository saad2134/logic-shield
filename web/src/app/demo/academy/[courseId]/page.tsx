import CoursePlayerClient from "@/app/app/academy/[courseId]/course-player-client";

export const metadata = {
  title: "Course Player - LogicShield Demo",
  description: "Interactive lessons and quizzes to practice argumentation and fallacy detection.",
};

export default async function DemoCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = await params;
  return <CoursePlayerClient courseId={resolvedParams.courseId} />;
}
