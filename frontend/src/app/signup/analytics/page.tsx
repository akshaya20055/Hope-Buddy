"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext.tsx";
import { useLanguage } from "../../context/LanguageContext.tsx";
import { api } from "../../services/api.ts";
import { BarChart3, Activity, PieChart as PieIcon, Flame, Heart } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { motion } from "framer-motion";

interface MoodLog {
  mood: string;
  intensity: number;
  createdAt: string;
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // State
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load manual mood logs from backend
  useEffect(() => {
    if (user) {
      const fetchLogs = async () => {
        try {
          const res = await api.getMoodHistory();
          if (res.success && res.data) {
            setLogs(res.data);
            processChartData(res.data);
          }
        } catch (err) {
          console.error("Fetch mood logs failed:", err);
        }
      };
      fetchLogs();
    }
  }, [user]);

  // Process data for Recharts
  const processChartData = (rawLogs: MoodLog[]) => {
    // 1. Line Chart Data (reverse to show chronological order)
    const reversed = [...rawLogs].reverse();
    const parsedLine = reversed.map(item => ({
      date: new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      intensity: item.intensity,
      mood: item.mood
    }));
    setChartData(parsedLine);

    // 2. Pie Chart distribution data
    const distribution: { [key: string]: number } = {};
    rawLogs.forEach(log => {
      distribution[log.mood] = (distribution[log.mood] || 0) + 1;
    });

    const parsedPie = Object.keys(distribution).map(mood => ({
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      value: distribution[mood]
    }));
    setPieData(parsedPie);
  };

  if (loading || !user) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Pie colors
  const COLORS = ["#8b5cf6", "#d946ef", "#06b6d4", "#f43f5e", "#f59e0b", "#10b981", "#6366f1"];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight">{t.analytics.title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t.analytics.subtitle}</p>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl flex items-center gap-4 shadow-sm border hover:border-primary-500/20 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center shadow-inner">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Check-ins</h4>
            <p className="text-2xl font-black">{logs.length}</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex items-center gap-4 shadow-sm border hover:border-orange-500/20 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shadow-inner">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t.analytics.summary}</h4>
            <p className="text-2xl font-black">{user.streak} Days</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex items-center gap-4 shadow-sm border hover:border-fuchsia-500/20 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center shadow-inner">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Companion Level</h4>
            <p className="text-2xl font-black">Level {user.level}</p>
          </div>
        </div>
      </div>

      {/* Recharts Grid panel */}
      {logs.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl text-center space-y-4 shadow-md max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center text-3xl mx-auto animate-float">📊</div>
          <h3 className="font-extrabold text-lg">No Analytics Data Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log your current mood or chat with HopeBuddy to generate emotional analytics data points.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-fuchsia-600 hover:from-primary-700 hover:to-fuchsia-700 text-white font-bold rounded-xl transition-all cursor-pointer text-xs"
          >
            Log Your First Feeling
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Line Chart */}
          <div className="glass-panel p-6 rounded-3xl lg:col-span-2 space-y-4 shadow-sm">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-500" />
              {t.analytics.intensityChart}
            </h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis domain={[1, 10]} stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15,23,42,0.9)",
                      border: "none",
                      borderRadius: "16px",
                      color: "#f8fafc",
                      fontSize: "12px"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="intensity"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-bold text-base flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-fuchsia-500" />
              {t.analytics.distributionChart}
            </h3>
            <div className="w-full h-80 flex items-center justify-center">
              {pieData.length === 0 ? (
                <span className="text-xs text-slate-400">Processing distribution...</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15,23,42,0.9)",
                        border: "none",
                        borderRadius: "12px",
                        color: "#f8fafc",
                        fontSize: "11px"
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      iconSize={10}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "10px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
