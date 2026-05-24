"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext.tsx";
import { useLanguage } from "../../context/LanguageContext.tsx";
import { api } from "../../services/api.ts";
import { Bell, ShieldAlert, Check, Sparkles, Trophy, Award, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Settings preferences states
  const [sleepReminders, setSleepReminders] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  
  // past notification logs state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load preferences and notification feeds
  useEffect(() => {
    if (user) {
      const fetchFeed = async () => {
        try {
          const prefRes = await api.getPreferences();
          if (prefRes.success && prefRes.data) {
            setSleepReminders(prefRes.data.sleepReminders);
            setDailyReminders(prefRes.data.dailyReminders);
          }

          const notifyRes = await api.getNotifications();
          if (notifyRes.success && notifyRes.data) {
            setNotifications(notifyRes.data);
          }
        } catch (err) {
          console.error("Fetch notifications failed:", err);
        }
      };
      fetchFeed();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleSaveReminders = async () => {
    setIsSaving(true);
    setSuccess(false);

    try {
      const res = await api.updatePreferences({ sleepReminders, dailyReminders });
      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Save notifications preference failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.markNotificationsRead();
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error("Mark notifications read failed:", err);
    }
  };

  const getNotifyBadge = (type: string) => {
    switch (type) {
      case "badge": return "🏆";
      case "motivation": return "🔥";
      case "affirmation": return "☀️";
      default: return "🔔";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {/* Left Settings switches (1 column) */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">{t.nav.notifications}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage daily mental health triggers.</p>
        </div>

        {/* Success message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-semibold flex items-center gap-2"
            >
              <Check className="w-4.5 h-4.5" />
              <span>Reminders updated!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Switch Controls */}
        <div className="glass-panel p-6 rounded-3xl space-y-6 shadow-md border">
          <h3 className="text-base font-bold flex items-center gap-2 border-b border-primary-100 dark:border-white/5 pb-3">
            <Bell className="w-5 h-5 text-primary-500" />
            {t.settings.remindersLabel}
          </h3>

          <div className="space-y-4">
            {/* Switch 1 */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                  {t.settings.sleepReminders}
                </h4>
                <p className="text-xs text-slate-400">Alerts at 10 PM to breathe and relax.</p>
              </div>
              <input
                type="checkbox"
                checked={sleepReminders}
                onChange={(e) => setSleepReminders(e.target.checked)}
                className="w-10 h-5 bg-slate-300 dark:bg-slate-700 rounded-full appearance-none checked:bg-primary-500 relative before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-all checked:before:left-5.5 cursor-pointer focus:outline-none"
              />
            </div>

            {/* Switch 2 */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                  {t.settings.dailyReminders}
                </h4>
                <p className="text-xs text-slate-400">Alerts at 8 AM with customized positive affirmations.</p>
              </div>
              <input
                type="checkbox"
                checked={dailyReminders}
                onChange={(e) => setDailyReminders(e.target.checked)}
                className="w-10 h-5 bg-slate-300 dark:bg-slate-700 rounded-full appearance-none checked:bg-primary-500 relative before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-all checked:before:left-5.5 cursor-pointer focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSaveReminders}
            disabled={isSaving}
            className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-fuchsia-600 hover:from-primary-700 hover:to-fuchsia-700 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 hover-scale flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
          >
            {isSaving ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              t.settings.save
            )}
          </button>
        </div>
      </div>

      {/* Right alerts feed (2 columns in desktop) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-500" />
            Past gamification feed
          </h3>
          
          {notifications.some(n => !n.read) && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2">
          {notifications.length === 0 ? (
            <div className="text-center p-12 rounded-3xl glass-panel border text-slate-400 text-sm">
              Your notifications feed is currently empty. Start logging moods or chat sessions to trigger badges!
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                className={`glass-panel p-5 rounded-2xl flex gap-4 border transition-all duration-300 shadow-sm relative overflow-hidden ${
                  !item.read ? "border-l-4 border-l-primary-500" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary-100/50 dark:bg-white/5 flex items-center justify-center text-xl shrink-0">
                  {getNotifyBadge(item.type)}
                </div>
                <div className="space-y-1">
                  <h4 className={`font-extrabold text-sm ${!item.read ? "text-slate-800 dark:text-white" : "text-slate-500"}`}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-medium">{item.message}</p>
                  <span className="text-[9px] text-slate-400 font-semibold block pt-1">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    })}
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
