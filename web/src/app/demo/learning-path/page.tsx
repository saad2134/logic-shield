import LearningPathClient from "@/app/app/learning-path/learning-path-client";

export const metadata = {
  title: "Personalized Learning Path - LogicShield Demo",
  description: "Track your logical weaknesses, review spaced-repetition cards, and access targeted debate practice.",
};

export default function DemoLearningPathPage() {
  return <LearningPathClient />;
}
