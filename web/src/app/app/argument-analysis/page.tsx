import { siteConfig } from "@/config/site";
import AnalysisClient from "./analysis-client";
import { Suspense } from "react";

export const metadata = {
  title: `Argument Analysis ✦ ${siteConfig.name}`,
  description: "Analyze arguments for logical fallacies, strength, and reputational risks.",
};

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <AnalysisClient />
    </Suspense>
  );
}
