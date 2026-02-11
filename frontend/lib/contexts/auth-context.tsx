"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { User, UserRole, AuthState } from "@/types";
import { mockUsers } from "@/data/mock/users";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;  // For demo purposes
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("campuschain_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find user by email (demo - in production, this would be a real auth check)
    const user = Object.values(mockUsers).find(u => u.email === email);

    if (user) {
      localStorage.setItem("campuschain_user", JSON.stringify(user));
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }

    setState(prev => ({ ...prev, isLoading: false }));
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("campuschain_user");
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  // For demo: switch between roles without logging in
  const switchRole = useCallback((role: UserRole) => {
    const user = mockUsers[role];
    if (user) {
      localStorage.setItem("campuschain_user", JSON.stringify(user));
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    }
  }, []);

  const setUser = useCallback((user: User) => {
    localStorage.setItem("campuschain_user", JSON.stringify(user));
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        switchRole,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
