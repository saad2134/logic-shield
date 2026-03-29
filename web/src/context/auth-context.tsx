"use client";

import * as React from "react";
import { User, authApi } from "@/lib/api-app";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refreshUser = React.useCallback(async () => {
    try {
      console.log('Refreshing user...');
      const userData = await authApi.me();
      console.log('User data from API:', userData);
      if (userData) {
        setUser(userData);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user_data');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user_data');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }
    }
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    console.log('AuthContext: Logging in...');
    const result = await authApi.login(email, password);
    console.log('AuthContext: Login result:', result);
    if (result.user) {
      console.log('AuthContext: Setting user directly:', result.user);
      setUser(result.user);
    } else {
      console.log('AuthContext: No user in result, calling refreshUser');
      await refreshUser();
    }
  };

  const register = async (name: string, email: string, password: string) => {
    console.log('AuthContext: Registering...');
    const result = await authApi.register(name, email, password);
    console.log('AuthContext: Register result:', result);
    if (result.user) {
      console.log('AuthContext: Setting user directly:', result.user);
      setUser(result.user);
    } else {
      console.log('AuthContext: No user in result, calling refreshUser');
      await refreshUser();
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
