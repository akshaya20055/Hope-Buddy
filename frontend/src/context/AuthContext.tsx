"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../services/api.ts";

export interface UserType {
  id: string;
  username: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  achievements: { badgeId: string; unlockedAt: string }[];
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUserStats: (xpGained: number, totalXp: number, level: number, badgeUnlocked?: any) => void;
  refreshUser: () => Promise<void>;
  updateAvatar: (avatar: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("hopebuddy-token");
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser({
              id: res.user._id,
              username: res.user.username,
              email: res.user.email,
              avatar: res.user.avatar,
              level: res.user.level,
              xp: res.user.xp,
              streak: res.user.streak,
              achievements: res.user.achievements
            });
          } else {
            // Token expired or invalid
            localStorage.removeItem("hopebuddy-token");
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          console.error("Init auth failed:", err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem("hopebuddy-token", res.token);
        setToken(res.token);
        setUser(res.user);
        router.push("/dashboard");
        return { success: true };
      }
      return { success: false, message: res.message || "Invalid credentials" };
    } catch (err: any) {
      return { success: false, message: err.message || "An error occurred during login" };
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      const res = await api.signup({ username, email, password });
      if (res.success && res.token) {
        localStorage.setItem("hopebuddy-token", res.token);
        setToken(res.token);
        setUser(res.user);
        router.push("/dashboard");
        return { success: true };
      }
      return { success: false, message: res.message || "Signup failed" };
    } catch (err: any) {
      return { success: false, message: err.message || "An error occurred during registration" };
    }
  };

  const logout = () => {
    localStorage.removeItem("hopebuddy-token");
    setToken(null);
    setUser(null);
    router.push("/");
  };

  const updateUserStats = (xpGained: number, totalXp: number, level: number, badgeUnlocked?: any) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      const updatedAchievements = [...prev.achievements];
      if (badgeUnlocked) {
        const alreadyExists = updatedAchievements.some(a => a.badgeId === badgeUnlocked.badgeId);
        if (!alreadyExists) {
          updatedAchievements.push({
            badgeId: badgeUnlocked.badgeId,
            unlockedAt: new Date().toISOString()
          });
        }
      }
      return {
        ...prev,
        xp: totalXp,
        level,
        achievements: updatedAchievements
      };
    });
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser({
          id: res.user._id,
          username: res.user.username,
          email: res.user.email,
          avatar: res.user.avatar,
          level: res.user.level,
          xp: res.user.xp,
          streak: res.user.streak,
          achievements: res.user.achievements
        });
      }
    } catch (err) {
      console.error("Refresh user profile failed:", err);
    }
  };

  const updateAvatar = async (avatar: string): Promise<boolean> => {
    try {
      const res = await api.updateAvatar(avatar);
      if (res.success) {
        await refreshUser();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Update avatar request failed:", err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, signup, logout, updateUserStats, refreshUser, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
