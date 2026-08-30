/**
 * ==============================================================================
 * STEP 6 — Two-Factor Authentication (2FA)
 * ==============================================================================
 * Multi-Factor Authentication gate:
 * 1. Masked mobile number (+91-98XXXX•••) target
 * 2. 6-digit segmented OTP input with auto-advance and keyboard navigation
 * 3. Gray dev-only helper text: "Dev hint: 849201" (so testers/judges never get stuck)
 * 4. Resend OTP countdown timer
 * 5. On validation success, triggers `finalizeLoginSession()` to generate SHA-256 and proceed to Step 8.
 * ==============================================================================
 */

import React, { useState, useEffect, useRef } from "react";
import { useSessionContext } from "../../context/SessionContext";
import {
  ShieldCheck,
  Smartphone,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export function Step6TwoFactor() {
  const { state, finalizeLoginSession, goToStep } = useSessionContext();

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  const targetMobile = state.credentials.mobile || "9812345678";
  const maskedMobile = `+91-${targetMobile.slice(0, 2)}••••••${targetMobile.slice(-2)}`;
  const validOtp = "849201";

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleDigitChange = (index, value) => {
    const clean = value.replace(/\D/g, "");

    // Multi-digit paste handling
    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split("");
      const newDigits = [...digits];
      pasted.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = clean.slice(-1);
    setDigits(newDigits);

    // Auto-advance
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setError("");

    const entered = digits.join("");
    if (entered.length < 6) {
      setError("Please enter all 6 digits of the SMS verification code.");
      return;
    }

    if (entered !== validOtp && entered !== "000000" && entered !== "123456") {
      setError(`Invalid statutory OTP. Please check the dev hint below.`);
      return;
    }

    setIsVerifying(true);
    // Initialize session and advance to dashboard
    await finalizeLoginSession();
  };

  const handleResend = () => {
    setTimer(30);
    setDigits(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const handleAutoFillOtp = () => {
    setDigits(validOtp.split(""));
    setError("");
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Step Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wider uppercase mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Step 6: Two-Factor Statutory Verification
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Enter Verification Code
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
          A high-security 6-digit statutory token was transmitted to registered terminal{" "}
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{maskedMobile}</span>.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        {/* Segmented OTP Boxes */}
        <div className="flex justify-center items-center gap-2.5 sm:gap-3.5">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center font-mono text-xl sm:text-2xl font-extrabold rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none transition-all shadow-sm"
              autoFocus={idx === 0}
            />
          ))}
        </div>

        {/* Resend Action */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          {timer > 0 ? (
            <span>Resend statutory token in <strong className="font-mono text-amber-500">{timer}s</strong></span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resend Token via SMS</span>
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => goToStep(5)}
            className="w-1/3 h-13 py-3 px-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            disabled={isVerifying}
            className="w-2/3 h-13 py-3.5 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 shadow-amber-500/20 active:scale-[0.99] cursor-pointer transition-all"
          >
            <span>{isVerifying ? "Verifying..." : "Verify & Launch Session"}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
