"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext.tsx";
import { useLanguage } from "../context/LanguageContext.tsx";
import { HeartHandshake, Sparkles, Brain, CheckCircle2, ShieldCheck, Gamepad2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <div className="relative overflow-hidden py-12 md:py-20 flex flex-col items-center">
      {/* Background soft glowing blur spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary-400/10 blur-[100px] pointer-events-none -z-10" />

      {/* Hero Header panel */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-4xl space-y-6 px-4"
      >
        <motion.div 
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 font-bold text-xs"
        >
          <Sparkles className="w-4 h-4 text-primary-500 animate-pulse" />
          <span>AI Emotional Support Companion</span>
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-4xl md:text-6xl font-black tracking-tight leading-tight"
        >
          {t.landing.title}
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium"
        >
          {t.landing.subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
          <Link href="/signup">
            <span className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-fuchsia-600 hover:from-primary-700 hover:to-fuchsia-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-primary-500/20 transition-all duration-300 hover-scale cursor-pointer text-sm">
              {t.landing.getStarted}
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
          <Link href="/login">
            <span className="px-8 py-4 bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 font-bold rounded-2xl transition-all duration-300 hover-scale cursor-pointer text-sm">
              {t.landing.login}
            </span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Main Core Features list */}
      <div className="w-full mt-24 max-w-6xl px-4">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-2xl md:text-4xl font-extrabold">{t.landing.whyUs}</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm">{t.landing.whyUsDesc}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-3xl hover-scale flex flex-col gap-4 shadow-sm relative group overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300 shadow-inner">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">{t.landing.features.chat}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t.landing.features.chatDesc}</p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-3xl hover-scale flex flex-col gap-4 shadow-sm relative group overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500 group-hover:bg-fuchsia-500 group-hover:text-white transition-all duration-300 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">{t.landing.features.modes}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t.landing.features.modesDesc}</p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-3xl hover-scale flex flex-col gap-4 shadow-sm relative group overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">{t.landing.features.journal}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t.landing.features.journalDesc}</p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel p-6 rounded-3xl hover-scale flex flex-col gap-4 shadow-sm relative group overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-inner">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">{t.landing.features.gamify}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t.landing.features.gamifyDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
