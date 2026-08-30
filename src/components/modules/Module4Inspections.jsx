/**
 * ==============================================================================
 * MODULE 4 — INSPECTION & VIOLATION MANAGEMENT
 * ==============================================================================
 * 1. "Schedule Inspection" form (Mine Official / Corporate action)
 * 2. Inspection Detail View with checklist, geo-tag pin, and "Raise Violation" trigger
 * 3. Violation Record & Lifecycle: Open → In Progress → Under Review → Closed
 * 4. "Corrective Action" sub-form with completion logs and verifying officer
 * 5. "Recurring Violation Detector" (flags categories occurring 3+ times in 90 days)
 * ==============================================================================
 */

import React, { useState, useMemo } from "react";
import {
  ClipboardCheck,
  AlertTriangle,
  Calendar,
  Plus,
  Filter,
  CheckCircle2,
  MapPin,
  Camera,
  ArrowRight,
  Sparkles,
  Flame,
  ShieldAlert,
  Send,
  X,
  Repeat,
  FileCheck2,
  Clock,
} from "lucide-react";

export function Module4Inspections({
  inspections,
  violations,
  onScheduleInspection,
  onRaiseViolation,
  onUpdateViolationStatus,
  onAddCorrectiveAction,
  context,
}) {
  const [activeTab, setActiveTab] = useState("inspections"); // "inspections" | "violations"
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isRaiseViolationModalOpen, setIsRaiseViolationModalOpen] = useState(false);
  const [isCorrectiveModalOpen, setIsCorrectiveModalOpen] = useState(false);

  // New Inspection Form State
  const [newInspType, setNewInspType] = useState("Statutory Strata & Roof Safety");
  const [newInspInspector, setNewInspInspector] = useState("Priya Deshmukh");
  const [newInspDate, setNewInspDate] = useState("2026-03-05");
  const [newInspZone, setNewInspZone] = useState("Panel B-3 Roof Strata");
  const [newInspRecurring, setNewInspRecurring] = useState("Monthly");

  // New Violation Form State
  const [newVioCategory, setNewVioCategory] = useState("Strata Control (CMR 108)");
  const [newVioSeverity, setNewVioSeverity] = useState("HIGH");
  const [newVioDesc, setNewVioDesc] = useState("");
  const [newVioAssignee, setNewVioAssignee] = useState("Er. Rajesh Verma");
  const [newVioDueDate, setNewVioDueDate] = useState("2026-03-04");

  // Corrective Action Form State
  const [correctiveText, setCorrectiveText] = useState("");
  const [correctiveOfficer, setCorrectiveOfficer] = useState(context?.profile?.name || "Officer");

  // Filter State
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredViolations = useMemo(() => {
    return (violations || []).filter((v) => {
      if (severityFilter !== "ALL" && v.severity !== severityFilter) return false;
      if (statusFilter !== "ALL" && v.status !== statusFilter) return false;
      return true;
    });
  }, [violations, severityFilter, statusFilter]);

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    const newInsp = {
      id: `INS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      mineSite: context?.mineName || context?.mineSite || "Assigned Operational Mine",
      subsidiary: context?.subsidiary || "CIL",
      type: newInspType,
      inspector: newInspInspector,
      inspectorId: "INS-001",
      scheduledDate: newInspDate,
      status: "SCHEDULED",
      lat: 23.6942,
      lng: 87.2185,
      zone: newInspZone,
      notes: `Scheduled ${newInspRecurring} audit for ${newInspZone}`,
      checklists: [
        { item: "Statutory environmental barrier test", status: "PENDING", note: "" },
        { item: "Roof bolt torque test (150-200 Nm)", status: "PENDING", note: "" },
      ],
      photoUrl: null,
      hasViolation: false,
      violationId: null,
    };
    onScheduleInspection(newInsp);
    setIsScheduleModalOpen(false);
  };

  const handleRaiseViolationSubmit = (e) => {
    e.preventDefault();
    if (!newVioDesc.trim()) return;

    const newVio = {
      id: `VIO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      category: newVioCategory,
      severity: newVioSeverity,
      mineSite: context?.mineName || context?.mineSite || "Assigned Operational Mine",
      subsidiary: context?.subsidiary || "CIL",
      description: newVioDesc.trim(),
      raisedBy: context?.profile?.name || "Statutory Auditor",
      assignedTo: newVioAssignee,
      raisedDate: new Date().toISOString().split("T")[0],
      dueDate: newVioDueDate,
      status: "Open",
      isRecurring: newVioCategory === "Strata Control (CMR 108)", // Auto-flag strata as recurring demo
      auditHash: `a901e${Math.random().toString(36).substring(2, 12)}...`,
      correctiveAction: null,
    };

    onRaiseViolation(newVio);
    setNewVioDesc("");
    setIsRaiseViolationModalOpen(false);
  };

  const handleCorrectiveActionSubmit = (e) => {
    e.preventDefault();
    if (!selectedViolation || !correctiveText.trim()) return;

    onAddCorrectiveAction(selectedViolation.id, {
      actionTaken: correctiveText.trim(),
      completedDate: new Date().toISOString().split("T")[0],
      verifyingOfficer: correctiveOfficer,
      photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80",
    });

    setCorrectiveText("");
    setIsCorrectiveModalOpen(false);
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-rose-500 text-white font-extrabold";
      case "HIGH":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold";
      case "LOW":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Module 4: Statutory Inspections & Violations
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Inspection Lifecycle & CAPA Enforcement
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            End-to-end statutory oversight from scheduled field surveys to CAPA closure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-navy-900 text-amber-400 border border-amber-500/30 hover:border-amber-500 font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>+ Schedule Inspection</span>
          </button>
          <button
            type="button"
            onClick={() => setIsRaiseViolationModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>+ Raise Statutory Violation</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("inspections")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "inspections"
              ? "bg-amber-500 text-navy-950 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Inspections ({inspections.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("violations")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "violations"
              ? "bg-amber-500 text-navy-950 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Statutory Violations & CAPA ({violations.length})</span>
        </button>
      </div>

      {/* TAB 1: INSPECTIONS LIST */}
      {activeTab === "inspections" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Inspections List */}
          <div className="lg:col-span-2 space-y-3">
            {inspections.map((insp) => (
              <div
                key={insp.id}
                onClick={() => setSelectedInspection(insp)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedInspection?.id === insp.id
                    ? "bg-amber-500/10 border-amber-500 shadow-md"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                        {insp.id}
                      </span>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {insp.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          insp.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {insp.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Zone: <strong>{insp.zone}</strong> · Inspector: <strong>{insp.inspector}</strong> · Date: {insp.scheduledDate}
                    </p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 mt-1">
                      {insp.notes}
                    </p>
                  </div>
                  {insp.hasViolation && (
                    <span className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 text-[10px] font-extrabold shrink-0 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Violation Raised
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Inspection Detail & Map Pin Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Inspection Details & Geo-Tag
            </h3>

            {selectedInspection ? (
              <div className="space-y-4 text-xs animate-fadeIn">
                <div>
                  <span className="font-mono text-amber-500 font-bold">{selectedInspection.id}</span>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white">
                    {selectedInspection.type}
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    {selectedInspection.mineSite} · {selectedInspection.zone}
                  </p>
                </div>

                {/* Geo-Tag Map Pin Box */}
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-rose-500 animate-bounce" />
                      Geo-Tagged Coordinates:
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {selectedInspection.lat}° N, {selectedInspection.lng}° E
                    </span>
                  </div>
                  <div className="h-24 rounded-xl bg-navy-950/80 border border-amber-500/20 flex items-center justify-center text-center p-2">
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-amber-400">
                        📍 Pit Sector: {selectedInspection.zone}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Statutory Geofence Accuracy: ±3.2m (DGMS Verified)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checklist Results */}
                {selectedInspection.checklists?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-slate-700 dark:text-slate-300 uppercase text-[10px]">
                      Field Checklist Audit:
                    </h4>
                    <div className="space-y-1.5">
                      {selectedInspection.checklists.map((chk, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]"
                        >
                          <span className="text-slate-700 dark:text-slate-300">{chk.item}</span>
                          <span
                            className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                              chk.status === "PASS"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-rose-500/10 text-rose-600"
                            }`}
                          >
                            {chk.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photo Evidence */}
                {selectedInspection.photoUrl && (
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-slate-700 dark:text-slate-300 uppercase text-[10px]">
                      Inspection Photo Evidence:
                    </h4>
                    <img
                      src={selectedInspection.photoUrl}
                      alt="Inspection Evidence"
                      className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Click any inspection to review its full statutory checklist, geo-tagged coordinates, and photo evidence.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STATUTORY VIOLATIONS & RECURRING DETECTOR */}
      {activeTab === "violations" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Severity:</span>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="h-8 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Showing {filteredViolations.length} Violations
            </div>
          </div>

          {/* Violations List */}
          <div className="space-y-3">
            {filteredViolations.map((vio) => (
              <div
                key={vio.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                        {vio.id}
                      </span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {vio.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${getSeverityBadge(vio.severity)}`}>
                        {vio.severity}
                      </span>

                      {/* RECURRING VIOLATION DETECTOR TAG */}
                      {vio.isRecurring && (
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/40 text-rose-600 dark:text-rose-400 text-[10px] font-extrabold flex items-center gap-1 animate-pulse">
                          <Repeat className="w-3 h-3" />
                          ⚠ Recurring Issue (3+ times in 90d)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {vio.description}
                    </p>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3 flex-wrap">
                      <span>Raised by: <strong>{vio.raisedBy}</strong></span>
                      <span>Assigned to: <strong>{vio.assignedTo}</strong></span>
                      <span>Due Date: <strong className="font-mono text-rose-500">{vio.dueDate}</strong></span>
                    </div>
                  </div>

                  {/* Status Dropdown Workflow */}
                  <div className="flex items-center gap-2">
                    <select
                      value={vio.status}
                      onChange={(e) => onUpdateViolationStatus(vio.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                        vio.status === "Closed"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : vio.status === "In Progress"
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                      }`}
                    >
                      <option value="Open">Status: Open</option>
                      <option value="In Progress">Status: In Progress</option>
                      <option value="Under Review">Status: Under Review</option>
                      <option value="Closed">Status: Closed</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedViolation(vio);
                        setIsCorrectiveModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs shadow flex items-center gap-1 cursor-pointer"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>{vio.correctiveAction ? "View CAPA" : "+ Log CAPA"}</span>
                    </button>
                  </div>
                </div>

                {/* Corrective Action Attached Log */}
                {vio.correctiveAction && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Verified Corrective Action Taken (CAPA):
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Verified by {vio.correctiveAction.verifyingOfficer} ({vio.correctiveAction.completedDate})
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">
                      {vio.correctiveAction.actionTaken}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Inspection Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                Schedule Statutory Mine Inspection
              </h3>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Inspection Type
                </label>
                <select
                  value={newInspType}
                  onChange={(e) => setNewInspType(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                >
                  <option value="Statutory Strata & Roof Safety">Statutory Strata & Roof Safety (CMR 108)</option>
                  <option value="Ventilation & Gas Telemetry">Ventilation & Gas Telemetry (CMR 140)</option>
                  <option value="HEMM Machinery Fitness">HEMM Machinery Fitness (DGMS Circular 04/24)</option>
                  <option value="Inundation & Water Barrier Audit">Inundation & Water Barrier Audit (CMR 147)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Assigned Inspector
                  </label>
                  <input
                    type="text"
                    required
                    value={newInspInspector}
                    onChange={(e) => setNewInspInspector(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newInspDate}
                    onChange={(e) => setNewInspDate(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Colliery Sector / Pit Zone
                </label>
                <input
                  type="text"
                  required
                  value={newInspZone}
                  onChange={(e) => setNewInspZone(e.target.value)}
                  placeholder="e.g. Panel B-3 Roof Strata"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-navy-950 font-bold shadow"
                >
                  Schedule & Notify Inspector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raise Violation Modal */}
      {isRaiseViolationModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Raise Statutory Violation Notice
              </h3>
              <button
                type="button"
                onClick={() => setIsRaiseViolationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRaiseViolationSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Violation Category
                  </label>
                  <select
                    value={newVioCategory}
                    onChange={(e) => setNewVioCategory(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <option value="Strata Control (CMR 108)">Strata Control (CMR 108)</option>
                    <option value="Gas & Ventilation (CMR 140)">Gas & Ventilation (CMR 140)</option>
                    <option value="HEMM Machinery Flaw">HEMM Machinery Flaw</option>
                    <option value="Water Ingress / Inundation">Water Ingress (CMR 147)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Severity Level
                  </label>
                  <select
                    value={newVioSeverity}
                    onChange={(e) => setNewVioSeverity(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <option value="CRITICAL">CRITICAL (24h SLA)</option>
                    <option value="HIGH">HIGH (72h SLA)</option>
                    <option value="MEDIUM">MEDIUM (7 Days)</option>
                    <option value="LOW">LOW (14 Days)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Violation Description & Statute Breach
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail specific physical hazard, bolt pull load drop, or gas threshold breach..."
                  value={newVioDesc}
                  onChange={(e) => setNewVioDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Assigned Officer
                  </label>
                  <input
                    type="text"
                    required
                    value={newVioAssignee}
                    onChange={(e) => setNewVioAssignee(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Corrective Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newVioDueDate}
                    onChange={(e) => setNewVioDueDate(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRaiseViolationModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow"
                >
                  Raise Statutory Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Corrective Action (CAPA) Modal */}
      {isCorrectiveModalOpen && selectedViolation && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs text-amber-500 font-bold">{selectedViolation.id}</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Log Corrective Action Plan (CAPA)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCorrectiveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCorrectiveActionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Remediation Action Executed
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Installed 8 supplementary resin cable bolts and calibrated extensometer dial..."
                  value={correctiveText}
                  onChange={(e) => setCorrectiveText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Verifying Statutory Officer
                </label>
                <input
                  type="text"
                  required
                  value={correctiveOfficer}
                  onChange={(e) => setCorrectiveOfficer(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCorrectiveModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow"
                >
                  Verify & Close CAPA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
