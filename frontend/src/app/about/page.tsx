"use client";

import React from "react";
import { useLanguage } from "../../context/LanguageContext.tsx";
import { HeartHandshake, Shield, Sparkles, Code2, Globe, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary-600 to-fuchsia-500 flex items-center justify-center mx-auto shadow-lg animate-float">
          <HeartHandshake className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight">About HopeBuddy AI</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto text-sm">
          A premium emotional companion designed to guide users through life's mental struggles.
        </p>
      </div>

      {/* Info grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        {/* Card 1 */}
        <div className="glass-panel p-6 rounded-3xl space-y-3 hover-scale border shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center shadow-inner">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base">Complete Database Isolation</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Your diary reflections, chat sessions, and logged moods are strictly isolated. High-level security prevents external leaks, allowing you to reflect without worries.
          </p>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-6 rounded-3xl space-y-3 hover-scale border shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base">Gamification Level Progression</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Prioritizing mental health should feel rewarding. Earn XP for chat interactions, daily journal entries, and mood logs to level up your companion companion badge.
          </p>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-6 rounded-3xl space-y-3 hover-scale border shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shadow-inner">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base">Bilingual Language Engine</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            HopeBuddy supports seamless toggles between English and Telugu. Language state triggers are passed directly to our AI models, delivering localized emotional comfort.
          </p>
        </div>

        {/* Card 4 */}
        <div className="glass-panel p-6 rounded-3xl space-y-3 hover-scale border shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-inner">
            <Heart className="w-5 h-5 animate-pulse" />
          </div>
          <h3 className="font-extrabold text-base">Crisis Safety Override</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            We prioritize safety above all. Extreme user sentiments (e.g. self-harm, suicidal phrases) instantly bypass normal chat generations to display helpful crisis resources.
          </p>
        </div>
      </div>

      {/* Developer note */}
      <div className="glass-panel p-8 rounded-3xl text-center space-y-3 shadow-md border border-primary-500/10">
        <h3 className="font-extrabold text-base flex items-center justify-center gap-2">
          <Code2 className="w-5 h-5 text-primary-500" />
          Production-Level Code Architecture
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
          Built using Next.js 14 App Router, Express.js backend, and MongoDB schemas, HopeBuddy AI serves as a premium startup-grade blueprint for advanced mental health applications.
        </p>
      </div>
    </div>
  );
}
