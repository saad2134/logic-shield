import { siteConfig } from "@/config/site";
import DashboardClient from "./dashboard-client";

export const metadata = {
  title: `Dashboard ✦ ${siteConfig.name}`,
  description: "View your personalized dashboard with debate statistics and quick actions.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
