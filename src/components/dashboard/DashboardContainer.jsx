/**
 * ==============================================================================
 * MASTER OPERATIONS HUB (MODULES 1 TO 11 INTEGRATION & BILINGUAL ENGINE)
 * ==============================================================================
 * - Full English / Hindi toggle functionality
 * - Centralized state synchronization across all 11 modules
 * - Role-based permission controls
 * ==============================================================================
 */

import React, { useState, useMemo } from "react";
import { useSessionContext } from "../../context/SessionContext";
import {
  MineOfficialDashboard,
  CorporateDashboard,
  RegulatorDashboard,
  ContractorDashboard,
  InspectorDashboard,
  WorkerDashboard,
} from "./RoleDashboards";
import { Module3Compliance } from "../modules/Module3Compliance";
import { Module4Inspections } from "../modules/Module4Inspections";
import { Module5RiskAnalytics } from "../modules/Module5RiskAnalytics";
import { Module6MobileReporting } from "../modules/Module6MobileReporting";
import { Module7WorkflowAlerts } from "../modules/Module7WorkflowAlerts";
import { Module8DocumentOCR } from "../modules/Module8DocumentOCR";
import { Module9MultiTenant } from "../modules/Module9MultiTenant";
import { Module10Contractors } from "../modules/Module10Contractors";
import { Module11ChatAssistant } from "../modules/Module11ChatAssistant";
import { GisMap } from "../GisMap";
import { SessionTimerManager } from "../auth/SessionTimerManager";
import { DemoAutoFillWidget } from "../auth/DemoAutoFillWidget";
import { INDIAN_MINES_MASTER } from "../../data/indianMinesMaster";
import { SUBSIDIARIES } from "../../data/mockData";
import { t, translateStatus } from "../../i18n";
import {
  INITIAL_COMPLIANCE_ITEMS,
  INITIAL_INSPECTIONS,
  INITIAL_VIOLATIONS,
  INITIAL_DOCUMENTS,
  INITIAL_CONTRACTORS,
  INITIAL_ALERTS,
} from "../../data/mockData";
import {
  Shield,
  LayoutDashboard,
  ShieldCheck,
  ClipboardCheck,
  Activity,
  Smartphone,
  Map,
  Bell,
  FileText,
  Building2,
  Truck,
  Bot,
  LogOut,
  Sun,
  Moon,
  Copy,
  Check,
  FileCheck2,
  ChevronDown,
  Globe,
} from "lucide-react";

