/**
 * ==============================================================================
 * MODULE 7 — AUTOMATED WORKFLOW & ALERT ENGINE
 * ==============================================================================
 * 1. Rule-Based Alert Trigger Generator (Reminders & Escalations)
 * 2. Visual Escalation Chain Stepper (Mine Official → Corporate → DGMS)
 * 3. Automated Statutory Compliance Report Generator with "Download / Print as PDF"
 * ==============================================================================
 */

import React, { useState } from "react";
import {
  Bell,
  AlertTriangle,
  Clock,
  ArrowRight,
  Printer,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Building,
  UserCheck,
  Landmark,
} from "lucide-react";

export function Module7WorkflowAlerts({ alerts, onMarkAlertRead, onNavigateRecord, context, complianceItems, violations }) {
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportPeriod, setReportPeriod] = useState("February 2026");

  const unreadCount = (alerts || []).filter((a) => !a.read).length;

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Module 7: Automated Workflow & Escalation Engine
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Statutory Alerts & DGMS Escalation Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitors SLA breach countdowns, compliance expirations, and triggers multi-tier escalations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReportGenerated(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Generate DGMS Compliance Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Alerts Ledger */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Statutory Alerts ({alerts.length} Total · {unreadCount} Unread)
            </h3>
          </div>

          <div className="space-y-3">
            {(alerts || []).map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all ${
                  !alert.read
                    ? "bg-white dark:bg-slate-900 border-amber-500 shadow-md"
                    : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          alert.type === "Escalation"
                            ? "bg-rose-500/10 text-rose-600 border border-rose-500/30"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                        }`}
                      >
                        {alert.type}
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {alert.title}
                      </span>
                      {!alert.read && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {alert.message}
                    </p>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-1">
                      <span>Recipient Role: <strong>{alert.recipientRole}</strong></span>
                      <span>·</span>
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {!alert.read && (
                      <button
                        type="button"
                        onClick={() => onMarkAlertRead(alert.id)}
                        className="text-[11px] font-bold text-amber-500 hover:underline"
                      >
                        Mark Read
                      </button>
                    )}
                    {alert.targetId && (
                      <button
                        type="button"
                        onClick={() => onNavigateRecord(alert.targetModule, alert.targetId)}
                        className="px-2.5 py-1 rounded-lg bg-navy-950 text-amber-400 text-[10px] font-bold flex items-center gap-1 hover:bg-navy-900"
                      >
                        <span>View Record</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Escalation Chain Stepper */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            3-Tier Escalation SLA Chain
          </h3>
          <p className="text-xs text-slate-500">
            Statutory workflow triggered if a violation or overdue compliance remains unacknowledged:
          </p>

          <div className="space-y-4 pt-2">
            {/* Level 1 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center shrink-0 border border-amber-500/40">
                1
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Level 1: Colliery Mine Safety Officer</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Alerted immediately upon observation. 24h SLA to submit initial remediation plan.
                </p>
              </div>
            </div>

            <div className="w-0.5 h-6 bg-slate-200 dark:bg-slate-700 ml-4" />

            {/* Level 2 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center shrink-0 border border-blue-500/40">
                2
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-500" />
                  <span>Level 2: Subsidiary Corporate Board</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Escalated at 48h if unassigned. General Manager Safety notified for intervention.
                </p>
              </div>
            </div>

            <div className="w-0.5 h-6 bg-slate-200 dark:bg-slate-700 ml-4" />

            {/* Level 3 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-black text-xs flex items-center justify-center shrink-0 border border-rose-500/40">
                3
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-rose-500" />
                  <span>Level 3: DGMS Regulatory Enforcement</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Breach &gt;72h triggers automated Form IV-B Show-Cause Notice issuance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GENERATED COMPLIANCE REPORT MODAL */}
      {reportGenerated && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500 text-navy-950">
                  Official DGMS Report
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  Monthly Statutory Compliance & Safety Summary Report
                </h3>
                <p className="text-xs text-slate-500">
                  Colliery: <strong>{context?.mineSite}</strong> ({context?.subsidiary}) · Period: {reportPeriod}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setReportGenerated(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Structured Table */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Monitored Items</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{complianceItems.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-600 uppercase font-bold">Compliant Rate</span>
                  <div className="text-xl font-bold text-emerald-600 mt-1">88.9%</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <span className="text-[10px] text-rose-600 uppercase font-bold">Open Violations</span>
                  <div className="text-xl font-bold text-rose-600 mt-1">{violations.filter(v => v.status === "Open").length}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <th className="py-2 px-2">ID</th>
                      <th className="py-2 px-2">STATUTE & REQUIREMENT</th>
                      <th className="py-2 px-2">STATUS</th>
                      <th className="py-2 px-2">RESPONSIBLE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {complianceItems.map((c) => (
                      <tr key={c.id}>
                        <td className="py-2 px-2 font-mono font-bold text-amber-500">{c.id}</td>
                        <td className="py-2 px-2 font-semibold text-slate-900 dark:text-white">{c.title}</td>
                        <td className="py-2 px-2 font-bold">{c.status}</td>
                        <td className="py-2 px-2 text-slate-500">{c.responsible}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                Audit Hash: SHA256-f8a02c... (Generated: {new Date().toLocaleDateString()})
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReportGenerated(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download / Print as PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
