"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { useLanguage } from "../context/LanguageContext.tsx";
import { useTheme } from "../context/ThemeContext.tsx";
import { Globe, Sun, Moon, Flame, Trophy, Menu, X, HeartHandshake, LogOut } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculate percentage of progress in current level
  // Each level is 100 XP
  const xpInCurrentLevel = user ? user.xp % 100 : 0;

  return (
    <nav className="fixed top-0 inset-x-0 h-16 glass-panel border-b z-30 flex items-center justify-between px-6 shadow-md transition-all duration-300">
      {/* Brand title for mobile */}
      <div className="flex items-center gap-3">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-fuchsia-500 flex items-center justify-center md:hidden">
            <HeartHandshake className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-md tracking-wider bg-gradient-to-r from-primary-600 to-fuchsia-500 bg-clip-text text-transparent md:hidden">
            HopeBuddy AI
          </span>
        </Link>
      </div>

      {/* Right panel settings & statistics */}
      <div className="flex items-center gap-4">
        {user && (
          <>
            {/* Gamification Streak counters */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-bold text-xs">
              <Flame className="w-4 h-4 animate-bounce" />
              <span>
                {user.streak} {t.dashboard.streak}
              </span>
            </div>

            {/* Gamification Level counters */}
            <div className="hidden sm:flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                <span>Level {user.level}</span>
              </div>
              <div className="w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${xpInCurrentLevel}%` }}
                />
              </div>
            </div>
          </>
        )}

        {/* Translation toggles */}
        <button
          onClick={() => setLanguage(language === "en" ? "te" : "en")}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 transition-all duration-300 relative group"
          title="Toggle Language"
        >
          <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-primary-600 text-white px-1 rounded-sm uppercase">
            {language}
          </span>
        </button>

        {/* Theme mode switches */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 transition-all duration-300 group"
          title="Toggle Theme"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-indigo-500 group-hover:-rotate-12 transition-transform" />
          ) : (
            <Sun className="w-5 h-5 text-amber-400 group-hover:spin-slow transition-transform" />
          )}
        </button>

        {/* Mobile menu trigger */}
        {user && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 transition-all duration-300 md:hidden"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Mobile drop down menu drawer */}
      <AnimatePresence>
        {mobileMenuOpen && user && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 inset-x-0 glass-panel border-b p-6 shadow-2xl md:hidden z-20 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary-50 dark:bg-white/5 border border-primary-100/50 dark:border-white/5">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-lg shadow-inner">
                {user.avatar === "buddy_calm" ? "🍃" : 
                 user.avatar === "buddy_happy" ? "☀️" : 
                 user.avatar === "buddy_warrior" ? "🛡️" : "⚡"}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">{user.username}</h4>
                <p className="text-xs text-primary-500 font-semibold">Level {user.level} • {user.xp} XP</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <span className="flex items-center justify-center py-3 rounded-xl bg-primary-50/50 dark:bg-white/5 text-xs font-semibold hover:bg-primary-50 dark:hover:bg-white/10 transition-all">
                  {t.nav.dashboard}
                </span>
              </Link>
              <Link href="/chat" onClick={() => setMobileMenuOpen(false)}>
                <span className="flex items-center justify-center py-3 rounded-xl bg-primary-50/50 dark:bg-white/5 text-xs font-semibold hover:bg-primary-50 dark:hover:bg-white/10 transition-all">
                  {t.nav.chat}
                </span>
              </Link>
              <Link href="/stories" onClick={() => setMobileMenuOpen(false)}>
                <span className="flex items-center justify-center py-3 rounded-xl bg-primary-50/50 dark:bg-white/5 text-xs font-semibold hover:bg-primary-50 dark:hover:bg-white/10 transition-all">
                  {t.nav.stories}
                </span>
              </Link>
              <Link href="/journal" onClick={() => setMobileMenuOpen(false)}>
                <span className="flex items-center justify-center py-3 rounded-xl bg-primary-50/50 dark:bg-white/5 text-xs font-semibold hover:bg-primary-50 dark:hover:bg-white/10 transition-all">
                  {t.nav.journal}
                </span>
              </Link>
              <Link href="/analytics" onClick={() => setMobileMenuOpen(false)}>
                <span className="flex items-center justify-center py-3 rounded-xl bg-primary-50/50 dark:bg-white/5 text-xs font-semibold hover:bg-primary-50 dark:hover:bg-white/10 transition-all">
                  {t.nav.analytics}
                </span>
              </Link>
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                <span className="flex items-center justify-center py-3 rounded-xl bg-primary-50/50 dark:bg-white/5 text-xs font-semibold hover:bg-primary-50 dark:hover:bg-white/10 transition-all">
                  {t.nav.profile}
                </span>
              </Link>
              <Link href="/notifications" onClick={() => setMobileMenuOpen(false)}>
                <span className="flex items-center justify-center py-3 rounded-xl bg-primary-50/50 dark:bg-white/5 text-xs font-semibold hover:bg-primary-50 dark:hover:bg-white/10 transition-all col-span-2">
                  {t.nav.notifications}
                </span>
              </Link>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              {t.nav.logout}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
