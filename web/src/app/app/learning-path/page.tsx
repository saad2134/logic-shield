import LearningPathClient from "./learning-path-client";

export const metadata = {
  title: "Personalized Learning Path - LogicShield",
  description: "Track your logical weaknesses, review spaced-repetition cards, and access targeted debate practice.",
};

export default function LearningPathPage() {
  return <LearningPathClient />;
}
