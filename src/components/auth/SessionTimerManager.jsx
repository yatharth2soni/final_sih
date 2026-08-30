/**
 * ==============================================================================
 * STEP 7 Inactivity Countdown & Session Expiry Warning Modal
 * ==============================================================================
 * 1. 15-minute standard statutory session countdown.
 * 2. 13-minute warning modal ("Your session will expire in 2 minutes...").
 * 3. ⚙ Dev Mode toggle: Shortens timer to 30 seconds (with warning at 20s) for rapid testing.
 * ==============================================================================
 */

import React from "react";
import { useSessionContext } from "../../context/SessionContext";
import { Clock, AlertTriangle, ShieldCheck, Zap, RefreshCw, LogOut } from "lucide-react";

export function SessionTimerManager() {
  const { state, extendSession, toggleDevFastExpiry, logoutUser } = useSessionContext();
  const { session } = state;

  if (!session.isAuthenticated) return null;

  const remaining = session.remainingSeconds;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <>
      {/* Dev Fast Timer Toggle & Status Pill */}
      <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 bg-navy-950/90 backdrop-blur-md border border-amber-500/30 text-white px-3 py-1.5 rounded-full shadow-lg text-xs">
        <div className="flex items-center gap-1.5">
          <Clock className={`w-3.5 h-3.5 ${remaining < 60 ? "text-rose-400 animate-pulse" : "text-amber-400"}`} />
          <span className="font-mono font-bold text-amber-300">{formattedTime}</span>
        </div>
        <span className="text-slate-500">|</span>
        <button
          type="button"
          onClick={toggleDevFastExpiry}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
            session.devFastExpiry
              ? "bg-rose-500 text-white shadow-sm"
              : "bg-slate-800 text-slate-300 hover:text-amber-400"
          }`}
          title="Toggle 30-Second Fast Session Expiry for testing"
        >
          <Zap className="w-3 h-3" />
          <span>{session.devFastExpiry ? "Fast Expiry (30s ON)" : "⚙ Dev Mode (15m)"}</span>
        </button>
      </div>

      {/* Expiry Warning Modal (At 13 mins / 20s fast mode) */}
      {session.isWarningOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-500 p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Statutory Session Expiring
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  DGMS compliance requires automated logout after period of inactivity.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                Your session will expire in:
              </p>
              <div className="font-mono text-3xl font-black text-amber-600 dark:text-amber-400">
                {formattedTime}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Click anywhere or press extend to maintain active audit state.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={logoutUser}
                className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
              <button
                type="button"
                onClick={extendSession}
                className="w-2/3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Extend Session & Stay Logged In</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
