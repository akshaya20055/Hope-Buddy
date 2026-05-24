"use client";

import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext.tsx";
import { HelpCircle, AlertTriangle, PhoneCall, Sparkles, Smile, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function HelpPage() {
  const { t } = useLanguage();
  const [breathingText, setBreathingText] = useState("Breathe in... (4s)");
  const [isBreathing, setIsBreathing] = useState(false);

  const startBreathingGuide = () => {
    setIsBreathing(true);
    let cycle = 0;
    
    const interval = setInterval(() => {
      if (cycle === 0) {
        setBreathingText("Hold... (7s)");
        cycle = 1;
      } else if (cycle === 1) {
        setBreathingText("Breathe out slowly... (8s)");
        cycle = 2;
      } else {
        setBreathingText("Breathe in... (4s)");
        cycle = 0;
      }
    }, 4500);

    // Stop after 3 full cycles
    setTimeout(() => {
      clearInterval(interval);
      setIsBreathing(false);
      setBreathingText("Breathe in... (4s)");
    }, 40000);
  };

  const localHelplines = [
    { name: "Vandrevala Foundation", contact: "+91 9999 666 555", info: "24/7 Mental health counseling in multiple Indian languages." },
    { name: "Sneha India Suicide Prevention", contact: "+91 44 2464 0050", info: "Compassionate, confidential support for emotional crises." },
    { name: "AASRA Helpline", contact: "+91 98204 66726", info: "Voluntary organization supporting distress and suicide prevention." },
    { name: "National Suicide Prevention Lifeline (Global)", contact: "988 or 1-800-273-8255", info: "Available 24/7. Peer-to-peer and professional crisis counseling." }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto py-4">
      {/* Left Helplines section (2 columns) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">{t.help.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.help.subtitle}</p>
        </div>

        {/* Warning banner */}
        <div className="p-5 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-4 shadow-sm animate-pulse">
          <ShieldAlert className="w-8 h-8 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm uppercase tracking-wide">Crisis Notice</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
              If you are in immediate physical danger, experiencing thoughts of ending your life, or having a severe clinical emergency, please contact your local emergency services or call a trusted loved one instantly. You are not alone.
            </p>
          </div>
        </div>

        {/* Helplines Feed list */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-primary-500" />
            {t.help.helplineTitle}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {localHelplines.map((line, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-2xl flex flex-col justify-between gap-4 border hover:border-red-500/20 transition-all duration-300 shadow-sm">
                <div className="space-y-2">
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{line.name}</h4>
                  <p className="text-xs text-slate-400 leading-normal font-semibold">{line.info}</p>
                </div>
                <div className="pt-3 border-t border-primary-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-red-500">
                  <span>Call Hotline:</span>
                  <a href={`tel:${line.contact.replace(/\s+/g, "")}`} className="hover:underline">
                    {line.contact}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Exercises section (1 column) */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          {t.help.tipsTitle}
        </h3>

        {/* Breathing guide card */}
        <div className="glass-panel p-6 rounded-3xl space-y-6 shadow-md border hover:border-primary-500/20 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl" />
          <div>
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Interactive 4-7-8 Breathing</h4>
            <p className="text-xs text-slate-400 mt-1">Calm your racing thoughts in real-time.</p>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-primary-50/50 dark:bg-white/5 rounded-2xl border border-primary-100 dark:border-white/5 shadow-inner">
            <span className={`text-sm font-extrabold transition-all text-primary-600 dark:text-primary-400 ${isBreathing ? "animate-pulse" : ""}`}>
              {breathingText}
            </span>
          </div>

          <button
            onClick={startBreathingGuide}
            disabled={isBreathing}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-fuchsia-600 hover:from-primary-700 hover:to-fuchsia-700 text-white font-bold rounded-xl shadow-md transition-all duration-300 hover-scale text-xs disabled:opacity-50"
          >
            {isBreathing ? "Guide Active (40s)..." : "Start Breathing Exercise"}
          </button>
        </div>

        {/* Grounding tips feed */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 shadow-md border hover:border-fuchsia-500/20 transition-all duration-300">
          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Mental Grounding Practices</h4>
          <div className="space-y-3">
            {t.help.tips.map((tip, idx) => (
              <div key={idx} className="flex gap-2.5 items-start text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                <span className="w-5 h-5 rounded-full bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center text-[10px] font-black shrink-0">
                  {idx + 1}
                </span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
