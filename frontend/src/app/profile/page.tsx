"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext.tsx";
import { useLanguage } from "../../context/LanguageContext.tsx";
import { api } from "../../services/api.ts";
import { User, Sparkles, Check, Heart, Trophy, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const { user, loading, updateAvatar, refreshUser } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();

  // Settings states
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "te">("en");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      setSelectedAvatar(user.avatar);
      setSelectedLanguage(language);
    }
  }, [user, loading, language, router]);

  if (loading || !user) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Pre-compiled avatar options
  const avatarOptions = [
    { id: "buddy_calm", emoji: "🍃", label: "Calm Guardian", desc: "Speaks softly and guides peaceful breathing." },
    { id: "buddy_happy", emoji: "☀️", label: "Sunny Motivator", desc: "Fires strong motivational stories and positivity." },
    { id: "buddy_warrior", emoji: "🛡️", label: "Resilient Warrior", desc: "Inspires deep grit with historical comeback tales." },
    { id: "buddy_funny", emoji: "⚡", label: "Playful Buddy", desc: "Tells harmless warm jokes to ease stress." }
  ];

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSuccessMsg(null);

    try {
      // 1. Update companion avatar
      const avatarRes = await updateAvatar(selectedAvatar);
      
      // 2. Update backend preferences
      const prefRes = await api.updatePreferences({ language: selectedLanguage });
      
      if (avatarRes && prefRes.success) {
        // Apply language locally
        setLanguage(selectedLanguage);
        await refreshUser();
        
        setSuccessMsg(t.settings.success);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error("Save settings failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight">{t.settings.title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t.settings.subtitle}</p>
      </div>

      {/* Profile Overview Card */}
      <div className="glass-panel p-6 rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center text-4xl animate-float">
            {selectedAvatar === "buddy_calm" ? "🍃" : 
             selectedAvatar === "buddy_happy" ? "☀️" : 
             selectedAvatar === "buddy_warrior" ? "🛡️" : "⚡"}
          </div>
          <div>
            <h3 className="font-extrabold text-lg leading-tight">{user.username}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{user.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-[10px] font-bold">
              Level {user.level} Companion
            </span>
          </div>
        </div>

        {/* Streak details */}
        <div className="text-right">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
            Active Streak
          </span>
          <span className="text-2xl font-black text-orange-500">{user.streak} Days</span>
        </div>
      </div>

      {/* Success alert message */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-semibold flex items-center gap-2"
          >
            <Check className="w-4.5 h-4.5" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Companion selection panels */}
      <div className="glass-panel p-8 rounded-3xl space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          {t.settings.avatarLabel}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {avatarOptions.map(option => {
            const isSelected = selectedAvatar === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setSelectedAvatar(option.id)}
                className={`p-4 rounded-2xl border flex items-center gap-4 transition-all duration-300 text-left cursor-pointer ${
                  isSelected
                    ? "bg-primary-500/10 border-primary-500/30 text-primary-600 dark:text-primary-400 scale-[1.02]"
                    : "glass-panel hover:border-primary-500/20"
                }`}
              >
                <span className="text-4xl shrink-0 animate-float">{option.emoji}</span>
                <div>
                  <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                    {option.label}
                    {isSelected && <Check className="w-4 h-4 text-primary-500" />}
                  </h4>
                  <p className="text-xs text-slate-400 leading-normal mt-0.5">{option.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Language / Preference select configs */}
      <div className="glass-panel p-8 rounded-3xl space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <User className="w-5 h-5 text-fuchsia-500" />
          General Preferences
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              {t.settings.langLabel}
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as "en" | "te")}
              className="w-full px-4 py-3.5 rounded-2xl glass-input text-sm focus:outline-none dark:bg-slate-900 font-medium"
            >
              <option value="en">English (Bilingual Standard)</option>
              <option value="te">తెలుగు (Telugu Interface)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions footer */}
      <button
        onClick={handleSaveSettings}
        disabled={isSaving}
        className="px-8 py-4 bg-gradient-to-r from-primary-600 to-fuchsia-600 hover:from-primary-700 hover:to-fuchsia-700 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 hover-scale flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {isSaving ? (
          <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : (
          t.settings.save
        )}
      </button>
    </div>
  );
}
