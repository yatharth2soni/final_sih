/**
 * ==============================================================================
 * MODULE 9 — MULTI-TENANT & MULTI-MINE ARCHITECTURE
 * ==============================================================================
 * 1. Multi-Tenant subsidiary and mine site isolation
 * 2. Cross-Mine Switcher for Corporate & Regulatory Roles
 * 3. "Admin: Onboard New Mine Site" form (Corporate Management privilege)
 * ==============================================================================
 */

import React, { useState } from "react";
import {
  Building2,
  MapPin,
  Plus,
  CheckCircle2,
  Sparkles,
  Layers,
  Shield,
  ExternalLink,
} from "lucide-react";
import { SUBSIDIARIES } from "../../data/rolesConfig";

export function Module9MultiTenant({ context, onSwitchMine, onAddNewMine }) {
  const [isAddMineModalOpen, setIsAddMineModalOpen] = useState(false);
  const [newMineName, setNewMineName] = useState("");
  const [newMineCode, setNewMineCode] = useState("");
  const [newMineSub, setNewMineSub] = useState("ECL");
  const [newMineType, setNewMineType] = useState("Opencast");
  const [newMineState, setNewMineState] = useState("West Bengal");

  const handleAddMineSubmit = (e) => {
    e.preventDefault();
    if (!newMineName.trim() || !newMineCode.trim()) return;

    onAddNewMine({
      id: newMineCode.trim(),
      name: newMineName.trim(),
      code: newMineCode.trim(),
      type: newMineType,
      state: newMineState,
      subsidiary: newMineSub,
    });

    setNewMineName("");
    setNewMineCode("");
    setIsAddMineModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Module 9: Multi-Tenant & Multi-Mine Architecture
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Subsidiary Tenant Isolation & Multi-Site Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enables hierarchical access separation across CIL subsidiaries and onboards new collieries dynamically.
          </p>
        </div>

        {/* Corporate Privilege Action */}
        {(context?.role === "Corporate Management" || context?.role === "Regulatory Authority") && (
          <button
            type="button"
            onClick={() => setIsAddMineModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Admin: Onboard New Mine Site</span>
          </button>
        )}
      </div>

      {/* Subsidiary Tenant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SUBSIDIARIES.map((sub) => {
          const isActive = context?.subsidiary === sub.id;
          return (
            <div
              key={sub.id}
              className={`p-5 rounded-3xl border-2 transition-all space-y-3 ${
                isActive
                  ? "bg-amber-500/10 border-amber-500 shadow-md"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                  {sub.id}
                </span>
                {isActive && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-navy-950 text-[10px] font-extrabold">
                    Active Tenant
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {sub.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">HQ: {sub.hq}</p>
              </div>

              {/* Mines List */}
              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  {sub.mines.length} Monitored Units:
                </span>
                <div className="space-y-1">
                  {sub.mines.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => onSwitchMine && onSwitchMine(sub.id, m.name, m.code)}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${
                        context?.mineSite === m.name
                          ? "bg-amber-500 text-navy-950 font-bold"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="truncate">{m.name}</span>
                      <span className="text-[10px] font-mono opacity-80">{m.type.slice(0, 2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Onboard New Mine Modal */}
      {isAddMineModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                Admin: Onboard New Colliery / Pit Site
              </h3>
              <button
                type="button"
                onClick={() => setIsAddMineModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMineSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Colliery / Mine Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Karanpura Coal Pit"
                  value={newMineName}
                  onChange={(e) => setNewMineName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Statutory Mine Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CCL-NKP-01"
                    value={newMineCode}
                    onChange={(e) => setNewMineCode(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Subsidiary
                  </label>
                  <select
                    value={newMineSub}
                    onChange={(e) => setNewMineSub(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    {SUBSIDIARIES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id} — {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Mine Type
                  </label>
                  <select
                    value={newMineType}
                    onChange={(e) => setNewMineType(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <option value="Opencast">Opencast</option>
                    <option value="Underground">Underground (Gassy)</option>
                    <option value="Continuous Longwall">Continuous Longwall</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    State Jurisdiction
                  </label>
                  <input
                    type="text"
                    required
                    value={newMineState}
                    onChange={(e) => setNewMineState(e.target.value)}
                    placeholder="e.g. Jharkhand"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMineModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-navy-950 font-bold shadow"
                >
                  Onboard Mine Site Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
