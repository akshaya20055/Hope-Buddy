"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext.tsx";
import { useLanguage } from "../../context/LanguageContext.tsx";
import { User, Mail, Lock, AlertCircle, HeartHandshake, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
  const { signup, user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !email || !password) {
      setError("Please fill out all input fields.");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    const result = await signup(username, email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message || "Registration failed. Try again.");
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 relative">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary-500/10 blur-[80px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-xl flex flex-col gap-6"
      >
        {/* Brand Header info */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-fuchsia-500 flex items-center justify-center mx-auto shadow-md">
            <HeartHandshake className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Create Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Join HopeBuddy to log streaks & unlock achievements.</p>
        </div>

        {/* Error panel */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-semibold animate-pulse">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="alex_buddy"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-sm"
              />
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-sm"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl glass-input text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Submit btn */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 mt-6 bg-gradient-to-r from-primary-600 to-fuchsia-600 hover:from-primary-700 hover:to-fuchsia-700 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 hover-scale flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Footer links */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-semibold">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-600 dark:text-primary-400 hover:underline">
            Log in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
