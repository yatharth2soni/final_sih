/**
 * ==============================================================================
 * STEP 3 — Credential Setup
 * ==============================================================================
 * Captures:
 * 1. Mobile Number & Email (optional)
 * 2. Password + Confirm Password with interactive strength meter (Weak/Medium/Strong)
 * 3. Read-only "Linked Identity Anchor" automatically pulled from Step 2
 * 4. Read-only Auto-Generated "Device ID" (DEV-XXXXXX) for mobile binding simulation
 * 5. 2FA Enabled toggle
 * Stores everything into `sessionContext.credentials`.
 * ==============================================================================
 */

import React, { useState, useEffect, useMemo } from "react";
import { useSessionContext } from "../../context/SessionContext";
import {
  KeyRound,
  Phone,
  Mail,
  Lock,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Link2,
} from "lucide-react";

export function Step3Credentials() {
  const { state, updateCredentials, goToStep } = useSessionContext();

  const [mobile, setMobile] = useState(state.credentials.mobile || "");
  const [email, setEmail] = useState(state.credentials.email || "");
  const [password, setPassword] = useState(state.credentials.password || "");
  const [confirmPassword, setConfirmPassword] = useState(state.credentials.confirmPassword || "");
  const [twoFAEnabled, setTwoFAEnabled] = useState(state.credentials.twoFAEnabled ?? true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Sync with state if changed via demo auto-fill
  useEffect(() => {
    if (state.credentials.mobile) setMobile(state.credentials.mobile);
    if (state.credentials.email) setEmail(state.credentials.email);
    if (state.credentials.password) setPassword(state.credentials.password);
    if (state.credentials.confirmPassword) setConfirmPassword(state.credentials.confirmPassword);
    if (state.credentials.twoFAEnabled !== undefined) setTwoFAEnabled(state.credentials.twoFAEnabled);
  }, [state.credentials]);

  // Derive linked identity anchor
  const linkedAnchor = state.credentials.linkedIdentityAnchor || "ANCHOR-CIL-2024";
  const deviceId = state.credentials.deviceId || "DEV-884920";

  // Password strength calculation
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "None", color: "bg-slate-300" };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: 1, label: "Weak", color: "bg-rose-500", text: "text-rose-500" };
    if (score <= 3) return { score: 2, label: "Medium", color: "bg-amber-500", text: "text-amber-500" };
    return { score: 3, label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
  }, [password]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!mobile || mobile.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit Indian Mobile Number.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    updateCredentials({
      mobile,
      email,
      password,
      confirmPassword,
      twoFAEnabled,
    });

    goToStep(4);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Step Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Step 3 of 4: Credential Setup & Binding
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Establish Access Credentials
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
          Bind your statutory identity anchor with secure mobile MFA authentication.
        </p>
      </div>

      {/* Auto-Populated Identity Anchor & Device Binding Box */}
      <div className="mb-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
          <span className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
            <Link2 className="w-4 h-4 text-amber-500" />
            Linked Identity Anchor (Read-Only):
          </span>
          <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded">
            {linkedAnchor}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
            <Smartphone className="w-4 h-4 text-emerald-500" />
            Registered Device ID (Mobile Binding):
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded">
            {deviceId}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Mobile Number Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              Mobile Number (SMS OTP Target) <span className="text-rose-500">*</span>
            </span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm font-semibold border-r border-slate-300 dark:border-slate-700 pr-2.5">
              <span>🇮🇳</span>
              <span>+91</span>
            </div>
            <input
              type="tel"
              maxLength={10}
              required
              placeholder="e.g. 9812345678"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              className="w-full h-11 pl-20 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:border-amber-500 focus:outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Email Address Field (Optional) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-500" />
              Official Email (Optional)
            </span>
          </label>
          <input
            type="email"
            placeholder="e.g. officer@coalindia.gov.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:border-amber-500 focus:outline-none transition-all shadow-sm"
          />
        </div>

        {/* Password & Strength Meter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                Statutory Password <span className="text-rose-500">*</span>
              </span>
            </label>
            {password && (
              <span className={`text-[11px] font-bold ${strength.text}`}>
                Strength: {strength.label}
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 pr-11 rounded-xl bg-slate-50 dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:border-amber-500 focus:outline-none transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength Bar */}
          {password && (
            <div className="w-full grid grid-cols-3 gap-1.5 pt-1">
              <div className={`h-1.5 rounded-full transition-all ${strength.score >= 1 ? strength.color : "bg-slate-200 dark:bg-slate-800"}`} />
              <div className={`h-1.5 rounded-full transition-all ${strength.score >= 2 ? strength.color : "bg-slate-200 dark:bg-slate-800"}`} />
              <div className={`h-1.5 rounded-full transition-all ${strength.score >= 3 ? strength.color : "bg-slate-200 dark:bg-slate-800"}`} />
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Confirm Password <span className="text-rose-500">*</span>
          </label>
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:border-amber-500 focus:outline-none transition-all shadow-sm"
          />
        </div>

        {/* 2FA Toggle */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Enable Two-Factor SMS Verification (2FA)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Required for DGMS statutory notices and audit trail modifications.
            </p>
          </div>
          <input
            type="checkbox"
            checked={twoFAEnabled}
            onChange={(e) => setTwoFAEnabled(e.target.checked)}
            className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500 cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => goToStep(2)}
            className="w-1/3 h-13 py-3 px-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            type="submit"
            className="w-2/3 h-13 py-3.5 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 shadow-amber-500/20 active:scale-[0.99] cursor-pointer transition-all"
          >
            <span>Proceed to Step 4: Permissions</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
