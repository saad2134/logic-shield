const isServer = typeof window === 'undefined';
const BACKEND_URL = (!isServer && typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BACKEND_BASE_URL) 
  ? process.env.NEXT_PUBLIC_BACKEND_BASE_URL 
  : "http://localhost:8000/api/v1";
const USE_API_PROXY = BACKEND_URL.startsWith('https://');
console.log('BACKEND_URL initialized:', BACKEND_URL, 'USE_API_PROXY:', USE_API_PROXY);

function getApiUrl(path: string): string {
  if (USE_API_PROXY) {
    return `/api/v1${path}`;
  }
  return `${BACKEND_URL}${path}`;
}
const API_BASE = "";

export interface User {
  id: number;
  email: string;
  full_name?: string;
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
  risk_factors: string[];
  timestamp: string;
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
  logical_reasoning?: number;
  argument_construction?: number;
  evidence_usage?: number;
  fallacy_detection?: number;
  reputation_management?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earned_at?: string;
}

export interface ArgumentNode {
  id: string;
  text: string;
  text_full?: string;
  type: string;
  strength: number;
  issues: string[];
}

export interface ArgumentEdge {
  source: string;
  target: string;
  label: string;
}

export interface ArgumentVisualization {
  nodes: ArgumentNode[];
  edges: ArgumentEdge[];
  summary: string;
  overall_strength: number;
  weak_links: string[];
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
  const fullUrl = url.startsWith('http') ? url : getApiUrl(url);
  
const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(userId ? { "X-User-ID": userId } : {}),
    ...options?.headers,
  };

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(response.status, error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(getApiUrl('/auth/login'), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    
    if (!response.ok || (!result.access_token && !result.success)) {
      throw new ApiError(response.status, result.detail || result.message || "Login failed");
    }

    const token = result.access_token || result.token;
    if (token) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(result.user));
      if (result.user?.id) {
        localStorage.setItem('user_id', result.user.id.toString());
      }
    }

    return { success: true, token, user: result.user };
  },

  register: async (name: string, email: string, password: string) => {
    const response = await fetch(getApiUrl('/auth/register'), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: name, email, password }),
    });

    const result = await response.json();
    
    if (!response.ok || (!result.access_token && !result.success)) {
      throw new ApiError(response.status, result.detail || result.message || "Registration failed");
    }

    const token = result.access_token || result.token;
    if (token) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(result.user));
      if (result.user?.id) {
        localStorage.setItem('user_id', result.user.id.toString());
      }
    }

    return { success: true, token, user: result.user };
  },

  logout: async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_id');
    localStorage.removeItem('remember_email');
    await fetch(getApiUrl('/auth/logout'), {
      method: "POST",
      credentials: "include",
    });
  },

  me: async () => {
    if (typeof window === 'undefined') return null;
    try {
      const userId = localStorage.getItem('user_id');
      const response = await fetch(getApiUrl('/auth/me'), {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          ...(userId ? { 'X-User-ID': userId } : {})
        },
      });

      if (!response.ok) {
        const storedUser = localStorage.getItem('user_data');
        if (storedUser) {
          return JSON.parse(storedUser);
        }
        return null;
      }

      const userData = await response.json();
      localStorage.setItem('user_data', JSON.stringify(userData));
      return userData;
    } catch (err) {
      const storedUser = localStorage.getItem('user_data');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      return null;
    }
  },
};

export const api = {
  health: () => fetchApi<HealthResponse>(`/health`),

  getPersonas: () => fetchApi<PersonaInfo[]>(`/personas`),

  getFallacyTypes: () => fetchApi<string[]>(`/fallacy-types`),

  analyze: (text: string, context: string = "") =>
    fetchApi<AnalysisResult>(`/analyze`, {
      method: "POST",
      body: JSON.stringify({ text, context }),
    }),

  quickAnalyze: (text: string, context: string = "", difficulty: string = "intermediate") =>
    fetchApi<QuickAnalysisResult>(`/analyze/quick`, {
      method: "POST",
      body: JSON.stringify({ text, context, difficulty }),
    }),

  visualizeArgument: (text: string, context: string = "") =>
    fetchApi<ArgumentVisualization>(`/visualize/argument`, {
      method: "POST",
      body: JSON.stringify({ text, context }),
    }),

  startDebate: (topic: string, userStance: string, opponentPersona: string) => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    return fetchApi<DebateSession>(`/debate/start`, {
      method: "POST",
      body: JSON.stringify({
        topic,
        user_stance: userStance,
        opponent_persona: opponentPersona,
        user_id: userId ? parseInt(userId) : null,
      }),
    });
  },

  addArgument: (sessionId: number, content: string) =>
    fetchApi<Argument>(`/debate/argument`, {
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
      `/debate/counter`,
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
    }>(`/debate/${sessionId}/history`),

  endDebate: (sessionId: number) =>
    fetchApi<{ message: string; session_id: number }>(
      `/debate/${sessionId}/end`,
      {
        method: "POST",
      }
    ),

  deleteDebate: (sessionId: number) =>
    fetchApi<{ message: string; session_id: number }>(
      `/debate/${sessionId}`,
      {
        method: "DELETE",
      }
    ),

  getUserDebates: (limit: number = 10, offset: number = 0, sortBy: string = "latest", userStance?: string, opponentPersona?: string) => {
    let url = `/user/debates?limit=${limit}&offset=${offset}&sort_by=${sortBy}`;
    if (userStance) url += `&user_stance=${userStance}`;
    if (opponentPersona) url += `&opponent_persona=${opponentPersona}`;
    return fetchApi<{
      debates: DebateSession[];
      total: number;
    }>(url);
  },

  getUserStats: () => fetchApi<UserStats>(`/user/stats`),

  getUserAchievements: () => fetchApi<Achievement[]>(`/user/achievements`),

  updateProfile: (data: Partial<User>) =>
    fetchApi<User>(`/user/profile`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateSettings: (settings: Record<string, unknown>) =>
    fetchApi<{ message: string }>(`/user/settings`, {
      method: "PATCH",
      body: JSON.stringify(settings),
    }),

  getSettings: () => fetchApi<Record<string, unknown>>(`/user/settings`),

  submitOnboarding: async (data: {
    name: string;
    experience_level: string;
    goals: string[];
    interests: string[];
    debate_frequency: string;
    focus_areas: string[];
  }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    console.log('Submitting onboarding - token present:', !!token, 'userId present:', !!userId);
    
    // Use X-Auth-Token header to work around CORS issues
    const response = await fetch(`${BACKEND_URL}/user/onboarding`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'X-Auth-Token': token || '',
        ...(userId ? { 'X-User-ID': userId } : {})
      },
      body: JSON.stringify(data),
    });

    console.log('Submitting onboarding - response:', response.status);

    if (!response.ok) {
      throw new Error('Onboarding failed');
    }

    return response.json();
  },

  exportData: () => fetchApi<string>(`/user/export`),

  deleteAccount: () => fetchApi<{ message: string }>(`/user/account`, {
    method: "DELETE",
  }),

  scanCommunicationRisk: (text: string, context: string = "") =>
    fetchApi<RiskScanResult>(`/analyze/risk`, {
      method: "POST",
      body: JSON.stringify({ text, context }),
    }),
};
