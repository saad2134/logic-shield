const isServer = typeof window === 'undefined';
const BACKEND_URL = (!isServer && typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BACKEND_BASE_URL) 
  ? process.env.NEXT_PUBLIC_BACKEND_BASE_URL 
  : "http://localhost:8000/api/v1";
const USE_API_PROXY = BACKEND_URL.startsWith('https://');
console.log('BACKEND_URL initialized:', BACKEND_URL, 'USE_API_PROXY:', USE_API_PROXY);

function getApiUrl(path: string): string {
  if (USE_API_PROXY) {
    return `/api${path}`;
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
  const fullUrl = url.startsWith('http') ? url : getApiUrl(url);
  console.log(`fetchApi URL: ${fullUrl}, token: ${token ? 'present' : 'NONE'}`);
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
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
    console.log('Login API result:', result);
    
    if (!response.ok || (!result.access_token && !result.success)) {
      throw new ApiError(response.status, result.detail || result.message || "Login failed");
    }

    const token = result.access_token || result.token;
    if (token) {
      console.log('Storing token:', token.substring(0, 20) + '...');
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
      body: JSON.stringify({ name, email, password }),
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
      const token = localStorage.getItem('auth_token');
      console.log('me() - token:', token ? 'present' : 'missing', 'USE_API_PROXY:', USE_API_PROXY);
      
      // Use X-Auth-Token header to work around CORS issues
      const response = await fetch(getApiUrl('/auth/me'), {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'X-Auth-Token': token } : {})
        },
      });

      if (!response.ok) {
        // Fallback: return user from localStorage if available
        const storedUser = localStorage.getItem('user_data');
        if (storedUser) {
          return JSON.parse(storedUser);
        }
        return null;
      }

      const user = await response.json();
      return user;
    } catch (err) {
      // Fallback: return user from localStorage if available
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

  startDebate: (topic: string, userStance: string, opponentPersona: string) =>
    fetchApi<DebateSession>(`/debate/start`, {
      method: "POST",
      body: JSON.stringify({
        topic,
        user_stance: userStance,
        opponent_persona: opponentPersona,
      }),
    }),

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

  getUserDebates: (limit: number = 10, offset: number = 0) =>
    fetchApi<{
      debates: DebateSession[];
      total: number;
    }>(`/user/debates?limit=${limit}&offset=${offset}`),

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

  submitOnboarding: async (data: {
    name: string;
    experience_level: string;
    goals: string[];
    interests: string[];
    debate_frequency: string;
    focus_areas: string[];
  }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    console.log('Submitting onboarding - token present:', !!token);
    
    // Use X-Auth-Token header to work around CORS issues
    const response = await fetch(`${BACKEND_URL}/user/onboarding`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Auth-Token': token || ''
      },
      body: JSON.stringify(data),
    });

    console.log('Submitting onboarding - response:', response.status);

    if (!response.ok) {
      throw new Error('Onboarding failed');
    }

    return response.json();
  },
};
