const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface User {
  id: number;
  email: string;
  name?: string;
  full_name?: string;
  username?: string;
  bio?: string;
  occupation?: string;
  interests?: string;
  experience_level?: string;
  created_at: string;
}

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
  risk_factors: Array<{
    factor: string;
    severity: string;
    description: string;
  }>;
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  services: Record<string, string>;
}

export interface UserStats {
  total_debates: number;
  total_arguments: number;
  avg_argument_strength: number;
  fallacy_count: number;
  current_streak: number;
  win_rate: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earned_at?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(response.status, error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

const AUTH_BASE = "/api/auth";

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${AUTH_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new ApiError(response.status, result.message || "Login failed");
    }

    if (result.token) {
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user_data', JSON.stringify(result.user));
      if (result.user?.id) {
        localStorage.setItem('user_id', result.user.id.toString());
      }
    }

    return result;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await fetch(`${AUTH_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
      credentials: "include",
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new ApiError(response.status, result.message || "Registration failed");
    }

    if (result.token) {
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user_data', JSON.stringify(result.user));
      if (result.user?.id) {
        localStorage.setItem('user_id', result.user.id.toString());
      }
    }

    return result;
  },

  logout: async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_id');
    localStorage.removeItem('remember_email');
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  },

  me: async () => {
    try {
      return await fetchApi<User>(`${API_BASE}/auth/me`);
    } catch {
      return null;
    }
  },
};

export const api = {
  health: () => fetchApi<HealthResponse>(`${API_BASE}/health`),

  getPersonas: () => fetchApi<PersonaInfo[]>(`${API_BASE}/personas`),

  getFallacyTypes: () => fetchApi<string[]>(`${API_BASE}/fallacy-types`),

  analyze: (text: string, context: string = "") =>
    fetchApi<AnalysisResult>(`${API_BASE}/analyze`, {
      method: "POST",
      body: JSON.stringify({ text, context }),
    }),

  startDebate: (topic: string, userStance: string, opponentPersona: string) =>
    fetchApi<DebateSession>(`${API_BASE}/debate/start`, {
      method: "POST",
      body: JSON.stringify({
        topic,
        user_stance: userStance,
        opponent_persona: opponentPersona,
      }),
    }),

  addArgument: (sessionId: number, content: string) =>
    fetchApi<Argument>(`${API_BASE}/debate/argument`, {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId,
        content,
        is_from_user: true,
      }),
    }),

  getCounterArgument: (
    sessionId: number,
    userArgument: string,
    topic: string,
    userStance: string,
    persona: string
  ) =>
    fetchApi<{ counter_argument: string; session_id: number }>(
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
    ),

  getDebateHistory: (sessionId: number) =>
    fetchApi<{
      session: DebateSession;
      arguments: Argument[];
      analysis: AnalysisResult[];
    }>(`${API_BASE}/debate/${sessionId}/history`),

  endDebate: (sessionId: number) =>
    fetchApi<{ message: string; session_id: number }>(
      `${API_BASE}/debate/${sessionId}/end`,
      {
        method: "POST",
      }
    ),

  getUserDebates: (limit: number = 10, offset: number = 0) =>
    fetchApi<{
      debates: DebateSession[];
      total: number;
    }>(`${API_BASE}/user/debates?limit=${limit}&offset=${offset}`),

  getUserStats: () => fetchApi<UserStats>(`${API_BASE}/user/stats`),

  getUserAchievements: () => fetchApi<Achievement[]>(`${API_BASE}/user/achievements`),

  updateProfile: (data: Partial<User>) =>
    fetchApi<User>(`${API_BASE}/user/profile`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateSettings: (settings: Record<string, unknown>) =>
    fetchApi<{ message: string }>(`${API_BASE}/user/settings`, {
      method: "PATCH",
      body: JSON.stringify(settings),
    }),

  submitOnboarding: (data: {
    name: string;
    experience_level: string;
    goals: string[];
    interests: string[];
    debate_frequency: string;
    focus_areas: string[];
  }) =>
    fetchApi<{ message: string }>(`${API_BASE}/user/onboarding`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