export function DashboardContainer({ isDark, toggleTheme, lang, setLang }) {
  const { state, selectRoleAndOrg, logoutUser } = useSessionContext();

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | compliance | inspections | analytics | fieldReport | gis | alerts | documents | tenants | contractors
  const [copiedHash, setCopiedHash] = useState(false);

  // State Stores (Synced & Modifiable)
  const [complianceItems, setComplianceItems] = useState(INITIAL_COMPLIANCE_ITEMS);
  const [inspections, setInspections] = useState(INITIAL_INSPECTIONS);
  const [violations, setViolations] = useState(INITIAL_VIOLATIONS);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [contractors, setContractors] = useState(INITIAL_CONTRACTORS);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  // Cross-Mine Switcher Dropdown (for Corporate & Regulator)
  const [isMineSwitcherOpen, setIsMineSwitcherOpen] = useState(false);

  const unreadAlertsCount = useMemo(() => alerts.filter((a) => !a.read).length, [alerts]);

  // Handler: Update Compliance Status
  const handleUpdateComplianceStatus = (id, newStatus) => {
    setComplianceItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: newStatus,
            history: [
              {
                date: new Date().toISOString().split("T")[0],
                action: `Status updated to ${newStatus}`,
                status: newStatus,
                officer: state.profile?.name || "Statutory Officer",
                hash: `0x${Math.random().toString(36).substring(2, 14)}`,
              },
              ...(item.history || []),
            ],
          };
        }
        return item;
      })
    );
  };

  // Handler: Schedule New Inspection
  const handleScheduleInspection = (newInsp) => {
    setInspections([newInsp, ...inspections]);
  };

  // Handler: Raise Violation
  const handleRaiseViolation = (newVio) => {
    setViolations([newVio, ...violations]);
    const newAlert = {
      id: `ALT-${Date.now()}`,
      type: "Escalation",
      recipientRole: "corporate",
      title: `Critical Violation SLA: ${newVio.category}`,
      message: newVio.description,
      timestamp: "Just now",
      read: false,
      targetModule: "inspections",
      targetId: newVio.id,
      escalationLevel: 2,
    };
    setAlerts([newAlert, ...alerts]);
  };

  // Handler: Update Violation Status
  const handleUpdateViolationStatus = (id, newStatus) => {
    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    );
  };

  // Handler: Add Corrective Action (CAPA)
  const handleAddCorrectiveAction = (id, capaData) => {
    setViolations((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: "Closed", correctiveAction: capaData } : v
      )
    );
  };

  // Handler: Add Document (OCR commit)
  const handleAddDocument = (newDoc) => {
    setDocuments([newDoc, ...documents]);
  };

  // Handler: Mark Alert Read
  const handleMarkAlertRead = (id) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  // Handler: Navigate from Alert / Chatbot
  const handleNavigateRecord = (moduleName, recordId) => {
    if (moduleName === "compliance") setActiveTab("compliance");
    else if (moduleName === "inspections") setActiveTab("inspections");
    else if (moduleName === "contractors") setActiveTab("contractors");
    else if (moduleName === "dashboard") setActiveTab("dashboard");
    else if (moduleName === "telemetry") setActiveTab("analytics");
  };

  // Handler: Switch Mine Site (Corporate / Regulator)
  const handleSwitchMine = (subId, mineName, mineCode) => {
    selectRoleAndOrg(state.role, subId, mineName, mineCode);
    setIsMineSwitcherOpen(false);
  };

  // Handler: Add New Mine Site (Admin)
  const handleAddNewMine = (newMineObj) => {
    const sub = SUBSIDIARIES.find((s) => s.id === newMineObj.subsidiary || s.code === newMineObj.subsidiary);
    if (sub) {
      sub.mines.push(newMineObj);
      handleSwitchMine(newMineObj.subsidiary, newMineObj.name, newMineObj.code);
    }
  };

  const handleCopyAuditHash = () => {
    if (state.session.auditHash) {
      navigator.clipboard.writeText(state.session.auditHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const formattedLoginTime = useMemo(() => {
    if (!state.session.loginTimestamp) return lang === "hi" ? "अभी-अभी" : "Just now";
    try {
      const d = new Date(state.session.loginTimestamp);
      return d.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return state.session.loginTimestamp;
    }
  }, [state.session.loginTimestamp, lang]);

  const userName = state.profile?.name || state.credentials?.mobile || "Authorized Officer";
  const userRole = state.role || "mine_official";
  const auditHash = state.session.auditHash || "0x8f90c3a21b44e77a";
  const canSwitchMine =
    userRole === "corporate" ||
    userRole === "regulator" ||
    userRole === "Corporate Management" ||
    userRole === "Regulatory Authority";

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Universal Governance Header */}
      <header className="w-full bg-navy-900 border-b border-amber-500/30 text-white sticky top-0 z-30 shadow-lg backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Brand Logo & Context */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-navy-950 font-black shadow-md shrink-0">
                <Shield className="w-6 h-6 text-navy-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black tracking-tight text-white">
                    {t("appName", lang)}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500 text-navy-950 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-950 animate-ping" />
                    {t("liveGrid", lang)}
                  </span>
                </div>

                {/* Subtitle / Mine Switcher */}
                <div className="text-[11px] text-slate-300 font-medium flex items-center gap-2 flex-wrap">
                  {canSwitchMine ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsMineSwitcherOpen(!isMineSwitcherOpen)}
                        className="text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{state.mineSite || "Gevra Open Cast"}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>

                      {isMineSwitcherOpen && (
                        <div className="absolute top-6 left-0 w-72 bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-500 shadow-2xl p-2 z-50 max-h-64 overflow-y-auto">
                          <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                            {t("switchMine", lang)}:
                          </div>
                          {SUBSIDIARIES.map((sub) => (
                            <div key={sub.id} className="py-1">
                              <div className="text-[10px] font-bold text-amber-500 px-2">{sub.name}</div>
                              {sub.mines.map((m) => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => handleSwitchMine(sub.code || sub.id, m.name, m.code)}
                                  className={`w-full text-left px-2 py-1 rounded text-xs hover:bg-slate-100 dark:hover:bg-slate-800 ${
                                    state.mineSite === m.name ? "font-bold text-amber-500" : "text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  {m.name} ({m.code})
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-amber-400 font-bold">{state.mineSite || "Gevra Open Cast"}</span>
                  )}
                  <span>·</span>
                  <span>{state.subsidiary || "SECL"}</span>
                  <span>·</span>
                  <span className="font-mono text-slate-400">{state.mineSiteCode || "SECL-GEV-01"}</span>
                </div>
              </div>
            </div>

            {/* Profile Info, Language Toggle, Notification Bell & Header Actions */}
            <div className="flex items-center gap-3">
              {/* Language Switcher Button */}
              <div className="flex items-center rounded-lg bg-navy-950/80 border border-slate-700 p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    lang === "en" ? "bg-amber-500 text-navy-950 shadow-sm" : "text-slate-300 hover:text-white"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang("hi")}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    lang === "hi" ? "bg-amber-500 text-navy-950 shadow-sm" : "text-slate-300 hover:text-white"
                  }`}
                >
                  हिं
                </button>
              </div>

              {/* Notification Bell */}
              <button
                type="button"
                onClick={() => setActiveTab("alerts")}
                className="relative p-2 rounded-xl bg-navy-950/80 border border-slate-700 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                title="Statutory Alerts & Escalations"
              >
                <Bell className="w-5 h-5" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-black flex items-center justify-center shadow">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>

              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                  <span>{userName}</span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500 text-navy-950 uppercase">
                    {userRole}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {t("lastLogin", lang)}: <span className="font-mono text-slate-300">{formattedLoginTime}</span>
                </div>
              </div>

              {/* Theme & Sign Out */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-navy-950/80 border border-slate-700 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                  title="Toggle Light / Dark Mode"
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={logoutUser}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t("signOut", lang)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Audit ID Bar */}
        <div className="w-full bg-navy-950/90 border-t border-slate-800/80 px-4 sm:px-8 py-1.5 text-xs text-slate-400 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 truncate max-w-3xl">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5" />
              {t("blockchainAuditId", lang)}:
            </span>
            <span className="font-mono text-[11px] text-slate-300 truncate">{auditHash}</span>
            <button
              type="button"
              onClick={handleCopyAuditHash}
              className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
              title="Copy SHA-256 Audit Hash"
            >
              {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t("cryptographicVerified", lang)}</span>
          </div>
        </div>
      </header>

      {/* Main Multi-Module Navigation Tabs */}
      <nav className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-18 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-2">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-amber-500 text-navy-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{t("navDashboard", lang)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("compliance")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === "compliance"
                ? "bg-amber-500 text-navy-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t("navCompliance", lang)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inspections")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === "inspections"
                ? "bg-amber-500 text-navy-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>{t("navInspections", lang)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-amber-500 text-navy-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t("navAnalytics", lang)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("fieldReport")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === "fieldReport"
                ? "bg-amber-500 text-navy-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t("navFieldReport", lang)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gis")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === "gis"
                ? "bg-amber-500 text-navy-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>{t("navGis", lang)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("alerts")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === "alerts"
                ? "bg-amber-500 text-navy-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{t("navAlerts", lang)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === "documents"
                ? "bg-amber-500 text-navy-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t("navDocuments", lang)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tenants")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === "tenants"
                ? "bg-amber-500 text-navy-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t("navTenants", lang)}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("contractors")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeTab === "contractors"
                ? "bg-amber-500 text-navy-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{t("navContractors", lang)}</span>
          </button>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {/* VIEW 1: ROLE-SPECIFIC OVERVIEW DASHBOARD */}
        {activeTab === "dashboard" && (
          <div>
            {(userRole === "mine_official" || userRole === "Mine Official") && (
              <MineOfficialDashboard
                context={state}
                onLogObservation={() => setActiveTab("fieldReport")}
              />
            )}
            {(userRole === "corporate" || userRole === "Corporate Management") && (
              <CorporateDashboard context={state} />
            )}
            {(userRole === "regulator" || userRole === "Regulatory Authority") && (
              <RegulatorDashboard context={state} />
            )}
            {(userRole === "contractor" || userRole === "Contractor") && (
              <ContractorDashboard context={state} />
            )}
            {(userRole === "field_inspector" || userRole === "Field Inspector") && (
              <InspectorDashboard
                context={state}
                onLogObservation={() => setActiveTab("fieldReport")}
              />
            )}
            {(userRole === "worker" || userRole === "Worker") && (
              <WorkerDashboard
                context={state}
                onLogObservation={() => setActiveTab("fieldReport")}
              />
            )}
          </div>
        )}

        {/* VIEW 2: MODULE 3 COMPLIANCE TRACKING ENGINE */}
        {activeTab === "compliance" && (
          <Module3Compliance
            complianceItems={complianceItems}
            onUpdateStatus={handleUpdateComplianceStatus}
            context={state}
            onOpenDoc={() => setActiveTab("documents")}
            lang={lang}
          />
        )}

        {/* VIEW 3: MODULE 4 INSPECTIONS & VIOLATIONS */}
        {activeTab === "inspections" && (
          <Module4Inspections
            inspections={inspections}
            violations={violations}
            onScheduleInspection={handleScheduleInspection}
            onRaiseViolation={handleRaiseViolation}
            onUpdateViolationStatus={handleUpdateViolationStatus}
            onAddCorrectiveAction={handleAddCorrectiveAction}
            context={state}
            lang={lang}
          />
        )}

        {/* VIEW 4: MODULE 5 AI RISK & ANALYTICS ENGINE */}
        {activeTab === "analytics" && (
          <Module5RiskAnalytics
            complianceItems={complianceItems}
            violations={violations}
            context={state}
            lang={lang}
          />
        )}

        {/* VIEW 5: MODULE 6 MOBILE FIELD REPORTING */}
        {activeTab === "fieldReport" && (
          <Module6MobileReporting
            context={state}
            onAddObservation={(obs) => {}}
            lang={lang}
          />
        )}

        {/* VIEW 6: GIS & SATELLITE MAP */}
        {activeTab === "gis" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Map className="w-5 h-5 text-amber-500" />
                  {t("navGis", lang)}
                </h3>
                <p className="text-xs text-slate-500">
                  Targeted viewport: <strong className="text-amber-500">{state.mineSite || "Gevra Open Cast"}</strong> ({state.subsidiary || "SECL"})
                </p>
              </div>
            </div>
            <div className="h-[600px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <GisMap
                mines={INDIAN_MINES_MASTER}
                selectedMineId={state.mineSiteCode || "SECL-GEV-01"}
                language={lang}
              />
            </div>
          </div>
        )}

        {/* VIEW 7: MODULE 7 WORKFLOW & ESCALATION ALERTS */}
        {activeTab === "alerts" && (
          <Module7WorkflowAlerts
            alerts={alerts}
            onMarkAlertRead={handleMarkAlertRead}
            onNavigateRecord={handleNavigateRecord}
            context={state}
            complianceItems={complianceItems}
            violations={violations}
            lang={lang}
          />
        )}

        {/* VIEW 8: MODULE 8 DOCUMENT OCR & BLOCKCHAIN AUDIT */}
        {activeTab === "documents" && (
          <Module8DocumentOCR
            documents={documents}
            onAddDocument={handleAddDocument}
            context={state}
            violations={violations}
            lang={lang}
          />
        )}

        {/* VIEW 9: MODULE 9 MULTI-TENANT ARCHITECTURE */}
        {activeTab === "tenants" && (
          <Module9MultiTenant
            context={state}
            onSwitchMine={handleSwitchMine}
            onAddNewMine={handleAddNewMine}
            lang={lang}
          />
        )}

        {/* VIEW 10: MODULE 10 CONTRACTORS & WORKFORCE */}
        {activeTab === "contractors" && (
          <Module10Contractors
            contractors={contractors}
            context={state}
            lang={lang}
          />
        )}
      </main>

      {/* Floating Module 11 Chatbot in Bottom-Left */}
      <Module11ChatAssistant
        context={state}
        complianceItems={complianceItems}
        inspections={inspections}
        violations={violations}
        onNavigateTab={(tab) => setActiveTab(tab)}
        lang={lang}
      />

      {/* Floating Inactivity Timer & Dev Fast-Expiry Controller */}
      <SessionTimerManager />

      {/* Floating Demo Auto-Fill Persona Switcher in Bottom-Right */}
      <DemoAutoFillWidget />
    </div>
  );
}
