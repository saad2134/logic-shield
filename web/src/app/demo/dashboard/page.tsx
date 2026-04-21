import { siteConfig } from "@/config/site";
import DashboardClient from "./dashboard-client";

export const metadata = {
  title: `Dashboard ✦ ${siteConfig.name}`,
  description: "View your debate statistics, recent debates, and quick access to LogicShield features.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
