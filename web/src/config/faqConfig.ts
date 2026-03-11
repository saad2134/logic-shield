export interface FAQItem {
  question: string;
  answer: string;
  value?: string;
}

export const faqConfig: FAQItem[] = [
  {
    question: "What is LogicShield?",
    answer: "LogicShield is an AI-powered debate training and communication risk analysis platform that strengthens your arguments, detects logical fallacies, and evaluates reputational risk before you publish, pitch, or perform.",
  },
  {
    question: "How does the AI debate simulation work?",
    answer: "You choose a topic and stance, then engage in real-time debates with an AI opponent. Select from personas like Logical, Aggressive, Skeptical, or Devil's Advocate for varied challenges.",
  },
  {
    question: "What types of logical fallacies can it detect?",
    answer: "LogicShield can identify 15+ common fallacies including ad hominem, strawman, false dilemma, slippery slope, circular reasoning, appeal to authority, and more using transformer-based ML models.",
  },
  {
    question: "Is my debate data private?",
    answer: "Yes. We respect your privacy. Your arguments and session history are stored securely and are only used to provide our services. We never sell your personal data.",
  },
  {
    question: "What is reputation risk analysis?",
    answer: "Our system evaluates how your arguments might be perceived publicly by detecting potentially toxic language, hate speech, and aggressive phrasing using specialized NLP models.",
  },
  {
    question: "Can I use LogicShield for professional purposes?",
    answer: "Absolutely! Law professionals, executives, public speakers, and content creators use LogicShield to prepare for presentations, pitches, and content creation.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! We offer a 14-day free trial for Premium features. You can also use the free tier to test basic debate simulation and analysis features.",
  },
  {
    question: "How accurate is the analysis?",
    answer: "Our ML models are trained on large datasets and provide probabilistic analysis. While we strive for accuracy, results should be used as guidance rather than absolute truth.",
  },
];
