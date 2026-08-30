/**
 * ==============================================================================
 * CoalGov Smart Governance Platform — Auth Container & Stepper Layout
 * ==============================================================================
 * Industrial Navy (#0B2545) and Amber (#F4A300) Theme Header, Stepper, and Canvas.
 * ==============================================================================
 */

import React from "react";
import { useSessionContext } from "../../context/SessionContext";
import { Step1RoleOrg } from "./Step1RoleOrg";
import { Step2Identity } from "./Step2Identity";
import { Step3Credentials } from "./Step3Credentials";
import { Step4Permissions } from "./Step4Permissions";
import { Step5Login } from "./Step5Login";
import { Step6TwoFactor } from "./Step6TwoFactor";
import { DemoAutoFillWidget } from "./DemoAutoFillWidget";
import { t } from "../../i18n";
import {
  Shield,
  Pickaxe,
  Building2,
  Lock,
  KeyRound,
  FileCheck,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  Globe,
} from "lucide-react";

export function AuthLayout({ isDark, toggleTheme, lang = "en", setLang }) {
  const { state, goToStep, setAuthMode } = useSessionContext();
  const { currentStep, authMode } = state;

  const registrationSteps = [
    {
      step: 1,
      label: lang === "hi" ? "अधिकार क्षेत्र" : "Jurisdiction",
      desc: lang === "hi" ? "भूमिका एवं खदान चयन" : "Role & Mine Selection",
    },
    {
      step: 2,
      label: lang === "hi" ? "पहचान सत्यापन" : "Identity",
      desc: lang === "hi" ? "वैधानिक सत्यापन" : "Statutory Verification",
    },
    {
      step: 3,
      label: lang === "hi" ? "क्रेडेंशियल" : "Credentials",
      desc: lang === "hi" ? "एक्सेस पासवर्ड एवं डिवाइस" : "Access Keys & Device",
    },
    {
      step: 4,
      label: lang === "hi" ? "सहमति" : "Consents",
      desc: lang === "hi" ? "अनुमतियाँ एवं जियो-टैगिंग" : "App & Geo-Tagging",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Government Portal Branding Bar */}
      <header className="w-full bg-navy-900 border-b border-amber-500/30 text-white py-3 px-4 sm:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-navy-950 font-black shadow-md shrink-0">
              <Shield className="w-6 h-6 text-navy-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  {t("appName", lang)}
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded bg-amber-500 text-navy-950">
                  {t("liveGrid", lang)}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {t("portalSubtitle", lang)}
              </p>
            </div>
          </div>

          {/* Theme & Language Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg bg-navy-950/80 border border-slate-700 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  lang === "en" ? "bg-amber-500 text-navy-950 font-bold shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("hi")}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  lang === "hi" ? "bg-amber-500 text-navy-950 font-bold shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                हिं
              </button>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-navy-950/80 border border-slate-700 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
              title="Toggle Light / Dark Mode"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        {/* Registration Stepper Bar (Only when in Registration Mode Steps 1-4) */}
        {authMode === "register" && currentStep <= 4 && (
          <div className="mb-8 hidden sm:block">
            <div className="grid grid-cols-4 gap-2">
              {registrationSteps.map((s) => {
                const isActive = currentStep === s.step;
                const isDone = currentStep > s.step;

                return (
                  <div
                    key={s.step}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      isActive
                        ? "bg-white dark:bg-slate-900 border-amber-500 shadow-md"
                        : isDone
                        ? "bg-slate-50 dark:bg-slate-900/60 border-emerald-500/60 text-slate-600 dark:text-slate-400"
                        : "bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80 text-slate-400 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          isDone
                            ? "bg-emerald-500 text-navy-950"
                            : isActive
                            ? "bg-amber-500 text-navy-950"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.step}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-black truncate">{s.label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {s.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step Card Views */}
        <div className="w-full">
          {currentStep === 1 && <Step1RoleOrg lang={lang} />}
          {currentStep === 2 && <Step2Identity lang={lang} />}
          {currentStep === 3 && <Step3Credentials lang={lang} />}
          {currentStep === 4 && <Step4Permissions lang={lang} />}
          {currentStep === 5 && <Step5Login lang={lang} />}
          {currentStep === 6 && <Step6TwoFactor lang={lang} />}
        </div>
      </main>

      {/* Floating Demo Persona Auto-Fill Widget */}
      <DemoAutoFillWidget lang={lang} />
    </div>
  );
}
