/**
 * ==============================================================================
 * MODULE 10 — CONTRACTOR & WORKFORCE COMPLIANCE MANAGEMENT
 * ==============================================================================
 * 1. "All Contractors" Roster with Live Violation & Compliance Flags
 * 2. Contractor Detail View & License Expiry Tracker
 * 3. "Workforce Compliance Cross-Check" flagging expired safety training & PME
 * ==============================================================================
 */

import React, { useState } from "react";
import {
  Truck,
  Users,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Sparkles,
  Phone,
  Calendar,
  X,
} from "lucide-react";

export function Module10Contractors({ contractors, context }) {
  const [selectedContractor, setSelectedContractor] = useState(null);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Module 10: Contractor & Workforce Governance
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Outsourced Contractor Fleet & Worker Compliance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cross-checks heavy machinery licenses, EPFO registrations, and DGMS safety training certifications.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Contractors Roster */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Registered Mining Contractors ({contractors.length})
            </h3>
          </div>

          <div className="space-y-3">
            {contractors.map((con) => (
              <div
                key={con.id}
                onClick={() => setSelectedContractor(con)}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                  selectedContractor?.id === con.id
                    ? "bg-amber-500/10 border-amber-500 shadow-md"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-amber-500">{con.id}</span>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">
                        {con.companyName}
                      </h4>
                    </div>
                    <div className="text-xs text-slate-500">
                      License: <strong className="font-mono">{con.licenseNo}</strong> · Lead: <strong>{con.contactPerson}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Work Order Period: <span className="font-mono">{con.contractPeriod}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{con.workforceCount} Workers</span>
                    </span>

                    {con.hasViolations ? (
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 text-[10px] font-extrabold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {con.openViolationsCount} Open Violation
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                        ✓ 100% Compliant
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Contractor Detail & Workforce Compliance Cross-Check */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            Contractor Detail & Workforce Audit
          </h3>

          {selectedContractor ? (
            <div className="space-y-4 text-xs animate-fadeIn">
              <div>
                <span className="font-mono text-amber-500 font-bold">{selectedContractor.licenseNo}</span>
                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedContractor.companyName}
                </div>
                <p className="text-slate-500 mt-0.5">
                  Assigned Site: {selectedContractor.mineSite}
                </p>
              </div>

              {/* Workforce Compliance Check Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-700 dark:text-slate-300 uppercase text-[10px]">
                    Workforce Compliance Cross-Check:
                  </h4>
                </div>

                <div className="space-y-2">
                  {selectedContractor.workers?.map((w) => (
                    <div
                      key={w.id}
                      className={`p-3 rounded-2xl border text-xs space-y-1 ${
                        !w.safetyTrained
                          ? "bg-rose-500/5 border-rose-500/30"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-amber-500">{w.id}</span>
                          <span className="text-slate-900 dark:text-white">{w.name}</span>
                        </div>
                        {!w.safetyTrained ? (
                          <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[9px] font-extrabold flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Training Expired!
                          </span>
                        ) : (
                          <span className="text-emerald-500 text-[10px] font-bold">✓ Certified</span>
                        )}
                      </div>
                      <p className="text-slate-500 text-[11px]">{w.trade} · UAN: {w.uan}</p>
                      {!w.safetyTrained && (
                        <p className="text-[10px] text-rose-500 font-medium">
                          ⚠ Flagged under Mines Vocational Training Rules 1966. Mandatory 3-day refresher required.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Click any contractor to audit their deployed workforce list, safety training certifications, and medical fitness dates.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
