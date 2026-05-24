"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext.tsx";
import { useLanguage } from "../../context/LanguageContext.tsx";
import { useVoice } from "../../hooks/useVoice.ts";
import { api } from "../../services/api.ts";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RefreshCw,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Clock,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  detectedMood?: string;
  responseMode?: string;
  timestamp: string;
}

export default function AIChatPage() {
  const { user, loading, updateUserStats } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();

  // Voice Speech API Hook
  const {
    speechSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    speakText,
    stopSpeaking
  } = useVoice(language);

  // States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [activeMode, setActiveMode] = useState<string>("auto");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [safetyTriggered, setSafetyTriggered] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load chat session history from backend
  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        try {
          const res = await api.getChatHistory();
          if (res.success && res.messages) {
            setMessages(res.messages);
            
            // Check if any previous messages had safety triggers
            const hasSafety = res.messages.some((m: any) => m.text.includes("Suicide Prevention Lifeline") || m.text.includes("సహాయ కేంద్రాలను సంప్రదించండి"));
            if (hasSafety) setSafetyTriggered(true);
          }
        } catch (err) {
          console.error("Fetch chat history failed:", err);
        }
      };
      fetchHistory();
    }
  }, [user]);

  // Handle Speech Recognition transcript updates
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  if (loading || !user) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Handle sending messages
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend || textToSend.trim() === "" || isSending) return;
    setIsSending(true);
    setInputText("");
    
    // Add user message temporarily to stream
    const tempUserMsg: ChatMessage = {
      sender: "user",
      text: textToSend,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      // 1. Send API message
      const res = await api.sendMessage(textToSend);
      if (res.success && res.message) {
        // AI reply msg
        const aiMsg: ChatMessage = {
          sender: "ai",
          text: res.message.text,
          detectedMood: res.message.detectedMood,
          responseMode: res.message.responseMode,
          timestamp: res.message.timestamp
        };
        
        setMessages(prev => [...prev, aiMsg]);

        // Trigger safety banner flag if crisis keywords triggered
        if (res.message.text.includes("Suicide Prevention Lifeline") || res.message.text.includes("సహాయ కేంద్రాలను సంప్రదించండి")) {
          setSafetyTriggered(true);
        }

        // 2. TTS Voice Audio Readout if active
        if (ttsEnabled) {
          speakText(res.message.text);
        }

        // 3. Update gamification stats (+10 XP)
        let xpGranted = res.gamification.xpGained;
        updateUserStats(
          xpGranted,
          res.gamification.totalXp,
          res.gamification.level,
          res.gamification.badgeUnlocked
        );

        // If a badge unlocked, burst some confetti!
        if (res.gamification.badgeUnlocked) {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.7 }
          });
        }
      }
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage(inputText);
    }
  };

  const handleClearChat = async () => {
    if (confirm("Are you sure you want to clear your conversation?")) {
      try {
        const res = await api.clearChat();
        if (res.success) {
          setMessages([]);
          setSafetyTriggered(false);
          stopSpeaking();
        }
      } catch (err) {
        console.error("Clear chat failed:", err);
      }
    }
  };

  // List of Tone overrides
  const toneModes = [
    { id: "auto", label: t.chat.modes.auto },
    { id: "support", label: t.chat.modes.support },
    { id: "motivation", label: t.chat.modes.motivation },
    { id: "funny", label: t.chat.modes.funny },
    { id: "historical", label: t.chat.modes.historical },
    { id: "success", label: t.chat.modes.success },
    { id: "confidence", label: t.chat.modes.confidence },
    { id: "calm", label: t.chat.modes.calm },
    { id: "friendship", label: t.chat.modes.friendship }
  ];

  const handleModeChange = async (modeId: string) => {
    setActiveMode(modeId);
    try {
      await api.updatePreferences({ responseMode: modeId });
    } catch (err) {
      console.error("Update preference mode failed:", err);
    }
  };

  const toggleTts = () => {
    const nextVal = !ttsEnabled;
    setTtsEnabled(nextVal);
    if (!nextVal) {
      stopSpeaking();
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-4 max-w-5xl mx-auto relative">
      {/* Top Setting headers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl glass-panel shadow-sm">
        {/* Tone select drop downs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t.chat.modeLabel}
          </span>
          <select
            value={activeMode}
            onChange={(e) => handleModeChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-primary-100/50 dark:bg-white/5 border border-primary-200 dark:border-white/10 text-xs font-bold focus:outline-none"
          >
            {toneModes.map(mode => (
              <option key={mode.id} value={mode.id} className="dark:bg-slate-900 font-medium">
                {mode.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTts}
            className={`p-2 rounded-xl border transition-all duration-300 ${
              ttsEnabled
                ? "bg-primary-500/10 border-primary-500/30 text-primary-500"
                : "glass-panel hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
            title={ttsEnabled ? t.chat.ttsOn : t.chat.ttsOff}
          >
            {ttsEnabled ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
          </button>
          
          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer"
          >
            {t.chat.clear}
          </button>
        </div>
      </div>

      {/* Safety Alert Warnings */}
      <AnimatePresence>
        {safetyTriggered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 shadow-md"
          >
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-red-500 uppercase tracking-wide">Crisis Support Alert</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {t.chat.safetyAlert}
              </p>
              <button
                onClick={() => router.push("/help")}
                className="mt-2 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
              >
                Go to Help Center & Helplines →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Chat Dialogue Feed panel */}
      <div className="flex-1 glass-panel rounded-3xl p-6 overflow-y-auto space-y-4 shadow-inner min-h-[300px]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center text-3xl animate-float">👋</div>
            <h3 className="font-extrabold text-lg">Hello, I'm HopeBuddy</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              I can listen to loneliness, stress, relationship worries, or exam failures. What's on your mind?
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.sender === "user";
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : ""}`}
              >
                {/* Avatar sphere */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm shadow-md ${
                  isUser
                    ? "bg-fuchsia-500 text-white"
                    : "bg-gradient-to-tr from-primary-600 to-fuchsia-500 text-white animate-pulse"
                }`}>
                  {isUser ? "👤" : "🤖"}
                </div>

                {/* Msg text blocks */}
                <div className="space-y-1">
                  <div className={`p-4 rounded-3xl text-sm leading-relaxed whitespace-pre-line shadow-sm border ${
                    isUser
                      ? "bg-gradient-to-tr from-primary-600 to-fuchsia-600 text-white border-transparent"
                      : "glass-panel dark:bg-white/5"
                  }`}>
                    {msg.text}
                  </div>
                  
                  {/* Footer status markers */}
                  {!isUser && msg.detectedMood && (
                    <div className="flex items-center gap-1.5 px-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-primary-500" />
                      <span>{msg.detectedMood} mood • {msg.responseMode} tone</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}

        {/* Loading Bubble */}
        {isSending && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-fuchsia-500 text-white flex items-center justify-center shrink-0 text-sm animate-pulse">
              🤖
            </div>
            <div className="p-4 rounded-3xl glass-panel dark:bg-white/5 border text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input controls Footer */}
      <div className="flex items-center gap-2 p-2 rounded-2xl glass-panel shadow-md">
        {/* Voice Speech Mic buttons */}
        {speechSupported && (
          <button
            onClick={isListening ? stopListening : startListening}
            className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
              isListening
                ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse"
                : "glass-panel hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500"
            }`}
            title={isListening ? t.chat.voicePlaceholder : "Record Voice"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}

        {/* Text Area Typing input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={isListening ? t.chat.voicePlaceholder : t.chat.placeholder}
          disabled={isSending}
          className="flex-1 px-4 py-3.5 rounded-xl bg-transparent border-none outline-none text-sm placeholder-slate-400 focus:ring-0"
        />

        {/* Send Action */}
        <button
          onClick={() => handleSendMessage(inputText)}
          disabled={!inputText || inputText.trim() === "" || isSending}
          className="p-4 bg-gradient-to-r from-primary-600 to-fuchsia-600 hover:from-primary-700 hover:to-fuchsia-700 text-white rounded-xl shadow-lg hover:shadow-primary-500/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
}
