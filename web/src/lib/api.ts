const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface PersonaInfo {
  id: string;
  name: string;
  description: string;
}

export interface DebateSession {
  id: number;
  topic: string;
  user_stance: string;
  opponent_persona: string;
  created_at: string;
  ended_at?: string;
}

export interface Argument {
  id: number;
  session_id: number;
  content: string;
  is_from_user: boolean;
  created_at: string;
}

export interface AnalysisResult {
  fallacy_detected: string[];
  fallacy_confidences: Record<string, number>;
  fallacy_descriptions: Record<string, string>;
  argument_strength: number;
  coherence_score: number;
  evidence_score: number;
  sentiment_score: number;
  logical_score: number;
  reputation_risk_level: string;
  reputation_risk_score: number;
  risk_factors: string[];
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  services: Record<string, string>;
}

export interface QuickAnalysisResult {
  issues: {
    type: string;
    name: string;
    confidence?: number;
    risk_level?: string;
    severity: string;
  }[];
  overall_score: number;
  suggestions: string[];
  risk_level: string;
  is_healthy: boolean;
  timestamp: string;
}

export interface RiskScanResult {
  publish_safe_score: number;
  risk_level: string;
  tone_score: number;
  factuality_score: number;
  sensitivity_score: number;
  risk_factors: string[];
  rewrite_suggestion: string;
  demo_mode?: boolean;
  timestamp: string;
}

let isBackendConnected = true;

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    isBackendConnected = true;
    return response.json();
  } catch (error) {
    isBackendConnected = false;
    throw error;
  }
}

const mockPersonas: PersonaInfo[] = [
  { id: "logical", name: "Logical", description: "Uses facts and structured reasoning to challenge your arguments" },
  { id: "aggressive", name: "Aggressive", description: "Pushes back with challenging and direct counterarguments" },
  { id: "skeptical", name: "Skeptical", description: "Questions your assumptions and demands evidence" },
  { id: "devil_advocate", name: "Devil's Advocate", description: "Takes extreme positions to test your argument strength" },
];

const mockCounterArguments: Record<string, string[]> = {
  logical: [
    "That's an interesting point. However, research shows the opposite - can you provide peer-reviewed sources to support this?",
    "I see your reasoning, but there are counterexamples. Many studies show AI has brought significant benefits through automation and assistance.",
    "Your argument makes an assumption without evidence. What's your source for this claim?",
    "That's a valid concern, but it's only one side of the issue. We should weigh both benefits and risks.",
  ],
  aggressive: [
    "That's just incorrect! The data clearly shows AI tools have increased productivity by 40% in major industries.",
    "You're ignoring the overwhelming evidence. Every major study shows significant AI benefits.",
    "This is simply wrong - the counterarguments are much stronger. Wake up to the facts!",
  ],
  skeptical: [
    "Interesting claim. What's your evidence? I'd like to see peer-reviewed sources on this.",
    "That assumes facts we don't have. Can you verify this with real data? The burden of proof is on you.",
    "I'm not convinced. Show me the research that definitively proves AI does more harm than good.",
    "That's a bold claim with many exceptions. What specific cases are you referring to?",
  ],
  devil_advocate: [
    "Interesting, but what about the opposite? AI has saved millions through medical breakthroughs.",
    "You're ignoring the counterexamples. What if AI does much more good than harm overall?",
    "That's too simplistic. The reality is more nuanced - can you address the counterarguments?",
  ],
};

