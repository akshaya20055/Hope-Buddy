"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext.tsx";
import { useLanguage } from "../../context/LanguageContext.tsx";
import { api } from "../../services/api.ts";
import { PenTool, Calendar, Trash2, Shield, Heart, Sparkles, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  detectedMood: string;
  createdAt: string;
}

export default function JournalPage() {
  const { user, loading, updateUserStats } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // State
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load user journals from backend
  useEffect(() => {
    if (user) {
      const fetchJournals = async () => {
        try {
          const res = await api.getJournals();
          if (res.success && res.data) {
            setJournals(res.data);
          }
        } catch (err) {
          console.error("Fetch journals failed:", err);
        }
      };
      fetchJournals();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || isSaving) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await api.createJournal({ title, content });
      if (res.success && res.data) {
        // Add to state
        setJournals(prev => [res.data, ...prev]);

        // Award +20 XP for journaling
        updateUserStats(20, user.xp + 20, Math.floor((user.xp + 20) / 100) + 1);

        // Check if "journal_master" badge just unlocked
        const hadBadge = user.achievements.some(a => a.badgeId === "journal_master");
        if (!hadBadge) {
          // Burst confetti!
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.7 }
          });
        }

        // Reset
        setTitle("");
        setContent("");
        setMessage("Reflection saved! Private sentiment logged.");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Create journal failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm("Are you sure you want to delete this diary entry forever?")) {
      try {
        const res = await api.deleteJournal(id);
        if (res.success) {
          setJournals(prev => prev.filter(j => j._id !== id));
        }
      } catch (err) {
        console.error("Delete journal failed:", err);
      }
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case "sad": return "😢";
      case "lonely": return "👤";
      case "anxious": return "😰";
      case "angry": return "😡";
      case "happy": return "☀️";
      default: return "🍃";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {/* Left Input panel (2 columns in desktop) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">{t.journal.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.journal.subtitle}</p>
        </div>

        {/* Security / Privacy reassurance banner */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <Shield className="w-4.5 h-4.5 shrink-0" />
          <span>Encrypted Database Isolation. Your reflections are completely invisible to other users.</span>
        </div>

        {/* Alert Msg */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20 text-sm font-semibold flex items-center gap-2"
            >
              <CheckCircle className="w-4.5 h-4.5" />
              <span>{message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Writing form */}
        <form onSubmit={handleSaveEntry} className="glass-panel p-6 rounded-3xl space-y-4 shadow-md">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.journal.newTitle}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Surviving exam pressures, reflection after loneliness..."
              className="w-full px-4 py-3.5 rounded-2xl glass-input text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Diary Entry Reflection
            </label>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.journal.newContent}
              className="w-full px-4 py-3.5 rounded-2xl glass-input text-sm resize-none focus:ring-0"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-4 bg-gradient-to-r from-primary-600 to-fuchsia-600 hover:from-primary-700 hover:to-fuchsia-700 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 hover-scale flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              t.journal.save
            )}
          </button>
        </form>
      </div>

      {/* Right List Sidebar (1 column) */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-500" />
          Previous reflections
        </h3>

        <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-2">
          {journals.length === 0 ? (
            <div className="text-center p-8 rounded-3xl glass-panel border text-slate-400 text-sm">
              {t.journal.noEntries}
            </div>
          ) : (
            journals.map((entry) => (
              <div
                key={entry._id}
                className="glass-panel p-5 rounded-2xl flex flex-col justify-between gap-4 border hover:border-primary-500/20 transition-all duration-300 shadow-sm relative group"
              >
                {/* Header indicators */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{entry.title}</h4>
                    <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                      {new Date(entry.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>

                  {/* Delete actions */}
                  <button
                    onClick={() => handleDeleteEntry(entry._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-medium">
                  {entry.content}
                </p>

                {/* Sentiment Indicators */}
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-100/50 dark:bg-white/5 border border-primary-200/20 w-fit text-[10px] font-extrabold uppercase tracking-wide">
                  <span className="text-xs">{getMoodEmoji(entry.detectedMood)}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {t.journal.detectedMood} {entry.detectedMood}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
