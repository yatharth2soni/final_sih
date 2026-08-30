/**
 * ==============================================================================
 * STEP 5 — Returning User Login
 * ==============================================================================
 * Standard returning authentication screen:
 * 1. User ID / Mobile Number field
 * 2. Password field (or "Send OTP instead" mode)
 * 3. Role + Mine Site re-selection dropdowns
 * 4. Simple Math Captcha verification (e.g., "4 + 7 = ?")
 * 5. Validates against `sessionContext.credentials` or `DEMO_PERSONAS`
 * 6. Directs to Step 6 (if 2FA enabled) or directly initializes session (Step 7/8).
 * ==============================================================================
 */

import React, { useState, useEffect, useMemo } from "react";
import { useSessionContext } from "../../context/SessionContext";
import { ROLES, SUBSIDIARIES } from "../../data/rolesConfig";
import {
  LogIn,
  Phone,
  Lock,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  UserPlus,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

export function Step5Login() {
  const { state, loginUser, finalizeLoginSession, goToStep, setAuthMode } = useSessionContext();

  const [identifier, setIdentifier] = useState(
    state.credentials.mobile || state.profile.employeeId || state.profile.governmentId || ""
  );
  const [password, setPassword] = useState(state.credentials.password || "");
  const [useOtpLogin, setUseOtpLogin] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Captcha Generator
  const [captchaNum1, setCaptchaNum1] = useState(4);
  const [captchaNum2, setCaptchaNum2] = useState(7);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 1;
    setCaptchaNum1(n1);
    setCaptchaNum2(n2);
    setCaptchaAnswer("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Sync if demo auto-fill applied
  useEffect(() => {
    if (state.credentials.mobile) setIdentifier(state.credentials.mobile);
    if (state.credentials.password) setPassword(state.credentials.password);
  }, [state.credentials]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Check Captcha
    const expected = captchaNum1 + captchaNum2;
    if (parseInt(captchaAnswer, 10) !== expected) {
      setError("Incorrect Math Captcha answer. Please solve again.");
      generateCaptcha();
      return;
    }

    // 2. Check Identifier & Password
    if (!identifier.trim()) {
      setError("Please enter your registered User ID or Mobile Number.");
      return;
    }

    if (useOtpLogin) {
      if (otpValue.trim() !== "849201" && otpValue.trim() !== "000000" && otpValue.trim() !== "123456") {
        setError("Invalid OTP code. Use test code 849201 or 000000.");
        return;
      }
      // OTP Validated
      await finalizeLoginSession();
      return;
    }

    if (!password.trim()) {
      setError("Please enter your statutory password.");
      return;
    }

    setLoading(true);
    const result = loginUser(identifier.trim(), password.trim());
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Authentication failed.");
      return;
    }

    // Check if 2FA is required
    if (result.needs2FA) {
      goToStep(6);
    } else {
      await finalizeLoginSession();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Step Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Step 5: Returning User Authentication
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sign In to CoalGov Command
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
          Access your authorized mine safety dashboard, gas telemetry feeds, and statutory compliance registries.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        {/* Identifier Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              Registered Mobile Number / Employee ID / Govt ID <span className="text-rose-500">*</span>
            </span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 9812345678 or ECL-2024-1123"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:border-amber-500 focus:outline-none transition-all shadow-sm"
          />
        </div>

        {/* Password / OTP Mode */}
        {!useOtpLogin ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Statutory Password <span className="text-rose-500">*</span>
                </span>
              </label>
              <button
                type="button"
                onClick={() => setUseOtpLogin(true)}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Send SMS OTP instead
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter password (e.g. Demo@1234)"
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
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  Enter 6-Digit SMS OTP <span className="text-rose-500">*</span>
                </span>
              </label>
              <button
                type="button"
                onClick={() => setUseOtpLogin(false)}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Use Password instead
              </button>
            </div>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 849201"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              className="w-full h-11 px-4 text-center tracking-widest font-mono text-lg font-bold rounded-xl bg-slate-50 dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:outline-none transition-all shadow-sm"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
              Dev Hint: Use active statutory OTP <span className="font-mono font-bold text-amber-500">849201</span> or <span className="font-mono font-bold text-amber-500">000000</span>
            </p>
          </div>
        )}

        {/* Simple Math Captcha */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              Statutory Security Captcha:
            </span>
            <button
              type="button"
              onClick={generateCaptcha}
              className="text-slate-400 hover:text-amber-500 flex items-center gap-1 text-[11px]"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-lg bg-navy-900 text-amber-400 font-mono text-base font-bold tracking-wider select-none shadow-inner border border-amber-500/20">
              {captchaNum1} + {captchaNum2} = ?
            </div>
            <input
              type="number"
              required
              placeholder="Your answer"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sm focus:border-amber-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 py-3.5 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-navy-900 to-navy-950 border border-amber-500/30 hover:border-amber-500 text-amber-400 shadow-navy-950/40 active:scale-[0.99] cursor-pointer transition-all"
          >
            <LogIn className="w-5 h-5" />
            <span>{loading ? "Authenticating Session..." : "Sign In & Access Dashboard"}</span>
          </button>
        </div>

        {/* New User Option */}
        <div className="pt-3 text-center border-t border-slate-200 dark:border-slate-800/80">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            First time logging into CoalGov Platform?{" "}
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline ml-1 inline-flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register New Official (Step 1)</span>
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
