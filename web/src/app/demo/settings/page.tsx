import { siteConfig } from "@/config/site";
import SettingsClient from "./settings-client";

export const metadata = {
  title: `Settings ✦ ${siteConfig.name}`,
  description: "Customize your LogicShield demo experience with app preferences.",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
