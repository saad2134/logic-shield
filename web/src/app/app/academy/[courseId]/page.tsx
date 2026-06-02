import CoursePlayerClient from "./course-player-client";

export const metadata = {
  title: "Course Player - LogicShield",
  description: "Interactive lessons and quizzes to practice argumentation and fallacy detection.",
};

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = await params;
  return <CoursePlayerClient courseId={resolvedParams.courseId} />;
}
