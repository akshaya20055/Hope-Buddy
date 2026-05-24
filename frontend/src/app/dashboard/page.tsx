"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext.tsx";
import { useLanguage } from "../../context/LanguageContext.tsx";
import { api } from "../../services/api.ts";
import { Flame, Trophy, Award, CheckSquare, Sparkles, Smile, MessageCircle, PenTool, BarChart3, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function DashboardPage() {
  const { user, loading, updateUserStats } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();

  // Mood Tracker State
  const [selectedMood, setSelectedMood] = useState<string>("sad");
  const [intensity, setIntensity] = useState<number>(5);
  const [note, setNote] = useState<string>("");
  const [moodSavedMsg, setMoodSavedMsg] = useState<string | null>(null);
  
  // Custom Affirmations based on language state
  const affirmations = language === "te" ? [
    "నువ్వు చాలా ప్రత్యేకమైన వ్యక్తివి. నిన్ను నువ్వు తక్కువ అంచనా వేసుకోకు.",
    "కష్టాలు శాశ్వతం కాదు, ప్రయత్నం ఆపకు. విజయం నీదే!",
    "ప్రతి ఉదయం ఒక కొత్త అవకాశం. ఈ రోజును సంతోషంగా గడుపు.",
    "నీ వెనుక ఉన్న శక్తి కంటే నీ ముందరి లక్ష్యం చాలా గొప్పది.",
    "సహనం వహించు, అంతా మంచే జరుగుతుంది."
  ] : [
    "You are capable of overcoming any obstacle life puts in front of you.",
    "Your feelings are completely valid. Give yourself permission to rest.",
    "One small exam or setback cannot define your beautiful future.",
    "Breathe. You are safe. You are strong. You are enough.",
    "Struggles are just growing roots. Your time to bloom will come."
  ];

  const [activeQuote, setActiveQuote] = useState(affirmations[0]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Choose active quote randomly
    const randomQuote = affirmations[Math.floor(Math.random() * affirmations.length)];
    setActiveQuote(randomQuote);
  }, [language]);

  if (loading || !user) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleMoodSubmit = async () => {
    try {
      const res = await api.logMood({ mood: selectedMood, intensity, note });
      if (res.success) {
        setMoodSavedMsg(t.dashboard.moodSaved);
        // Reward 15 XP for logging mood
        updateUserStats(15, user.xp + 15, Math.floor((user.xp + 15) / 100) + 1);
        
        // Trigger celebratory confetti!
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 }
        });

        // Reset notes and flash alert message
        setNote("");
        setTimeout(() => setMoodSavedMsg(null), 4000);
      }
    } catch (err) {
      console.error("Log mood failed:", err);
    }
  };

  const dashboardMoods = [
    { id: "sad", label: t.dashboard.moods.sad, icon: "😢", color: "from-blue-500/10 to-indigo-500/10 text-indigo-500" },
    { id: "lonely", label: t.dashboard.moods.lonely, icon: "👤", color: "from-cyan-500/10 to-blue-500/10 text-cyan-500" },
    { id: "angry", label: t.dashboard.moods.angry, icon: "😡", color: "from-red-500/10 to-orange-500/10 text-red-500" },
    { id: "stressed", label: t.dashboard.moods.stressed, icon: "😫", color: "from-purple-500/10 to-fuchsia-500/10 text-purple-500" },
    { id: "overthinking", label: t.dashboard.moods.overthinking, icon: "🤯", color: "from-violet-500/10 to-purple-500/10 text-violet-500" },
    { id: "anxiety", label: t.dashboard.moods.anxiety, icon: "😰", color: "from-amber-500/10 to-yellow-500/10 text-amber-500" },
    { id: "motivation_loss", label: t.dashboard.moods.motivation_loss, icon: "🔋", color: "from-pink-500/10 to-rose-500/10 text-pink-500" },
    { id: "study", label: t.dashboard.moods.study, icon: "📚", color: "from-emerald-500/10 to-teal-500/10 text-emerald-500" }
  ];

  return (
    <div className="space-y-8">
      {/* Header welcome banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-3xl glass-panel relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl" />
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">
            {t.dashboard.welcome} <span className="bg-gradient-to-r from-primary-600 to-fuchsia-500 bg-clip-text text-transparent">{user.username}</span>!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            Level {user.level} Companion • {user.xp % 100}/100 XP to next tier
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center gap-3">
            <Flame className="w-8 h-8 animate-pulse" />
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Daily Streak</h4>
              <p className="text-2xl font-black leading-none">{user.streak} Days</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quote/Challenge grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quote banner */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[160px] group hover:border-primary-500/30 transition-all duration-300">
          <div className="absolute top-4 right-4 text-primary-500/10 text-8xl font-serif select-none pointer-events-none">“</div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-500 flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {t.dashboard.quote}
            </span>
            <p className="text-base font-bold italic leading-relaxed text-slate-700 dark:text-slate-300">
              {activeQuote}
            </p>
          </div>
        </div>

        {/* Challenge panel */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between min-h-[160px] group hover:border-fuchsia-500/30 transition-all duration-300">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-500 flex items-center gap-1.5 mb-3">
              <CheckSquare className="w-3.5 h-3.5" />
              {t.dashboard.challenge}
            </span>
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">
              {t.dashboard.challengePlaceholder}
            </p>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-4 block">
            Completing journals or chats fulfills this!
          </span>
        </div>
      </div>

      {/* Interactive Mood Tracker Section */}
      <div className="glass-panel p-8 rounded-3xl space-y-6 relative">
        <div className="space-y-1">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Smile className="w-5 h-5 text-primary-500" />
            {t.dashboard.trackMood}
          </h3>
          <p className="text-xs text-slate-400">Save your feelings to feed the AI Sentiment Analytics.</p>
        </div>

        {/* Mood select notification alert */}
        <AnimatePresence>
          {moodSavedMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-semibold"
            >
              <Sparkles className="w-4 h-4" />
              <span>{moodSavedMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mood selection list */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {dashboardMoods.map((m) => {
            const isSelected = selectedMood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMood(m.id)}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300 hover-scale cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-tr from-primary-600 to-fuchsia-600 text-white border-transparent shadow-lg scale-105"
                    : "glass-panel hover:border-primary-500/30"
                }`}
              >
                <span className="text-3xl animate-float">{m.icon}</span>
                <span className="text-xs font-bold tracking-wide">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feeling Intensity Slider */}
        <div className="space-y-3 pt-4">
          <div className="flex justify-between items-center">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Intensity level: <span className="text-primary-500">{intensity}/10</span>
            </label>
            <span className="text-[10px] text-slate-400">1 (Very Mild) • 10 (Extremely Severe)</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-800 accent-primary-500 focus:outline-none"
          />
        </div>

        {/* Feeling remark input */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Remark or Note (Optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="E.g., exam preparation got me tired, family pressures..."
            className="w-full px-4 py-3.5 rounded-2xl glass-input text-sm"
          />
        </div>

        {/* Action submit button */}
        <button
          onClick={handleMoodSubmit}
          className="px-8 py-4 bg-gradient-to-r from-primary-600 to-fuchsia-600 hover:from-primary-700 hover:to-fuchsia-700 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 hover-scale cursor-pointer text-sm"
        >
          {t.dashboard.logMood}
        </button>
      </div>

      {/* Gamification Achievements and shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unlocked Badges list */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Your unlocked achievements
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Hope Seeker badge */}
            <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all duration-300 ${
              user.achievements.some(a => a.badgeId === 'hope_seeker')
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400"
                : "opacity-40 border-slate-200 dark:border-white/5"
            }`}>
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-xl shrink-0">🏆</div>
              <div>
                <h4 className="font-bold text-xs">Hope Seeker</h4>
                <p className="text-[10px] text-slate-400">First support chat</p>
              </div>
            </div>

            {/* Journal Master badge */}
            <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all duration-300 ${
              user.achievements.some(a => a.badgeId === 'journal_master')
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "opacity-40 border-slate-200 dark:border-white/5"
            }`}>
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl shrink-0">📖</div>
              <div>
                <h4 className="font-bold text-xs">Journal Master</h4>
                <p className="text-[10px] text-slate-400">First diary reflection</p>
              </div>
            </div>

            {/* First Step badge */}
            <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all duration-300 ${
              user.achievements.some(a => a.badgeId === 'first_step')
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
                : "opacity-40 border-slate-200 dark:border-white/5"
            }`}>
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-xl shrink-0">👣</div>
              <div>
                <h4 className="font-bold text-xs">First Step</h4>
                <p className="text-[10px] text-slate-400">First logged mood</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shortcuts Panel */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-lg font-bold">Quick Actions</h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push("/chat")}
              className="w-full p-4 rounded-2xl bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 font-bold text-xs text-primary-600 dark:text-primary-400 transition-all flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Start Chatting with Buddy
              </span>
              <span>→</span>
            </button>
            <button
              onClick={() => router.push("/journal")}
              className="w-full p-4 rounded-2xl bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/20 font-bold text-xs text-fuchsia-600 dark:text-fuchsia-400 transition-all flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                Write Private Thoughts
              </span>
              <span>→</span>
            </button>
            <button
              onClick={() => router.push("/analytics")}
              className="w-full p-4 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 font-bold text-xs text-cyan-600 dark:text-cyan-400 transition-all flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Check Mood Patterns
              </span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
