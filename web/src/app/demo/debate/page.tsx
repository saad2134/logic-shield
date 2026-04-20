import { siteConfig } from "@/config/site";
import NewDebateClient from "./debate-client";

export const metadata = {
  title: `Start Debate ✦ ${siteConfig.name}`,
  description: "Challenge yourself against an AI opponent and improve your argumentation skills.",
};

export default function NewDebatePage() {
  return <NewDebateClient />;
}
