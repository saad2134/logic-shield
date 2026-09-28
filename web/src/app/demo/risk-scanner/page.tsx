import { siteConfig } from "@/config/site";
import { Suspense } from "react";
import RiskScannerClient from "@/app/app/risk-scanner/risk-scanner-client";

export const metadata = {
  title: `Risk Scanner ✦ ${siteConfig.name} Demo`,
  description: "Scan professional communications for tone, factuality, sensitivity, and publication safety.",
};

export default function DemoRiskScannerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading Risk Scanner...</div>}>
      <RiskScannerClient />
    </Suspense>
  );
}
