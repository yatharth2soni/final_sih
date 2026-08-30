/**
 * ==============================================================================
 * STEP 4 — Permissions & Consent (Mobile App Simulation)
 * ==============================================================================
 * Security & compliance gate with 3 mandatory permission toggles:
 * 1. Location/GPS Access — "Needed to geo-tag field inspections and reports"
 * 2. Camera/Microphone Access — "Needed for OCR document scans and incident photo/video evidence"
 * 3. Offline Sync Acknowledgment — "Data recorded without network will sync automatically once connected"
 * User must toggle all three ON to complete registration.
 * ==============================================================================
 */

import React, { useState, useEffect } from "react";
import { useSessionContext } from "../../context/SessionContext";
import {
  MapPin,
  Camera,
  WifiOff,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Smartphone,
  Info,
} from "lucide-react";

export function Step4Permissions() {
  const { state, updatePermissions, goToStep, finalizeLoginSession } = useSessionContext();

  const [gps, setGps] = useState(state.permissions.gps || false);
  const [camera, setCamera] = useState(state.permissions.camera || false);
  const [offlineAck, setOfflineAck] = useState(state.permissions.offlineAck || false);

  // Sync if demo auto-fill applied
  useEffect(() => {
    if (state.permissions.gps) setGps(state.permissions.gps);
    if (state.permissions.camera) setCamera(state.permissions.camera);
    if (state.permissions.offlineAck) setOfflineAck(state.permissions.offlineAck);
  }, [state.permissions]);

  const allGranted = gps && camera && offlineAck;

  const handleGrantAll = () => {
    setGps(true);
    setCamera(true);
    setOfflineAck(true);
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!allGranted) return;

    updatePermissions({
      gps,
      camera,
      offlineAck,
    });

    // Advance to Session Initialization (Step 7) to generate SHA-256 and enter Dashboard (Step 8)
    await finalizeLoginSession();
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Step Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Step 4 of 4: Statutory Device Consents
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Field App Permissions & Safety Consent
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
          CoalGov requires statutory mobile consents to enable offline audit trails and geo-fenced pit inspections.
        </p>
      </div>

      {/* Quick Grant Helper */}
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={handleGrantAll}
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Grant All Permissions</span>
        </button>
      </div>

      <form onSubmit={handleCompleteRegistration} className="space-y-4">
        {/* Permission 1: Location/GPS */}
        <div
          onClick={() => setGps(!gps)}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            gps
              ? "bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-100"
              : "bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-lg ${gps ? "bg-emerald-500 text-navy-950" : "bg-slate-200 dark:bg-slate-800 text-slate-500"}`}>
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Location / GPS Geo-Tagging Access</span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    Mandatory
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Needed to geo-tag field inspections and reports within statutory pit boundary lines.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={gps}
              onChange={() => {}}
              className="w-5 h-5 mt-1 text-emerald-500 rounded focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Permission 2: Camera & Microphone */}
        <div
          onClick={() => setCamera(!camera)}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            camera
              ? "bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-100"
              : "bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-lg ${camera ? "bg-emerald-500 text-navy-950" : "bg-slate-200 dark:bg-slate-800 text-slate-500"}`}>
                <Camera className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Camera & Evidence OCR Capture</span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    Mandatory
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Needed for OCR document scans and incident photo/video evidence records under CMR 2017.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={camera}
              onChange={() => {}}
              className="w-5 h-5 mt-1 text-emerald-500 rounded focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Permission 3: Offline Encrypted Sync */}
        <div
          onClick={() => setOfflineAck(!offlineAck)}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            offlineAck
              ? "bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-100"
              : "bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-lg ${offlineAck ? "bg-emerald-500 text-navy-950" : "bg-slate-200 dark:bg-slate-800 text-slate-500"}`}>
                <WifiOff className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Offline Underground Sync Acknowledgment</span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    Mandatory
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Data recorded without network will sync automatically once connected to surface network.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={offlineAck}
              onChange={() => {}}
              className="w-5 h-5 mt-1 text-emerald-500 rounded focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Status Prompt */}
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            {allGranted
              ? "✓ All statutory consents granted. Ready to initialize authenticated session."
              : "Please toggle all 3 consents ON to satisfy onboarding compliance requirements."}
          </span>
        </div>

        {/* Buttons */}
        <div className="pt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => goToStep(3)}
            className="w-1/3 h-13 py-3 px-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            type="submit"
            disabled={!allGranted}
            className={`w-2/3 h-13 py-3.5 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
              allGranted
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-navy-950 font-extrabold shadow-emerald-500/20 active:scale-[0.99] cursor-pointer"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
            }`}
          >
            <span>Complete Registration & Launch</span>
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
