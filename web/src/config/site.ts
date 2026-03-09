import { describe } from "node:test";

export const siteConfig = {
  name: "LogicShield",
  version: "v0.1.0",
  url: "",
  getStartedUrl:
    "/auth",
  ogImage: "",
  tagline: "AI-Argument Simulator With Risk Forecasting.",
  description: 
    "AI-powered debate training and communication risk analysis platform. LogicShield strengthens your arguments, detects logical fallacies, and evaluates reputational risk before you publish, pitch, or perform.",
  links: {
    twitter: "",
    github: "https://github.com/saad2134/logic-shield",
    email: "mailto:reach.saad@outlook.com",
    phone: "",
  },
};

export type SiteConfig = typeof siteConfig;
