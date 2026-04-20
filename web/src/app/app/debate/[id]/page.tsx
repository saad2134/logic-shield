import { siteConfig } from "@/config/site";
import DebateSessionClient from "./debate-session-client";

export const metadata = {
  title: `Debate Session ✦ ${siteConfig.name}`,
  description: "Engage in a live debate with an AI opponent and receive real-time analysis.",
};

export default function DebateSessionPage() {
  return <DebateSessionClient />;
}
