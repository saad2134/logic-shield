export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  token?: string;
}

const isServer = typeof window === 'undefined';
const BACKEND_URL = (!isServer && typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BACKEND_BASE_URL) 
  ? process.env.NEXT_PUBLIC_BACKEND_BASE_URL 
  : "http://localhost:8000/api/v1";

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        }),
      });

      const result = await response.json();
      console.log('Auth service login result:', response.status, result);
      
      if (response.ok && result.success) {
        if (result.token) {
          localStorage.setItem('auth_token', result.token);
          localStorage.setItem('user_data', JSON.stringify(result.user));
          if (result.user && result.user.id) {
            localStorage.setItem('user_id', result.user.id.toString());
          }
        }
        if (data.rememberMe) {
          localStorage.setItem('remember_email', data.email);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Unable to connect to server. Please try again.',
      };
    }
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        if (result.token) {
          localStorage.setItem('auth_token', result.token);
          localStorage.setItem('user_data', JSON.stringify(result.user));
          if (result.user && result.user.id) {
            localStorage.setItem('user_id', result.user.id.toString());
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: 'Unable to connect to server. Please try again.',
      };
    }
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_id');
      localStorage.removeItem('remember_email');
      localStorage.removeItem('onboarding_completed');
    }
  },

  getStoredEmail(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('remember_email') || '';
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  },

  getUser(): { id: number; name: string; email: string } | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }
};
