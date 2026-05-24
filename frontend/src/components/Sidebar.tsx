"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext.tsx";
import { useAuth } from "../context/AuthContext.tsx";
import {
  LayoutDashboard,
  MessageCircle,
  BookOpenText,
  PenTool,
  BarChart3,
  User,
  Bell,
  HelpCircle,
  LogOut,
  Sparkles,
  HeartHandshake
} from "lucide-react";
import { motion } from "framer-motion";

export const Sidebar = () => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: t.nav.dashboard, icon: LayoutDashboard, path: "/dashboard" },
    { name: t.nav.chat, icon: MessageCircle, path: "/chat" },
    { name: t.nav.stories, icon: BookOpenText, path: "/stories" },
    { name: t.nav.journal, icon: PenTool, path: "/journal" },
    { name: t.nav.analytics, icon: BarChart3, path: "/analytics" },
    { name: t.nav.profile, icon: User, path: "/profile" },
    { name: t.nav.notifications, icon: Bell, path: "/notifications" },
    { name: t.nav.help, icon: HelpCircle, path: "/help" }
  ];

  if (!user) return null;

  // Render proper companion avatar description based on username preferences
  const getAvatarEmoji = (avatarName: string) => {
    switch (avatarName) {
      case "buddy_calm": return "🍃";
      case "buddy_happy": return "☀️";
      case "buddy_warrior": return "🛡️";
      case "buddy_funny": return "⚡";
      default: return "🤝";
    }
  };

  return (
    <aside className="w-64 fixed inset-y-0 left-0 hidden md:flex flex-col glass-panel border-r shadow-xl z-20 transition-all duration-300">
      {/* App Logo branding */}
      <div className="p-6 border-b border-primary-100 dark:border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-fuchsia-500 flex items-center justify-center shadow-lg">
          <HeartHandshake className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wide bg-gradient-to-r from-primary-600 to-fuchsia-500 bg-clip-text text-transparent">
            HopeBuddy AI
          </h1>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
            Your Companion
          </span>
        </div>
      </div>

      {/* Buddy Companion Interactive Info panel */}
      <div className="mx-4 my-4 p-4 rounded-2xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100/50 dark:border-white/5 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center text-2xl shadow-inner animate-float">
          {getAvatarEmoji(user.avatar)}
        </div>
        <div className="overflow-hidden">
          <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wide">
            Companion Status
          </h4>
          <p className="text-sm font-bold text-primary-600 dark:text-primary-400 truncate">
            {user.avatar === "buddy_calm" ? "Calm Guardian" : 
             user.avatar === "buddy_happy" ? "Sunny Motivator" : 
             user.avatar === "buddy_warrior" ? "Resilient Warrior" : "Playful Buddy"}
          </p>
        </div>
      </div>

      {/* Nav list */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} className="block">
              <span className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 relative group overflow-hidden ${
                isActive 
                  ? "text-primary-600 dark:text-primary-300 bg-primary-100/40 dark:bg-primary-900/30" 
                  : "text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-primary-50/50 dark:hover:bg-white/5"
              }`}>
                {/* Glow pill behind active index */}
                {isActive && (
                  <motion.div
                    layoutId="active-nav-glow"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-600 to-fuchsia-500 rounded-r-md"
                  />
                )}
                <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-400"
                }`} />
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile logout actions */}
      <div className="p-4 border-t border-primary-100 dark:border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          {t.nav.logout}
        </button>
      </div>
    </aside>
  );
};
