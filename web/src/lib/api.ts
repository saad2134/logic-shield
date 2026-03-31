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
    "While that's a valid point, have you considered the empirical evidence from multiple studies?",
    "Your argument relies on a single source. Can you provide more comprehensive data?",
    "The logical structure of your argument has a gap. Let me explain...",
  ],
  aggressive: [
    "That's just wrong! The opposite is clearly true based on common sense.",
    "Are you serious? That's one of the most flawed arguments I've heard.",
    "You're ignoring the obvious facts here. Wake up!",
  ],
  skeptical: [
    "How do you know that's true? What evidence supports this claim?",
    "That seems like a big assumption. Can you verify this?",
    "I'm not convinced. Show me the proof.",
  ],
  devil_advocate: [
    "Interesting perspective, but what if the complete opposite were true?",
    "You're missing a critical flaw: what about the extreme counterexamples?",
    "That's naive. The real world is much more complicated than that.",
  ],
};

function generateMockAnalysis(text: string): AnalysisResult {
  const lowerText = text.toLowerCase();
  const fallacyKeywords: Record<string, string[]> = {
    ad_hominem: ["idiot", "stupid", "fool", "dumb", "ignorant"],
    strawman: ["so you're saying", "what you mean is", "essentially"],
    false_dilemma: ["only two options", "either or", "you must"],
    slippery_slope: ["will lead to", "inevitably", "end up"],
    appeal_to_authority: ["experts say", "studies show", "according to"],
    bandwagon: ["everyone knows", "most people", "obviously"],
  };

  const detectedFallacies: string[] = [];
  const fallacyConfidences: Record<string, number> = {};
  const fallacyDescriptions: Record<string, string> = {};

  for (const [fallacy, keywords] of Object.entries(fallacyKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        detectedFallacies.push(fallacy);
        fallacyConfidences[fallacy] = 0.7 + Math.random() * 0.25;
        fallacyDescriptions[fallacy] = `Detected potential ${fallacy.replace("_", " ")} based on keyword analysis`;
        break;
      }
    }
  }

  if (detectedFallacies.length === 0) {
    detectedFallacies.push("no_fallacy");
    fallacyConfidences.no_fallacy = 0.85;
    fallacyDescriptions.no_fallacy = "No significant logical fallacies detected in your argument";
  }

  const strength = 0.5 + Math.random() * 0.4;
  const riskLevel = ["low", "medium", "high", "critical"][Math.floor(Math.random() * 3)];

  return {
    fallacy_detected: detectedFallacies,
    fallacy_confidences: fallacyConfidences,
    fallacy_descriptions: fallacyDescriptions,
    argument_strength: strength,
    coherence_score: 0.6 + Math.random() * 0.35,
    evidence_score: 0.5 + Math.random() * 0.4,
    sentiment_score: 0.4 + Math.random() * 0.5,
    logical_score: 0.55 + Math.random() * 0.4,
    reputation_risk_level: riskLevel,
    reputation_risk_score: riskLevel === "low" ? 0.1 + Math.random() * 0.2 :
                          riskLevel === "medium" ? 0.3 + Math.random() * 0.2 :
                          riskLevel === "high" ? 0.5 + Math.random() * 0.3 : 0.7 + Math.random() * 0.3,
    risk_factors: riskLevel !== "low" ? [
      "The argument contains language that may be perceived as confrontational",
    ] : [],
    timestamp: new Date().toISOString(),
  };
}

function getMockCounterArgument(persona: string): string {
  const args = mockCounterArguments[persona] || mockCounterArguments.logical;
  return args[Math.floor(Math.random() * args.length)];
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
    try {
      return await fetchJson<{ counter_argument: string; session_id: number }>(
        `${API_BASE}/debate/counter`,
        {
          method: "POST",
          body: JSON.stringify({
            session_id: sessionId,
            user_argument: userArgument,
            topic,
            user_stance: userStance,
            persona,
          }),
        }
      );
    } catch {
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
    }
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
};
