"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface User {
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const ACCOUNTS: { email: string; password: string; name: string; role: string }[] = [
  {
    email: "shivjishayan@gmail.com",
    password: "Shayan1!",
    name: "Shayan Shivji",
    role: "Managing Partner",
  },
  {
    email: "jim@trestcapital.com",
    password: "TrestCap1!",
    name: "Jim",
    role: "Managing Partner",
  },
];

const STORAGE_KEY = "pe-crm-auth";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const account = ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (!account) {
      return { success: false, error: "Invalid email or password" };
    }
    const u: User = { email: account.email, name: account.name, role: account.role };
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