function generateMockAnalysis(text: string): AnalysisResult {
  const lowerText = text.toLowerCase();
  const wordCount = text.trim().split(/\s+/).length;
  
  if (wordCount < 3) {
    return {
      fallacy_detected: ["no_fallacy"],
      fallacy_confidences: { no_fallacy: 0.9 },
      fallacy_descriptions: { no_fallacy: "Too short to analyze - add more content" },
      argument_strength: 0.5,
      coherence_score: 0.5,
      evidence_score: 0.5,
      sentiment_score: 0.5,
      logical_score: 0.5,
      reputation_risk_level: "low",
      reputation_risk_score: 0.1,
      risk_factors: [],
      timestamp: new Date().toISOString(),
    };
  }
  
  const fallbackTriggerWords: Record<string, string[]> = {
    ad_hominem: ["idiot", "stupid", "fool", "dumb", "ignorant moron", "idiot who"],
    strawman: ["so you're saying that", "what you mean is that", "essentially what"],
    false_dilemma: ["only two options", "either we", "you must choose", "no choice but"],
    slippery_slope: ["will inevitably lead", "must inevitably", "will lead to total"],
    appeal_to_authority: ["experts all say", "studies conclusively show", "authorities all agree"],
    bandwagon: ["everyone knows", "most people agree", "society has agreed"],
  };

  const detectedFallacies: string[] = [];
  const fallacyConfidences: Record<string, number> = {};
  const fallacyDescriptions: Record<string, string> = {};

  for (const [fallacy, keywords] of Object.entries(fallbackTriggerWords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        detectedFallacies.push(fallacy);
        fallacyConfidences[fallacy] = 0.65 + Math.random() * 0.2;
        fallacyDescriptions[fallacy] = `Potential ${fallacy.replace(/_/g, " ")} - consider an alternative approach`;
        break;
      }
    }
  }

  if (detectedFallacies.length === 0) {
    detectedFallacies.push("no_fallacy");
    fallacyConfidences.no_fallacy = 0.75 + Math.random() * 0.2;
    fallacyDescriptions.no_fallacy = "No clear logical fallacies detected";
  }

  const strength = Math.min(0.95, 0.4 + (wordCount / 50) * 0.5 + Math.random() * 0.2);
  const riskLevel = detectedFallacies.length > 0 && !detectedFallacies.includes("no_fallacy") 
    ? ["medium", "low"][Math.floor(Math.random() * 2)] 
    : "low";

  return {
    fallacy_detected: detectedFallacies,
    fallacy_confidences: fallacyConfidences,
    fallacy_descriptions: fallacyDescriptions,
    argument_strength: strength,
    coherence_score: Math.min(0.95, 0.5 + (wordCount / 30) * 0.4),
    evidence_score: 0.4 + Math.random() * 0.4,
    sentiment_score: 0.4 + Math.random() * 0.4,
    logical_score: 0.5 + Math.random() * 0.3,
    reputation_risk_level: riskLevel,
    reputation_risk_score: riskLevel === "low" ? 0.1 + Math.random() * 0.2 : 0.4 + Math.random() * 0.2,
    risk_factors: riskLevel !== "low" ? [
      "Some language may be perceived as overly assertive",
    ] : [],
    timestamp: new Date().toISOString(),
  };
}

function getMockCounterArgument(persona: string): string {
  const args = mockCounterArguments[persona] || mockCounterArguments.logical;
  return args[Math.floor(Math.random() * args.length)];
}

function generateMockQuickAnalysis(text: string, difficulty: string): QuickAnalysisResult {
  const issues: QuickAnalysisResult["issues"] = [];
  const suggestions: string[] = [];
  const lowerText = text.toLowerCase();
  const wordCount = text.trim().split(/\s+/).length;
  
  if (wordCount < 3) {
    return {
      issues: [],
      overall_score: 0.5,
      suggestions: ["Add more detail to get feedback"],
      risk_level: "low",
      is_healthy: true,
      timestamp: new Date().toISOString(),
    };
  }
  
  const fallacyKeywords: Record<string, string[]> = {
    ad_hominem: ["idiot", "stupid", "fool", "dumb", "ignorant moron", "idiot who"],
    strawman: ["so you're saying that", "what you mean is that", "essentially what"],
    false_dilemma: ["only two options", "either we", "you must choose"],
    slippery_slope: ["will inevitably lead", "must inevitably"],
    bandwagon: ["everyone knows", "most people agree"],
  };
  
  for (const [fallacy, keywords] of Object.entries(fallacyKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        issues.push({
          type: "fallacy",
          name: fallacy,
          confidence: 0.7,
          severity: "high"
        });
        if (difficulty !== "basic") {
          suggestions.push(`Avoid ${fallacy.replace("_", " ")} - try evidence-based reasoning`);
        }
        break;
      }
    }
  }
  
  if (difficulty === "advanced") {
    if (wordCount < 15) {
      suggestions.push("Add more supporting detail");
    }
    if (!/[,.!?]/.test(text)) {
      suggestions.push("Consider adding punctuation for clarity");
    }
  }
  
  if (difficulty !== "basic") {
    if (lowerText.includes("everyone") || lowerText.includes("everybody")) {
      suggestions.push("Avoid absolute terms - use specific examples");
    }
  }
  
  if (suggestions.length === 0) {
    suggestions.push("Your argument looks clear and logical");
  }
  
