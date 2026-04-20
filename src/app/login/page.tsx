"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    router.replace("/");
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        router.replace("/");
      } else {
        setError(result.error || "Login failed");
        setIsSubmitting(false);
      }
    }, 600);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] bg-sidebar flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 via-transparent to-black/60" />
        <div className="relative z-10">
          <Image
            src="/trest-logo.png"
            alt="Trest Capital"
            width={48}
            height={48}
            className="mb-6"
          />
          <h1 className="text-white text-3xl font-bold leading-tight">
            Trest Capital
          </h1>
          <p className="text-neutral-400 text-sm mt-2">
            Capital Advisory
          </p>
        </div>
        <div className="relative z-10 space-y-6">
          <div className="space-y-4">
            <div className="h-px bg-white/10" />
            <blockquote className="text-neutral-300 text-sm leading-relaxed italic">
              &ldquo;One platform. Every deal, every relationship, every signal — in real time.&rdquo;
            </blockquote>
          </div>
          <div className="flex items-center gap-4 text-neutral-500 text-xs">
            <span>Deal Tracking</span>
            <span className="h-1 w-1 rounded-full bg-neutral-600" />
            <span>Relationship Intelligence</span>
            <span className="h-1 w-1 rounded-full bg-neutral-600" />
            <span>Market Indications</span>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Image
              src="/trest-logo.png"
              alt="Trest Capital"
              width={48}
              height={48}
              className="mx-auto mb-3"
            />
            <h1 className="text-xl font-bold text-slate-900">Trest Capital</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-1">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-colors"
                  placeholder="you@trestcapital.com"
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-colors"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-8">
            Trest Capital — Confidential
          </p>
        </div>
      </div>
    </div>
  );
}
