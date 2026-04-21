"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from "next-themes";
import { useState, createContext, useContext } from "react";
import { AuthProvider } from "./auth-context";

interface ThemeContextProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  );
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      storageKey="theme"
    >
      <ThemeContextProvider>{children}</ThemeContextProvider>
    </NextThemeProvider>
  );
}

function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useNextTheme();
  return (
    <ThemeContext.Provider value={{ theme: theme ?? "system", setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
