export const siteConfig = {
  name: "LogicShield",
  version: "v0.1.0",
  url: "",
  getStartedUrl: "/auth",
  ogImage: "",
  tagline: "AI-Argument Simulator With Risk Forecasting.",
  description: 
    "AI-powered debate training & communication risk analysis platform that strengthens your arguments, detects logical fallacies, and evaluates reputational risk before you publish, pitch, or perform.",
  links: {
    twitter: "",
    github: "https://github.com/saad2134/logic-shield",
    email: "mailto:reach.saad@outlook.com",
    phone: "",
  },
};

export type SiteConfig = typeof siteConfig;

export const CORE_CONFIG = {
  appName: siteConfig.name,
  appDescription: siteConfig.description,
};

export const SOCIAL_LINKS = siteConfig.links;
