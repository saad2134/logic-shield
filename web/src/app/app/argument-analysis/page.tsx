import { siteConfig } from "@/config/site";
import AnalysisClient from "./analysis-client";

export const metadata = {
  title: `Argument Analysis ✦ ${siteConfig.name}`,
  description: "Analyze arguments for logical fallacies, strength, and reputational risks.",
};

export default function AnalysisPage() {
  return <AnalysisClient />;
}