return {
    issues,
    overall_score: issues.length === 0 ? Math.min(0.9, 0.6 + (wordCount / 40) * 0.3) : 0.5,
    suggestions: suggestions.slice(0, 4),
    risk_level: issues.length > 0 ? "medium" : "low",
    is_healthy: issues.filter(i => i.severity === "high").length === 0,
    timestamp: new Date().toISOString(),
  };
}

let mockSessionId = 1000;
const mockSessions: Map<number, DebateSession> = new Map();
const mockArguments: Map<number, Argument[]> = new Map();

export const api = {
  isConnected: () => isBackendConnected,

  health: async (): Promise<HealthResponse> => {
    try {
      return await fetchJson<HealthResponse>(`${API_BASE}/health`);
    } catch {
      return {
        status: "demo",
        version: "1.0.0",
        services: {
          fallacy_detection: "demo_mode",
          argument_analysis: "demo_mode",
          reputation_risk: "demo_mode",
          debate_simulation: "demo_mode",
        },
      };
    }
  },

  getPersonas: async (): Promise<PersonaInfo[]> => {
    try {
      return await fetchJson<PersonaInfo[]>(`${API_BASE}/personas`);
    } catch {
      return mockPersonas;
    }
  },

  getFallacyTypes: async (): Promise<string[]> => {
    try {
      return await fetchJson<string[]>(`${API_BASE}/fallacy-types`);
    } catch {
      return [
        "ad_hominem",
        "strawman",
        "false_dilemma",
        "slippery_slope",
        "appeal_to_authority",
        "bandwagon",
        "circular_reasoning",
        "red_herring",
        "no_fallacy",
      ];
    }
  },

  analyze: async (text: string, context: string = ""): Promise<AnalysisResult> => {
    try {
      return await fetchJson<AnalysisResult>(`${API_BASE}/analyze`, {
        method: "POST",
        body: JSON.stringify({ text, context }),
      });
    } catch {
      return generateMockAnalysis(text);
    }
  },

  quickAnalyze: async (text: string, context: string = "", difficulty: string = "intermediate"): Promise<QuickAnalysisResult> => {
    // Always use mock in demo mode for consistent demo experience
    return generateMockQuickAnalysis(text, difficulty);
  },

  startDebate: async (topic: string, userStance: string, opponentPersona: string): Promise<DebateSession> => {
    try {
      return await fetchJson<DebateSession>(`${API_BASE}/debate/start`, {
        method: "POST",
        body: JSON.stringify({
          topic,
          user_stance: userStance,
          opponent_persona: opponentPersona,
        }),
      });
    } catch {
      const session: DebateSession = {
        id: ++mockSessionId,
        topic,
        user_stance: userStance,
        opponent_persona: opponentPersona,
        created_at: new Date().toISOString(),
      };
      mockSessions.set(session.id, session);
      mockArguments.set(session.id, []);
      return session;
    }
  },

  addArgument: async (sessionId: number, content: string): Promise<Argument> => {
    try {
      return await fetchJson<Argument>(`${API_BASE}/debate/argument`, {
        method: "POST",
        body: JSON.stringify({
          session_id: sessionId,
          content,
          is_from_user: true,
        }),
      });
    } catch {
      const arg: Argument = {
        id: Date.now(),
        session_id: sessionId,
        content,
        is_from_user: true,
        created_at: new Date().toISOString(),
      };
      const args = mockArguments.get(sessionId) || [];
      args.push(arg);
      mockArguments.set(sessionId, args);
      return arg;
    }
  },

  getCounterArgument: async (
    sessionId: number,
    userArgument: string,
    topic: string,
    userStance: string,
    persona: string
  ): Promise<{ counter_argument: string; session_id: number }> => {
    // Always use mock in demo mode for consistent experience
    const counter = getMockCounterArgument(persona);
    const arg: Argument = {
      id: Date.now() + 1,
      session_id: sessionId,
      content: counter,
      is_from_user: false,
      created_at: new Date().toISOString(),
    };
    const args = mockArguments.get(sessionId) || [];
    args.push(arg);
    mockArguments.set(sessionId, args);
    return { counter_argument: counter, session_id: sessionId };
  },

  getDebateHistory: async (sessionId: number) => {
    try {
      return await fetchJson<{
        session: DebateSession;
        arguments: Argument[];
        analysis: AnalysisResult[];
      }>(`${API_BASE}/debate/${sessionId}/history`);
    } catch {
      const session = mockSessions.get(sessionId);
      const args = mockArguments.get(sessionId) || [];
      return {
        session: session || {
          id: sessionId,
          topic: "Sample Debate Topic",
          user_stance: "support",
          opponent_persona: "logical",
          created_at: new Date().toISOString(),
        },
        arguments: args,
        analysis: args.map(a => generateMockAnalysis(a.content)),
      };
    }
  },

  endDebate: async (sessionId: number) => {
    try {
      return await fetchJson<{ message: string; session_id: number }>(
        `${API_BASE}/debate/${sessionId}/end`,
        {
          method: "POST",
        }
      );
    } catch {
      return { message: "Debate session ended", session_id: sessionId };
    }
  },

  scanCommunicationRisk: async (text: string, context: string = ""): Promise<RiskScanResult> => {
    try {
      return await fetchJson<RiskScanResult>(`${API_BASE}/analyze/risk`, {
        method: "POST",
        body: JSON.stringify({ text, context }),
      });
    } catch (e) {
      console.warn("Communication Risk Scan API failed, using mock fallback:", e);
      const textLower = text.toLowerCase();
      const risk_factors: string[] = [];
      let tone_score = 0.85;
      let factuality_score = 0.75;
      let sensitivity_score = 0.95;
      
      if (textLower.includes("stupid") || textLower.includes("idiot") || textLower.includes("dumb") || textLower.includes("shit") || textLower.includes("fuck")) {
        sensitivity_score = 0.3;
        risk_factors.push("Contains potential inflammatory or sensitive language");
      }
      if (textLower.includes("hate") || textLower.includes("suck") || textLower.includes("awful") || textLower.includes("terrible")) {
        tone_score = 0.45;
        risk_factors.push("Tone appears aggressive or overly negative");
      }
      if (textLower.length < 25) {
        factuality_score = 0.4;
        risk_factors.push("Lacks citations, evidence, or supporting data indicators");
      }
      
      const publish_safe_score = (tone_score * 0.3 + factuality_score * 0.3 + sensitivity_score * 0.4);
      const risk_level = publish_safe_score < 0.4 ? "high" : publish_safe_score < 0.7 ? "medium" : "low";
      
      // Simple rewrite
      let rewrite_suggestion = text;
      const replacements: Record<string, string> = {
        stupid: "uninformed",
        idiot: "incorrect",
        dumb: "flawed",
        hate: "disagree with",
        suck: "is unsatisfactory",
        shit: "issues",
        fuck: "disregard",
      };
      
      for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(key, "gi");
        rewrite_suggestion = rewrite_suggestion.replace(regex, value);
      }
      
      if (rewrite_suggestion === text) {
        if (!rewrite_suggestion.trim().endsWith(".")) {
          rewrite_suggestion += ".";
        }
        rewrite_suggestion = `Dear team, I suggest: ${rewrite_suggestion} Let me know your thoughts.`;
      }
      
      return {
        publish_safe_score: parseFloat(publish_safe_score.toFixed(3)),
        risk_level,
        tone_score,
        factuality_score,
        sensitivity_score,
        risk_factors,
        rewrite_suggestion,
        demo_mode: true,
        timestamp: new Date().toISOString(),
      };
    }
  },
};
