/**
 * ==============================================================================
 * STEP 8 — Role-Specific Dashboard Views
 * ==============================================================================
 * 1. Mine Official → Compliance Status cards + Inspection Schedule table + Telemetry
 * 2. Corporate Management → Multi-mine KPI summary cards (pan-India quotas)
 * 3. Regulatory Authority → Violation report list + Jurisdiction map & DGMS actions
 * 4. Contractor → Contract status card + Assigned workforce list + Fleet fitness
 * 5. Field Inspector → "Start New Inspection" button + Recent submissions list
 * 6. Worker → Attendance status card + "Submit Grievance / Hazard" button
 * ==============================================================================
 */

import React, { useState } from "react";
import {
  ShieldAlert,
  Building2,
  Landmark,
  Truck,
  ClipboardCheck,
  HardHat,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  Wind,
  Flame,
  Users,
  Calendar,
  FileText,
  Plus,
  Send,
  Sparkles,
  ExternalLink,
  Activity,
} from "lucide-react";

// ==============================================================================
// 1. MINE OFFICIAL DASHBOARD
// ==============================================================================
export function MineOfficialDashboard({ context, onLogObservation }) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Statutory Risk Index</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <ShieldAlert className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              74 <span className="text-sm font-semibold text-slate-400">/ 100</span>
            </div>
            <div className="text-xs font-bold text-amber-500 mt-1 flex items-center gap-1">
              <span>High Caution (CMR 108 Strata Watch)</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Methane (CH₄) Telemetry</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Flame className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              0.38%
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              Permissible limit: &lt;0.75% · Return Airway 2
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">CMR 108 Support Anchor</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Activity className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              8.2 <span className="text-sm font-semibold text-slate-400">Tonnes</span>
            </div>
            <div className="text-xs font-medium text-emerald-500 mt-1">
              ✓ Exceeds 6.0T statutory pull test threshold
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">On-Duty Workforce</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              342 <span className="text-sm font-semibold text-slate-400">Present</span>
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              Biometric gate pass verified · 3 crews active
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Inspection Schedule Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              Statutory Inspection Schedule & DGMS Compliance Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Assigned for {context.mineSite} ({context.subsidiary})
            </p>
          </div>
          <button
            type="button"
            onClick={onLogObservation}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Field Observation</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-3 px-3">INSPECTION ID</th>
                <th className="py-3 px-3">ZONE / SEAM</th>
                <th className="py-3 px-3">STATUTE</th>
                <th className="py-3 px-3">INSPECTOR</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3">DUE DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">INS-2026-8812</td>
                <td className="py-3 px-3">Panel B-3 Roof Strata</td>
                <td className="py-3 px-3">CMR Reg. 108</td>
                <td className="py-3 px-3">Er. Rajesh Verma</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                    Action Required
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-500">Today, 14:00</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">INS-2026-8810</td>
                <td className="py-3 px-3">Return Airway Velocity & CH4</td>
                <td className="py-3 px-3">CMR Reg. 140</td>
                <td className="py-3 px-3">Dr. K. S. Mukherjee</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    Passed (Compliant)
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-500">28 Feb 2026</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">INS-2026-8794</td>
                <td className="py-3 px-3">HEMM Dumper Reverse Proximity Radar</td>
                <td className="py-3 px-3">DGMS Circular 04/24</td>
                <td className="py-3 px-3">S. P. Singh</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                    Under Review
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-500">01 Mar 2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// 2. CORPORATE MANAGEMENT DASHBOARD
// ==============================================================================
export function CorporateDashboard({ context }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Pan-India Multi-Mine Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Monthly Despatch</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              4.82 <span className="text-sm font-semibold text-slate-400">MT</span>
            </div>
            <div className="text-xs font-bold text-emerald-500 mt-1">
              ↑ 8.4% vs monthly target
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Aggregate Safety Score</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldAlert className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              91.4%
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              Across 58 monitored CIL blocks
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">ESG & Dust Index</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Wind className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              112 <span className="text-sm font-semibold text-slate-400">µg/m³</span>
            </div>
            <div className="text-xs font-medium text-emerald-500 mt-1">
              ✓ MoEFCC permissible industrial baseline
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Active High-Risk Pits</span>
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              3 <span className="text-sm font-semibold text-slate-400">Collieries</span>
            </div>
            <div className="text-xs font-medium text-rose-500 mt-1">
              Under 24h DGMS remediation SLA
            </div>
          </div>
        </div>
      </div>

      {/* Subsidiary Performance Comparison Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-amber-500" />
          Coal India Subsidiary Compliance & Despatch Grid
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-3 px-3">SUBSIDIARY</th>
                <th className="py-3 px-3">ACTIVE MINES</th>
                <th className="py-3 px-3">SAFETY RATING</th>
                <th className="py-3 px-3">METHANE STATUS</th>
                <th className="py-3 px-3">FEB DESPATCH</th>
                <th className="py-3 px-3">AUDIT INTEGRITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">ECL (Eastern Coalfields)</td>
                <td className="py-3 px-3">14 Operating Pits</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">94.2% (Grade A)</span></td>
                <td className="py-3 px-3">0.24% (Safe)</td>
                <td className="py-3 px-3">0.94 MT</td>
                <td className="py-3 px-3 font-mono text-emerald-600">✓ Verified SHA-256</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">BCCL (Bharat Coking Coal)</td>
                <td className="py-3 px-3">18 Gassy / Fiery Pits</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold">81.0% (Caution)</span></td>
                <td className="py-3 px-3 text-rose-500 font-bold">0.68% (Gassy Seam)</td>
                <td className="py-3 px-3">1.12 MT</td>
                <td className="py-3 px-3 font-mono text-emerald-600">✓ Verified SHA-256</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">SECL (South Eastern)</td>
                <td className="py-3 px-3">22 Mega Opencast</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">96.8% (Grade A+)</span></td>
                <td className="py-3 px-3">0.14% (Safe)</td>
                <td className="py-3 px-3">2.45 MT</td>
                <td className="py-3 px-3 font-mono text-emerald-600">✓ Verified SHA-256</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// 3. REGULATORY AUTHORITY (DGMS) DASHBOARD
// ==============================================================================
export function RegulatorDashboard({ context }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* DGMS Statutory Enforcement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-500">Active DGMS Violation Notices</span>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
            6 <span className="text-sm font-semibold text-slate-400">Notices</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Form IV-B Show-Cause Escalations</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-500">Overdue CAPA Remediation</span>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            2 <span className="text-sm font-semibold text-slate-400">Critical</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Roof Bolt pull test SLA breach &gt;72h</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-500">Audited GIS Mine Boundaries</span>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            100%
          </div>
          <p className="text-xs text-slate-500 mt-1">Satellite slope stability calibrated</p>
        </div>
      </div>

      {/* Statutory Violation Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="w-5 h-5 text-amber-500" />
            DGMS Statutory Notice & Violation Registry
          </h3>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg bg-navy-900 text-amber-400 font-bold text-xs border border-amber-500/30 hover:border-amber-500"
          >
            + Draft Statutory Order
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-mono text-[10px] font-extrabold">
                  CRITICAL CMR 108
                </span>
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  Strata Pull Test Failure in Jhanjra Seam-VII
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Load cell measured 4.2 tonnes against 6.0T statutory mandate. Immediate propping required under Section 22(1).
              </p>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0">
              Issue Prohibition
            </button>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-navy-950 font-mono text-[10px] font-extrabold">
                  WARNING CMR 140
                </span>
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  CH4 Gas Fluctuation Spike (0.72%) at Tailgate Return
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Auxiliary ventilation fan operating at 80% baseline. 24h compliance report demanded.
              </p>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-navy-950 text-xs font-bold shrink-0">
              Request CAPA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// 4. CONTRACTOR DASHBOARD
// ==============================================================================
export function ContractorDashboard({ context }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-500">Contract Validity</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            Active · 24 Months
          </div>
          <p className="text-xs text-slate-500 mt-1">Work Order: WO-2024-AMR-902</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-500">Deployed Workforce</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            185 / 185
          </div>
          <p className="text-xs text-emerald-500 mt-1">100% DGMS Safety Induction Completed</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-500">Heavy Machinery Fitness</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            32 / 32
          </div>
          <p className="text-xs text-slate-500 mt-1">Dumpers, Excavators & Mist Cannons</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Truck className="w-5 h-5 text-amber-500" />
          Contractor Workforce Roster & Biometric Clearance
        </h3>
        <p className="text-xs text-slate-500">
          All workers verified via simulated UAN / EPFO & ESIC National Lookup.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-2.5 px-3">WORKER ID</th>
                <th className="py-2.5 px-3">NAME</th>
                <th className="py-2.5 px-3">TRADE / ROLE</th>
                <th className="py-2.5 px-3">UAN NO.</th>
                <th className="py-2.5 px-3">SHIFT</th>
                <th className="py-2.5 px-3">PPE STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-amber-600">WKR-4491</td>
                <td className="py-2.5 px-3">Ramesh Murmu</td>
                <td className="py-2.5 px-3">HEMM Dumper Operator</td>
                <td className="py-2.5 px-3 font-mono">100984712039</td>
                <td className="py-2.5 px-3">Morning</td>
                <td className="py-2.5 px-3 text-emerald-600">✓ Type-II Helmet Certified</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-amber-600">WKR-4492</td>
                <td className="py-2.5 px-3">Sunil Soren</td>
                <td className="py-2.5 px-3">Excavator Co-Pilot</td>
                <td className="py-2.5 px-3 font-mono">100984712040</td>
                <td className="py-2.5 px-3">Morning</td>
                <td className="py-2.5 px-3 text-emerald-600">✓ Type-II Helmet Certified</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// 5. FIELD INSPECTOR DASHBOARD
// ==============================================================================
export function InspectorDashboard({ context, onLogObservation }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-500">Registered Terminal</span>
          <div className="text-xl font-mono font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            {context.credentials?.deviceId || "DEV-554190"}
          </div>
          <p className="text-xs text-emerald-500 mt-1">✓ Geo-Fencing & Offline Sync Active</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-500">Assigned Pit Zone</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-2">
            {context.profile?.inspectionZone || "Jhanjra Continuous Miner Panel"}
          </div>
          <p className="text-xs text-slate-500 mt-1">Pit Coordinates: 23.65°N, 87.28°E</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase text-slate-500">Quick Field Action</span>
          <button
            type="button"
            onClick={onLogObservation}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-navy-950 font-extrabold text-xs shadow flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>+ Start New Pit Inspection</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-amber-500" />
          Recent Mobile Audit Submissions (Geo-Tagged & Offline-Synced)
        </h3>

        <div className="space-y-2.5">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div>
              <span className="font-mono font-bold text-amber-500">AUD-89104</span> ·{" "}
              <span className="font-semibold text-slate-900 dark:text-white">Water Barrier Exploratory Borehole</span>
              <p className="text-[11px] text-slate-500">Logged via GPS · 23.6512°N, 87.2841°E · Synced to DGMS Grid</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">✓ Synced</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div>
              <span className="font-mono font-bold text-amber-500">AUD-89098</span> ·{" "}
              <span className="font-semibold text-slate-900 dark:text-white">Tell-Tale Extensometer Convergence</span>
              <p className="text-[11px] text-slate-500">Underground offline cached · Auto-synced upon surface connection</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">✓ Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// 6. WORKER DASHBOARD
// ==============================================================================
export function WorkerDashboard({ context, onLogObservation }) {
  const [grievanceText, setGrievanceText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitGrievance = (e) => {
    e.preventDefault();
    if (!grievanceText.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setGrievanceText("");
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Attendance & Shift Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-500">Today's Attendance</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" />
            <span>Present (Shift Active)</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Biometric Check-in: 05:48 AM</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-500">Assigned Shift & Zone</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-2">
            {context.profile?.shift || "Morning Shift (06:00 - 14:00)"}
          </div>
          <p className="text-xs text-slate-500 mt-1">{context.mineSite || "Kusunda Open Cast"}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-500">Daily Safety Briefing</span>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
            "Always inspect bench slope berms before operating heavy dumpers. Wear Type-II safety helmets at all times."
          </div>
        </div>
      </div>

      {/* Worker Grievance & Hazard Reporting Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <HardHat className="w-5 h-5 text-amber-500" />
              Submit Safety Grievance / Report Unsafe Condition
            </h3>
            <p className="text-xs text-slate-500">
              Direct statutory channel to Colliery Safety Officer under Mines Act 1952.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5" />
            <span>✓ Grievance registered directly into DGMS safety registry (Ref: GRV-2026-8819). Safety Officer alerted!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmitGrievance} className="space-y-3">
            <textarea
              rows={3}
              required
              value={grievanceText}
              onChange={(e) => setGrievanceText(e.target.value)}
              placeholder="Describe any unsafe machinery vibration, gas odor, slippery haul road, or missing safety gear..."
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:border-amber-500 focus:outline-none transition-all"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Statutory Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
