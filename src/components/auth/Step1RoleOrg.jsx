/**
 * ==============================================================================
 * STEP 1 — Role & Organization Selection
 * ==============================================================================
 * Landing screen capturing:
 * 1. Role: Mine Official | Corporate Management | Regulatory Authority | Contractor | Field Inspector | Worker
 * 2. Subsidiary: ECL | BCCL | CCL | WCL | NCL | SECL | MCL | CIL Corporate
 * 3. Mine Site/Area/Unit: Dependent dropdown populated strictly based on chosen subsidiary
 * All three stored in central `sessionContext.role`, `.subsidiary`, `.mineSite`.
 * ==============================================================================
 */

import React, { useState, useEffect } from "react";
import { useSessionContext } from "../../context/SessionContext";
import { ROLES, SUBSIDIARIES } from "../../data/rolesConfig";
import { Shield, Building2, MapPin, ArrowRight, CheckCircle2, UserCheck, AlertCircle, Sparkles } from "lucide-react";

export function Step1RoleOrg() {
  const { state, selectRoleAndOrg, goToStep, setAuthMode } = useSessionContext();

  const [selectedRole, setSelectedRole] = useState(state.role || "");
  const [selectedSub, setSelectedSub] = useState(state.subsidiary || "");
  const [selectedMine, setSelectedMine] = useState(state.mineSite || "");
  const [availableMines, setAvailableMines] = useState([]);

  // Sync state if demo persona applied or state updated
  useEffect(() => {
    if (state.role) setSelectedRole(state.role);
    if (state.subsidiary) setSelectedSub(state.subsidiary);
    if (state.mineSite) setSelectedMine(state.mineSite);
  }, [state.role, state.subsidiary, state.mineSite]);

  // Update dependent mine list when subsidiary changes
  useEffect(() => {
    if (selectedSub) {
      const subObj = SUBSIDIARIES.find((s) => s.id === selectedSub);
      if (subObj) {
        setAvailableMines(subObj.mines);
        // If current selected mine is not in new subsidiary list, reset it
        const exists = subObj.mines.some((m) => m.name === selectedMine || m.id === selectedMine);
        if (!exists && !state.demoActive) {
          setSelectedMine("");
        }
      }
    } else {
      setAvailableMines([]);
      setSelectedMine("");
    }
  }, [selectedSub, state.demoActive]);

  const isFormComplete = Boolean(selectedRole && selectedSub && selectedMine);

  const handleContinue = (e) => {
    e.preventDefault();
    if (!isFormComplete) return;

    const subObj = SUBSIDIARIES.find((s) => s.id === selectedSub);
    const mineObj = subObj?.mines.find((m) => m.name === selectedMine || m.id === selectedMine);
    const mineCode = mineObj?.code || selectedMine;

    selectRoleAndOrg(selectedRole, selectedSub, selectedMine, mineCode);
    goToStep(2);
  };

  const currentRoleDef = ROLES.find((r) => r.id === selectedRole);

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Step Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Step 1 of 4: Organization Mapping
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Select Your Mining Jurisdiction
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
          Establish your statutory operational zone under the Ministry of Coal & DGMS compliance grid.
        </p>
      </div>

      <form onSubmit={handleContinue} className="space-y-6">
        {/* Dropdown 1: Role Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-500" />
              1. Statutory Role Designation <span className="text-rose-500">*</span>
            </span>
          </label>
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:border-amber-500 focus:outline-none transition-all shadow-sm"
              required
            >
              <option value="">-- Choose Statutory Role --</option>
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label} — {r.description.slice(0, 45)}...
                </option>
              ))}
            </select>
          </div>
          {currentRoleDef && (
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 animate-fadeIn">
              <UserCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{currentRoleDef.label}:</span>{" "}
                {currentRoleDef.description}
              </div>
            </div>
          )}
        </div>

        {/* Dropdown 2: Subsidiary Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-500" />
              2. Coal Operating Subsidiary <span className="text-rose-500">*</span>
            </span>
          </label>
          <div className="relative">
            <select
              value={selectedSub}
              onChange={(e) => setSelectedSub(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:border-amber-500 focus:outline-none transition-all shadow-sm"
              required
            >
              <option value="">-- Select Coal India Subsidiary / Entity --</option>
              {SUBSIDIARIES.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} [HQ: {sub.hq}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dropdown 3: Dependent Mine Site Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              3. Mine Site / Colliery / Unit <span className="text-rose-500">*</span>
            </span>
          </label>
          <div className="relative">
            <select
              value={selectedMine}
              onChange={(e) => setSelectedMine(e.target.value)}
              disabled={!selectedSub}
              className={`w-full h-12 px-4 rounded-xl border-2 font-semibold focus:outline-none transition-all shadow-sm ${
                !selectedSub
                  ? "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-900 text-slate-400 cursor-not-allowed"
                  : "bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-amber-500"
              }`}
              required
            >
              <option value="">
                {!selectedSub
                  ? "← Select a subsidiary first"
                  : `-- Choose from ${availableMines.length} registered mines --`}
              </option>
              {availableMines.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} ({m.code}) — [{m.type}, {m.state}]
                </option>
              ))}
            </select>
          </div>
          {selectedSub && availableMines.length > 0 && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Dependent list synced for <span className="font-semibold text-amber-500">{selectedSub}</span>
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!isFormComplete}
            className={`w-full h-13 py-3.5 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
              isFormComplete
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 shadow-amber-500/20 active:scale-[0.99] cursor-pointer"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
            }`}
          >
            <span>Proceed to Step 2: Identity Verification</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Returning User Option */}
        <div className="pt-2 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already registered on CoalGov Platform?{" "}
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline ml-1"
            >
              Sign In (Step 5)
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
