import { siteConfig } from "@/config/site";
import HistoryClient from "./history-client";

export const metadata = {
  title: `Debate History ✦ ${siteConfig.name}`,
  description: "View and review your past debate sessions in the demo mode.",
};

export default function HistoryPage() {
  return <HistoryClient />;
}
