import { siteConfig } from "@/config/site";
import { Suspense } from "react";
import RiskScannerClient from "./risk-scanner-client";

export const metadata = {
  title: `Risk Scanner ✦ ${siteConfig.name}`,
  description: "Scan professional communications for tone, factuality, sensitivity, and publication safety.",
};

export default function RiskScannerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading Risk Scanner...</div>}>
      <RiskScannerClient />
    </Suspense>
  );
}
