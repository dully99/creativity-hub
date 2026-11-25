"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authService, User, LoginCredentials } from "@/lib/api/auth.service";
import { getHomePathForUser } from "@/lib/auth-roles";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithJamiiPass: () => Promise<void>;
  completePasswordReset: (payload: {
    email: string;
    token: string;
    new_password: string;
    confirm_password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchRole: (role: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user);
      router.push(getHomePathForUser(response.user));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithJamiiPass = async () => {
    try {
      setIsLoading(true);
      await authService.loginWithJamiiPass();
    } catch (error) {
      console.error("JamiiPass login failed:", error);
      setIsLoading(false);
      throw error;
    }
  };

  const completePasswordReset = async (payload: {
    email: string;
    token: string;
    new_password: string;
    confirm_password: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await authService.resetPasswordWithToken(payload);
      setUser(response.user);
      router.push(getHomePathForUser(response.user));
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
    }
  };

  const switchRole = (role: string) => {
    const updated = authService.switchActiveRole(role);
    setUser(updated);
    router.push(getHomePathForUser(updated));
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithJamiiPass,
    completePasswordReset,
    logout,
    refreshUser,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
