"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext.tsx";
import { api } from "../../../services/api.ts";
import { Lock, AlertCircle, CheckCircle, ArrowLeft, HeartHandshake, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Countdown redirect effect on success
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      router.push("/login");
    }
  }, [success, countdown, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("Reset token is missing from the URL.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.resetPassword(token, { password });
      if (res.success) {
        setSuccess(res.message || "Your password has been reset successfully.");
      } else {
        setError(res.message || "Invalid or expired token.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during password reset.");
    } finally {
      setIsSubmitting(false);
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
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-fuchsia-500 flex items-center justify-center mx-auto shadow-md">
            <HeartHandshake className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Create New Password</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Set your new password to regain access to your account.</p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-semibold animate-pulse">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{success}</span>
            </div>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 pl-6">
              Redirecting to login in {countdown} seconds...
            </p>
          </div>
        )}

        {/* Input Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                New Password
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
              <p className="text-[10px] text-slate-400 dark:text-slate-500 pl-1">
                Password must be at least 6 characters long.
              </p>
            </div>

            {/* Confirm Password input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl glass-input text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                >
                  {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-6 bg-gradient-to-r from-primary-600 to-fuchsia-600 hover:from-primary-700 hover:to-fuchsia-700 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 hover-scale flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}

        {/* Nav links */}
        <div className="pt-2 border-t border-primary-100 dark:border-white/5 flex items-center justify-center">
          <Link href="/login" className="flex items-center gap-2 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
