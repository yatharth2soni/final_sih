/**
 * ==============================================================================
 * MODULE 3 — COMPLIANCE TRACKING ENGINE (BILINGUAL)
 * ==============================================================================
 */

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Calendar as CalendarIcon,
  History,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Building,
  Upload,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Wind,
  Pickaxe,
  Users,
} from "lucide-react";
import { t, translateStatus } from "../../i18n";

export function Module3Compliance({ complianceItems, onUpdateStatus, context, onOpenDoc, lang = "en" }) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [viewMode, setViewMode] = useState("register");
  const [selectedItemForHistory, setSelectedItemForHistory] = useState(null);

  const filteredItems = useMemo(() => {
    return (complianceItems || []).filter((item) => {
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) return false;
      if (selectedStatus !== "ALL" && item.status !== selectedStatus) return false;
      return true;
    });
  }, [complianceItems, selectedCategory, selectedStatus]);

  const stats = useMemo(() => {
    const total = complianceItems.length || 1;
    const compliant = complianceItems.filter((i) => i.status === "Compliant").length;
    const dueSoon = complianceItems.filter((i) => i.status === "Due Soon").length;
    const overdue = complianceItems.filter((i) => i.status === "Overdue" || i.status === "Non-Compliant").length;
    const rate = Math.round((compliant / total) * 100);
    return { total, compliant, dueSoon, overdue, rate };
  }, [complianceItems]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Compliant":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
      case "Due Soon":
        return "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400";
      case "Overdue":
        return "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400";
      case "Non-Compliant":
        return "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400";
      default:
        return "bg-slate-100 border-slate-300 text-slate-600";
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "Safety":
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case "Environment":
        return <Wind className="w-4 h-4 text-blue-500" />;
      case "Production":
        return <Pickaxe className="w-4 h-4 text-amber-500" />;
      case "Labour":
        return <Users className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Gauge Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            {lang === "hi" ? "मॉड्यूल 3: वैधानिक अनुपालन इंजन" : "Module 3: Statutory Compliance Engine"}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {lang === "hi" ? "DGMS वैधानिक अनुपालन रजिस्टर" : "DGMS Statutory Compliance Register"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === "hi" ? "वास्तविक समय अनुपालन खाता:" : "Real-time compliance ledger for"}{" "}
            <strong className="text-amber-500">{context?.mineSite || "Gevra Open Cast"}</strong> ({context?.subsidiary || "SECL"})
          </p>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center min-w-[100px]">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.rate}%
            </div>
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
              {lang === "hi" ? "अनुपालन दर" : "Compliance Rate"}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center min-w-[90px]">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats.dueSoon}
            </div>
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
              {t("statusDueSoon", lang)}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center min-w-[90px]">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {stats.overdue}
            </div>
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
              {t("statusOverdue", lang)}
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher & Filters Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: View Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode("register")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "register"
                ? "bg-white dark:bg-slate-900 text-amber-500 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === "hi" ? "चेकलिस्ट रजिस्टर" : "Checklist Register"}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "calendar"
                ? "bg-white dark:bg-slate-900 text-amber-500 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{lang === "hi" ? "वैधानिक कैलेंडर" : "Statutory Calendar"}</span>
          </button>
        </div>

        {/* Right: Category & Status Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-bold">{lang === "hi" ? "श्रेणी:" : "Category:"}</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-8 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              <option value="ALL">{t("allCategories", lang)}</option>
              <option value="Safety">{t("catSafety", lang)}</option>
              <option value="Environment">{t("catEnvironment", lang)}</option>
              <option value="Production">{t("catProduction", lang)}</option>
              <option value="Labour">{t("catLabour", lang)}</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-bold">{lang === "hi" ? "स्थिति:" : "Status:"}</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-8 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              <option value="ALL">{t("allStatuses", lang)}</option>
              <option value="Compliant">{translateStatus("Compliant", lang)}</option>
              <option value="Due Soon">{translateStatus("Due Soon", lang)}</option>
              <option value="Overdue">{translateStatus("Overdue", lang)}</option>
              <option value="Non-Compliant">{translateStatus("Non-Compliant", lang)}</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: CHECKLIST REGISTER */}
      {viewMode === "register" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              {lang === "hi" ? `${filteredItems.length} वैधानिक आवश्यकताएं प्रदर्शित` : `Showing ${filteredItems.length} Statutory Requirements`}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-3 px-3">{lang === "hi" ? "श्रेणी एवं आईडी" : "CATEGORY & ID"}</th>
                  <th className="py-3 px-3">{lang === "hi" ? "वैधानिक आवश्यकता" : "STATUTORY REQUIREMENT"}</th>
                  <th className="py-3 px-3">{lang === "hi" ? "नियम संदर्भ" : "STATUTE REF"}</th>
                  <th className="py-3 px-3">{lang === "hi" ? "स्थिति" : "STATUS"}</th>
                  <th className="py-3 px-3">{lang === "hi" ? "अंतिम सत्यापन" : "LAST VERIFIED"}</th>
                  <th className="py-3 px-3">{lang === "hi" ? "अगली देय तिथि" : "NEXT DUE"}</th>
                  <th className="py-3 px-3">{lang === "hi" ? "उत्तरदायी अधिकारी" : "RESPONSIBLE"}</th>
                  <th className="py-3 px-3">{lang === "hi" ? "कार्रवाई" : "ACTIONS"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(item.category)}
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {item.id}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{t(`cat${item.category}`, lang)}</span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white max-w-xs">
                      {item.title}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                      {item.statute}
                    </td>
                    <td className="py-3.5 px-3">
                      <select
                        value={item.status}
                        onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] cursor-pointer focus:outline-none ${getStatusBadge(item.status)}`}
                      >
                        <option value="Compliant">{translateStatus("Compliant", lang)}</option>
                        <option value="Due Soon">{translateStatus("Due Soon", lang)}</option>
                        <option value="Overdue">{translateStatus("Overdue", lang)}</option>
                        <option value="Non-Compliant">{translateStatus("Non-Compliant", lang)}</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 font-mono">
                      {item.lastVerified}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {item.nextDue}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                      {item.responsible}
                    </td>
                    <td className="py-3.5 px-3">
                      <button
                        type="button"
                        onClick={() => setSelectedItemForHistory(item)}
                        className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        title="View Verification History"
                      >
                        <History className="w-3 h-3" />
                        <span>{t("history", lang)}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: STATUTORY CALENDAR VIEW */}
      {viewMode === "calendar" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-500" />
              {lang === "hi" ? "वैधानिक देय तिथियां — मार्च 2026 ग्रिड" : "Statutory Due Dates — March 2026 Grid"}
            </h3>
            <span className="text-xs text-slate-500 font-mono">DGMS Compliance SLAs</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2 font-bold text-slate-400 uppercase text-[10px]">
                {day}
              </div>
            ))}

            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              const dateStr = `2026-03-${String(day).padStart(2, "0")}`;
              const dueItems = complianceItems.filter((item) => item.nextDue === dateStr);

              return (
                <div
                  key={day}
                  className={`min-h-[85px] p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    dueItems.length > 0
                      ? "bg-amber-500/5 border-amber-500/30 dark:bg-amber-950/20"
                      : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/80"
                  }`}
                >
                  <span className="font-mono text-xs font-bold text-slate-400">{day}</span>
                  <div className="space-y-1">
                    {dueItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItemForHistory(item)}
                        className={`text-[9px] font-bold p-1 rounded border truncate cursor-pointer hover:scale-102 transition-all ${getStatusBadge(item.status)}`}
                        title={`${item.title} (${item.category})`}
                      >
                        {item.category}: {item.title.slice(0, 18)}...
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History Modal Drawer */}
      {selectedItemForHistory && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs text-amber-500 font-bold">{selectedItemForHistory.id}</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedItemForHistory.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForHistory(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Statute: <strong>{selectedItemForHistory.statute}</strong> · Responsible: <strong>{selectedItemForHistory.responsible}</strong>
            </p>

            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {lang === "hi" ? "क्रिप्टोग्राफ़िक सत्यापन समयरेखा:" : "Cryptographic Verification Timeline:"}
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(selectedItemForHistory.history || []).map((h, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{h.date}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                        ✓ {translateStatus(h.status, lang)}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{h.action}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200 dark:border-slate-700/60">
                      <span>Verified by: {h.officer}</span>
                      <span>Hash: {h.hash}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedItemForHistory(null)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-navy-950 font-bold text-xs shadow cursor-pointer"
              >
                {t("close", lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
