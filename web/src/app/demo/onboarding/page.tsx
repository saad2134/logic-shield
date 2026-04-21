import { siteConfig } from "@/config/site";
import OnboardingClient from "./onboarding-client";

export const metadata = {
  title: `Get Started ✦ ${siteConfig.name}`,
  description: "Set up your profile and preferences to personalize your LogicShield experience.",
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
