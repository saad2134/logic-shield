import { siteConfig } from "@/config/site";
import NewDebateClient from "./debate-client";
import { Suspense } from "react";

export const metadata = {
  title: `Start Debate ✦ ${siteConfig.name}`,
  description: "Challenge yourself against an AI opponent and improve your argumentation skills.",
};

export default function NewDebatePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <NewDebateClient />
    </Suspense>
  );
}
