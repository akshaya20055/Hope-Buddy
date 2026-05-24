"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext.tsx";
import { useLanguage } from "../../context/LanguageContext.tsx";
import { api } from "../../services/api.ts";
import { BookOpenText, Sparkles, AlertCircle, RefreshCw, Bookmark, Award, Heart, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StoriesPage() {
  const { user, loading } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();

  // Story generator states
  const [selectedTheme, setSelectedTheme] = useState<string>("healing");
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Pre-compiled failure-to-success profiles based on language locale
  const historicalProfiles = language === "te" ? [
    {
      name: "డాక్టర్ ఏపీజే అబ్దుల్ కలాం",
      achievement: "భారత మిస్సైల్ మ్యాన్ & రాష్ట్రపతి",
      struggle: "రామేశ్వరంలోని పేద కుటుంబంలో జన్మించారు. చదువు కోసం వార్తాపత్రికలు అమ్మారు. ఎయిర్ ఫోర్స్ పైలట్ ఇంటర్వ్యూలో విఫలమైనప్పటికీ నిరాశ చెందలేదు.",
      wisdom: "కలలు కనండి, వాటిని సాకారం చేసుకోండి. వైఫల్యం అనేది నేర్చుకోవడంలో మొదటి మెట్టు.",
      badge: "🚀"
    },
    {
      name: "అబ్రహం లింకన్",
      achievement: "అమెరికా 16వ అధ్యక్షుడు",
      struggle: "వ్యాపారంలో అనేక నష్టాలు, భార్య మరణం, ఎన్నికల్లో వరుస ఓటములు, మరియు తీవ్ర మానసిక క్షోభ అనుభవించారు. కానీ పట్టుదలతో నిలబడి చరిత్ర సృష్టించారు.",
      wisdom: "నేను పడిపోయానా లేదా అనేది ముఖ్యం కాదు, నేను తిరిగి లేచానా లేదా అనేదే ముఖ్యం.",
      badge: "🏛️"
    },
    {
      name: "జె.కె. రౌలింగ్",
      achievement: "ప్రసిద్ధ హ్యారీ పోటర్ రచయిత",
      struggle: "దివాళా తీసిన ఒంటరి తల్లిగా జీవించారు. తీవ్ర నిరాశతో ఆత్మహత్య ఆలోచనలు వచ్చాయి. మొదటి హ్యారీ పోటర్ పుస్తకాన్ని 12 మంది పబ్లిషర్లు తిరస్కరించారు.",
      wisdom: "మీ అపజయాలే మీ భవిష్యత్తు విజయానికి పునాది రాళ్ళు.",
      badge: "🪄"
    }
  ] : [
    {
      name: "Dr. APJ Abdul Kalam",
      achievement: "Missile Man & President of India",
      struggle: "Born to a poor fisherman family. Sold newspapers to support his schooling. Suffered early career rejections (missed Air Force selection), yet went on to lead India's space triumphs.",
      wisdom: "F.A.I.L. means First Attempt In Learning. End is not the end, E.N.D. means Effort Never Dies.",
      badge: "🚀"
    },
    {
      name: "Abraham Lincoln",
      achievement: "16th President of the USA",
      struggle: "Failed in business twice, lost 8 legislative and presidential elections, and suffered a severe nervous breakdown before uniting a fractured country.",
      wisdom: "My great concern is not whether you have failed, but whether you are content with your failure.",
      badge: "🏛️"
    },
    {
      name: "J.K. Rowling",
      achievement: "Creator of Harry Potter franchise",
      struggle: "Unemployed single mother living on state welfare, diagnosed with clinical depression. Her Harry Potter draft was rejected by 12 major publishing firms.",
      wisdom: "It is impossible to live without failing at something, unless you live so cautiously that you might as well not have lived at all.",
      badge: "🪄"
    }
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleGenerateStory = async () => {
    setIsGenerating(true);
    setGeneratedStory(null);

    try {
      const res = await api.generateStory(selectedTheme);
      if (res.success && res.story) {
        setGeneratedStory(res.story);
      }
    } catch (err) {
      console.error("Generate story failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const storyCategories = [
    { id: "healing", label: t.stories.categories.healing },
    { id: "funny", label: t.stories.categories.funny },
    { id: "motivational", label: t.stories.categories.motivational },
    { id: "comeback", label: t.stories.categories.comeback },
    { id: "historical", label: t.stories.categories.historical }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight">{t.stories.title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t.stories.subtitle}</p>
      </div>

      {/* Historical failure-to-success cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {historicalProfiles.map((profile, index) => (
          <div key={index} className="glass-panel p-6 rounded-3xl flex flex-col justify-between hover-scale shadow-sm relative group overflow-hidden border-t-4 border-t-primary-500">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl animate-float">{profile.badge}</span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Struggle & Success
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-lg text-primary-600 dark:text-primary-400">{profile.name}</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{profile.achievement}</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {profile.struggle}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-primary-100 dark:border-white/5 italic text-xs font-bold text-slate-600 dark:text-slate-300">
              “{profile.wisdom}”
            </div>
          </div>
        ))}
      </div>

      {/* AI Interactive Story Generator section */}
      <div className="glass-panel p-8 rounded-3xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-3xl" />
        <div className="space-y-1">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-fuchsia-500" />
            {t.stories.genTitle}
          </h3>
          <p className="text-xs text-slate-400">{t.stories.genSubtitle}</p>
        </div>

        {/* Categories selectors */}
        <div className="flex flex-wrap gap-2">
          {storyCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedTheme(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer ${
                selectedTheme === cat.id
                  ? "bg-gradient-to-r from-primary-600 to-fuchsia-600 border-transparent text-white shadow-md scale-105"
                  : "glass-panel hover:border-primary-500/30"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Generate triggers */}
        <button
          onClick={handleGenerateStory}
          disabled={isGenerating}
          className="px-8 py-4 bg-gradient-to-r from-primary-600 to-fuchsia-600 hover:from-primary-700 hover:to-fuchsia-700 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 hover-scale flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4.5 h-4.5 animate-spin" />
              <span>{t.stories.generating}</span>
            </>
          ) : (
            t.stories.generate
          )}
        </button>

        {/* Render Generated Story panel */}
        <AnimatePresence>
          {generatedStory && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="p-6 rounded-2xl bg-primary-50/50 dark:bg-white/5 border border-primary-100 dark:border-white/5 shadow-inner mt-4 relative"
            >
              <div className="absolute top-4 right-4 text-xs font-extrabold uppercase tracking-widest text-primary-500">
                AI Inspiration
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300 pr-12 font-medium">
                {generatedStory}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
