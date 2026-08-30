/**
 * ==============================================================================
 * DEMO / AUTO-FILL FLOATING WIDGET & TOP STATUS BANNER
 * ==============================================================================
 * 1. Floating button in the bottom-right corner ("⚡ Demo Auto-Fill").
 * 2. 6 Pre-built Indian test personas (one per statutory role).
 * 3. Selecting a persona auto-fills all fields and persists throughout Steps 1-8.
 * 4. Persistent top banner: "🧪 DEMO MODE — Test Data Active (Persona: <Name>)".
 * 5. "Clear Demo Data" button to reset context to clean manual-entry state.
 * ==============================================================================
 */

import React, { useState, useRef, useEffect } from "react";
import { useSessionContext } from "../../context/SessionContext";
import { DEMO_PERSONAS } from "../../data/demoPersonas";
import {
  Sparkles,
  User,
  Shield,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  FlaskConical,
  X,
} from "lucide-react";

export function DemoAutoFillWidget({ lang = "en" }) {
  const { state, applyDemoPersona, clearDemoData } = useSessionContext();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPersona = (personaId) => {
    applyDemoPersona(personaId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Persistent Top Demo Banner when demo data active */}
      {state.demoActive && (
        <div className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-navy-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between shadow-md z-40 animate-fadeIn">
          <div className="flex items-center gap-2 max-w-2xl truncate">
            <FlaskConical className="w-4 h-4 shrink-0 animate-pulse" />
            <span className="truncate">
              {lang === "hi" ? "🧪 डेमो मोड — सक्रिय टेस्ट डेटा (पर्सोना: " : "🧪 DEMO MODE — Test Data Active (Persona: "}
              <strong>{state.activePersona?.name || state.profile?.name || "Test User"}</strong> ·{" "}
              <span>{state.role}</span> · <span>{state.subsidiary}</span>)
            </span>
          </div>

          <button
            type="button"
            onClick={clearDemoData}
            className="px-2.5 py-0.5 rounded-lg bg-navy-950 text-amber-400 hover:bg-black font-extrabold text-[11px] flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow"
          >
            <Trash2 className="w-3 h-3" />
            <span>{lang === "hi" ? "डेमो डेटा रीसेट करें" : "Clear Demo Data"}</span>
          </button>
        </div>
      )}

      {/* Floating Demo Auto-Fill Button in Bottom-Right */}
      <div ref={menuRef} className="fixed bottom-5 right-5 z-50">
        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute bottom-14 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-500 shadow-2xl p-3 space-y-2 mb-2 animate-scaleUp z-50">
            <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  {lang === "hi" ? "6 भारतीय टेस्ट पर्सोना चुनें" : "Select Test Persona (6 Roles)"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 px-2">
              {lang === "hi"
                ? "किसी भी पर्सोना पर क्लिक करें — यह सभी 8 चरणों में डेटा ऑटो-फिल कर देगा।"
                : "Click any persona to auto-fill every field across all 8 steps and dashboard states."}
            </p>

            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {DEMO_PERSONAS.map((p) => {
                const isSelected = state.activePersona?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPersona(p.id)}
                    className={`w-full p-2.5 rounded-2xl text-left text-xs transition-all flex items-start justify-between gap-2 border cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500 text-navy-950 dark:text-amber-400 font-bold"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-amber-500 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>{p.avatar}</span>
                        <span className="text-slate-900 dark:text-white">{p.name}</span>
                        <span className="text-[10px] font-mono text-amber-500 uppercase px-1.5 py-0.2 rounded bg-amber-500/10">
                          {p.roleLabel || p.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {p.subsidiary} · {p.mineSiteName}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                        {p.description}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {state.demoActive && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={clearDemoData}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "डेमो डेटा साफ़ करें" : "Clear Demo Data"}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 px-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 font-black text-xs shadow-2xl flex items-center gap-2 border-2 border-amber-400 active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-navy-950 animate-spin" />
          <span>{lang === "hi" ? "⚡ डेमो ऑटो-फिल" : "⚡ Demo Auto-Fill"}</span>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
    </>
  );
}
