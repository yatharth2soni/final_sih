import React, { useState, useMemo, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * @typedef {Object} MineCompliance
 * @property {string} id
 * @property {string} name
 * @property {string} subsidiary
 * @property {string} location
 * @property {number} overdue
 * @property {number} open
 * @property {number} score
 * @property {"critical" | "elevated" | "stable"} severity
 * @property {number} [lat]
 * @property {number} [lng]
 */

/** @type {MineCompliance[]} */
export const SAMPLE_MINES_DATA = [
  {
    id: "gevra-oc",
    name: "Gevra Opencast",
    subsidiary: "SECL",
    location: "SECL · Korba, Chhattisgarh",
    overdue: 7,
    open: 5,
    score: 42,
    severity: "critical",
    lat: 22.35,
    lng: 82.58,
  },
  {
    id: "talcher-ug",
    name: "Talcher Underground",
    subsidiary: "MCL",
    location: "MCL · Angul, Odisha",
    overdue: 5,
    open: 4,
    score: 51,
    severity: "critical",
    lat: 20.95,
    lng: 85.22,
  },
  {
    id: "jayant-proj",
    name: "Jayant Project",
    subsidiary: "NCL",
    location: "NCL · Singrauli, Madhya Pradesh",
    overdue: 4,
    open: 3,
    score: 63,
    severity: "elevated",
    lat: 24.12,
    lng: 82.65,
  },
  {
    id: "bhatgaon-2",
    name: "Bhatgaon Area 2",
    subsidiary: "SECL",
    location: "SECL · Surajpur, Chhattisgarh",
    overdue: 3,
    open: 2,
    score: 68,
    severity: "elevated",
    lat: 23.28,
    lng: 82.95,
  },
  {
    id: "wani-north",
    name: "Wani North",
    subsidiary: "WCL",
    location: "WCL · Yavatmal, Maharashtra",
    overdue: 2,
    open: 2,
    score: 74,
    severity: "elevated",
    lat: 20.06,
    lng: 78.95,
  },
  {
    id: "rajmahal-oc",
    name: "Rajmahal Opencast",
    subsidiary: "ECL",
    location: "ECL · Godda, Jharkhand",
    overdue: 1,
    open: 1,
    score: 86,
    severity: "stable",
    lat: 25.04,
    lng: 87.40,
  },
  {
    id: "kusmunda-exp",
    name: "Kusmunda Expansion",
    subsidiary: "SECL",
    location: "SECL · Korba, Chhattisgarh",
    overdue: 1,
    open: 0,
    score: 91,
    severity: "stable",
    lat: 22.33,
    lng: 82.68,
  },
  {
    id: "bharatpur-col",
    name: "Bharatpur Colliery",
    subsidiary: "MCL",
    location: "MCL · Angul, Odisha",
    overdue: 0,
    open: 0,
    score: 94,
    severity: "stable",
    lat: 20.94,
    lng: 85.18,
  },
];

export function ExecutiveCommandDashboard({
  allMines = [],
  activeMine = {},
  liveComplianceRecords = [],
  liveInspections = [],
  liveNotifications = [],
  liveAnomalies = [],
  liveGovOverview = null,
  liveContractors = [],
  computedRiskScore,
  isLiveApiConnected = false,
  onSelectMine,
  onOpenGis,
  onTriggerInspection,
  onShowToast,
  lang = "en",
}) {
  const [selectedSub, setSelectedSub] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [timeMode, setTimeMode] = useState("live"); // "live" | "history"
  const miniMapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const subsidiaries = ["All subsidiaries", "SECL", "MCL", "NCL", "WCL"];

  // ── 1. Structured Mine Dataset (Typed array with fallback to prompt dataset) ──
  const displayRows = useMemo(() => {
    let sourceData = SAMPLE_MINES_DATA;

    // If master mines array passed with more details, merge or map
    if (allMines && allMines.length > 8) {
      sourceData = allMines.map((m) => {
        const score = m.riskScore || (m.riskBand === "LOW" ? 92 : m.riskBand === "HIGH" ? 54 : m.riskBand === "CRITICAL" ? 42 : 74);
        let severity = "stable";
        if (score < 60) severity = "critical";
        else if (score <= 80) severity = "elevated";

        const mineRecords = liveComplianceRecords.filter((r) => r.mineId === m.id || r.mineSite === m.name);
        const overdueCount = mineRecords.filter((r) => r.status === "Overdue" || r.status === "NON_COMPLIANT").length || (severity === "critical" ? Math.max(3, Math.floor((100 - score) / 8)) : severity === "elevated" ? Math.max(1, Math.floor((100 - score) / 12)) : 0);
        const openCount = mineRecords.filter((r) => r.status === "Pending" || r.status === "PENDING_ACTION").length || (severity === "critical" ? Math.max(2, Math.floor(overdueCount * 0.7)) : severity === "elevated" ? Math.max(1, Math.floor(overdueCount * 0.6)) : 0);

        return {
          id: m.id,
          name: m.name,
          subsidiary: m.subsidiary || m.company?.code || "CIL",
          location: `${m.subsidiary || "CIL"} · ${m.district || "Colliery"}, ${m.state || "India"}`,
          overdue: overdueCount,
          open: openCount,
          score: score,
          severity: severity,
          lat: m.latitude || 22.5,
          lng: m.longitude || 82.5,
        };
      });
    }

    // Sort by risk score ascending (worst first)
    let rows = [...sourceData].sort((a, b) => a.score - b.score);

    // Apply Subsidiary Filter
    if (selectedSub !== "ALL" && selectedSub !== "All subsidiaries") {
      rows = rows.filter((r) => (r.subsidiary || "").toUpperCase().includes(selectedSub.toUpperCase()) || r.location.toUpperCase().includes(selectedSub.toUpperCase()));
    }

    // Apply Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          (r.subsidiary && r.subsidiary.toLowerCase().includes(q))
      );
    }

    return rows;
  }, [allMines, liveComplianceRecords, selectedSub, searchQuery]);

  // ── 2. Stat KPIs (Exact specs: 23, 17, 5, 38) ──
  const kpiData = useMemo(() => {
    const overdueTotal = displayRows.length === SAMPLE_MINES_DATA.length ? 23 : displayRows.reduce((a, r) => a + r.overdue, 0);
    const openTotal = displayRows.length === SAMPLE_MINES_DATA.length ? 17 : displayRows.reduce((a, r) => a + r.open, 0);
    const escalationsTotal = 5;
    const inspectionsClosedTotal = 38;

    return {
      overdue: overdueTotal,
      overdueSub: "9 past 30 days · 4 mines",
      open: openTotal,
      openSub: "6 safety · 7 environment · 4 labour",
      escalations: escalationsTotal,
      escalationsSub: "Awaiting DGMS response · 2 critical",
      inspectionsClosed: inspectionsClosedTotal,
      inspectionsSub: "Of 46 scheduled this month",
    };
  }, [displayRows]);

  // ── 3. Weekly Bar Chart Data (Exact 12 weeks: 14, 11, 18, 22, 16, 12, 19, 27, 24, 20, 26, 23) ──
  const weeklyData = useMemo(() => {
    const counts = [14, 11, 18, 22, 16, 12, 19, 27, 24, 20, 26, 23];
    const maxVal = Math.max(...counts, 30);
    return counts.map((val, idx) => ({
      week: `W${idx + 1}`,
      count: val,
      height: Math.min(100, Math.max(16, Math.round((val / maxVal) * 88))),
    }));
  }, []);

  // ── 4. Leaflet Map Initialization with Mapbox-style Dark Basemap ──
  useEffect(() => {
    if (!miniMapRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(miniMapRef.current, {
        center: [22.4, 82.2],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
      });

      // Dark Basemap (CartoDB Dark Matter)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 18,
        subdomains: "abcd",
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Four flagged sites from prompt: Jayant, Gevra, Talcher, Wani
    const flaggedSites = [
      { name: "Jayant", lat: 24.12, lng: 82.65, severity: "elevated" },
      { name: "Gevra", lat: 22.35, lng: 82.58, severity: "critical" },
      { name: "Talcher", lat: 20.95, lng: 85.22, severity: "critical" },
      { name: "Wani", lat: 20.06, lng: 78.95, severity: "elevated" },
    ];

    flaggedSites.forEach((site) => {
      const isCrit = site.severity === "critical";
      const icon = L.divIcon({
        className: "custom-site-pill",
        html: `
          <div style="
            background: #151519;
            border: 1px solid ${isCrit ? "rgba(239, 68, 68, 0.6)" : "rgba(79, 110, 245, 0.5)"};
            color: #f5f5f7;
            font-size: 11px;
            font-weight: 700;
            font-family: Inter, sans-serif;
            padding: 3px 10px;
            border-radius: 9999px;
            white-space: nowrap;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.8);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
          ">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${isCrit ? "#ef4444" : "#4f6ef5"};"></span>
            ${site.name}
          </div>
        `,
        iconSize: [64, 22],
        iconAnchor: [32, 11],
      });

      const marker = L.marker([site.lat, site.lng], { icon }).addTo(map);
      marker.on("click", () => {
        if (onSelectMine) onSelectMine(site.name);
        if (onShowToast) onShowToast(lang === "en" ? `Selected ${site.name}` : `${site.name} चयनित`);
      });
    });
  }, [onSelectMine, onShowToast, lang]);

  return (
    <div className="ks-executive-container">
      {/* ── 1. Header Row ── */}
      <div className="ks-header-row">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h1 className="ks-header-title" style={{ fontSize: 24, fontWeight: 800, color: "#f5f5f7", margin: 0, letterSpacing: "-0.02em" }}>
              {lang === "en" ? "Compliance Overview" : "अनुपालन अवलोकन"}
            </h1>
            {/* Live / History Mode Toggle */}
            <div className="ks-live-history-toggle" role="group" aria-label="Data Time Mode">
              <button
                type="button"
                className={`ks-lh-btn ${timeMode === "live" ? "active" : ""}`}
                onClick={() => {
                  setTimeMode("live");
                  if (onShowToast) onShowToast(lang === "en" ? "⚡ Live Central Sync Active" : "⚡ लाइव केंद्रीय सिंक सक्रिय");
                }}
              >
                <span className="ks-live-dot" />
                LIVE
              </button>
              <button
                type="button"
                className={`ks-lh-btn ${timeMode === "history" ? "active" : ""}`}
                onClick={() => {
                  setTimeMode("history");
                  if (onShowToast) onShowToast(lang === "en" ? "📅 Historical Audit Records" : "📅 ऐतिहासिक ऑडिट रिकॉर्ड");
                }}
              >
                HISTORY
              </button>
            </div>
          </div>
          <div className="ks-header-meta" style={{ fontSize: 13, color: "#8b8b93", marginTop: 4 }}>
            24 mines · 7 subsidiaries · synced 09:12 IST
          </div>
        </div>

        <div className="ks-header-actions">
          {/* Search Mines Button / Input */}
          {isSearchOpen ? (
            <input
              type="text"
              autoFocus
              className="well"
              placeholder={lang === "en" ? "Search mines..." : "खदानें खोजें..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => {
                if (!searchQuery) setIsSearchOpen(false);
              }}
              style={{ height: 36, width: 200, borderRadius: 8, fontSize: 12.5, padding: "0 12px", background: "#151519", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#ffffff" }}
            />
          ) : (
            <button
              type="button"
              className="ks-action-btn-search"
              onClick={() => setIsSearchOpen(true)}
              style={{ height: 36, padding: "0 14px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#f5f5f7", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
            >
              <span>🔍</span>
              <span>{lang === "en" ? "Search mines" : "खदानें खोजें"}</span>
            </button>
          )}

          {/* Export Snapshot */}
          <button
            type="button"
            className="ks-action-btn-export"
            onClick={() => {
              if (onShowToast) onShowToast(lang === "en" ? "✓ Exported snapshot (CSV)" : "✓ स्नैपशॉट निर्यात किया गया");
            }}
            style={{ height: 36, padding: "0 14px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#f5f5f7", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
          >
            <span>📥</span>
            <span>{lang === "en" ? "Export snapshot" : "स्नैपशॉट निर्यात"}</span>
          </button>

          {/* Open Flagged Mine Button (Primary CTA) */}
          <button
            type="button"
            className="ks-action-btn-flagged"
            onClick={() => {
              if (onOpenGis) onOpenGis();
              if (onShowToast) onShowToast(lang === "en" ? "Opening Flagged Concessions on GIS Map" : "जीआईएस मानचित्र पर ध्वजांकित क्षेत्र खोले जा रहे हैं");
            }}
            style={{ height: 36, padding: "0 16px", borderRadius: 8, background: "#4f6ef5", border: "none", color: "#ffffff", fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", boxShadow: "0 2px 10px rgba(79, 110, 245, 0.35)" }}
          >
            <span>➔</span>
            <span>{lang === "en" ? "Open flagged mine" : "ध्वजांकित खदान खोलें"}</span>
          </button>

          {/* Circular Avatar Chip */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#27272a",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#f5f5f7",
              fontSize: 12.5,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              letterSpacing: 0.5,
            }}
            title="Authorized Representative: AR"
          >
            AR
          </div>
        </div>
      </div>

      {/* ── 2. Filter Tab Row ── */}
      <div className="ks-filter-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 16px", flexWrap: "wrap", gap: 12 }}>
        <div className="ks-subsidiary-pills" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {subsidiaries.map((sub) => {
            const isAll = sub === "All subsidiaries";
            const isCurrent = (isAll && selectedSub === "ALL") || selectedSub === sub;
            return (
              <button
                key={sub}
                type="button"
                className={`ks-sub-pill ${isCurrent ? "active" : ""}`}
                onClick={() => setSelectedSub(isAll ? "ALL" : sub)}
                style={{
                  height: 32,
                  padding: "0 14px",
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: isCurrent ? "rgba(79, 110, 245, 0.2)" : "transparent",
                  color: isCurrent ? "#ffffff" : "#8b8b93",
                  border: isCurrent ? "1px solid #4f6ef5" : "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                {sub}
              </button>
            );
          })}
          <button
            type="button"
            className="ks-sub-pill"
            onClick={() => {
              if (onShowToast) onShowToast(lang === "en" ? "Filter by Region" : "क्षेत्र द्वारा फ़िल्टर");
            }}
            style={{
              height: 32,
              padding: "0 14px",
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              background: "transparent",
              color: "#8b8b93",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>🎛️</span>
            <span>{lang === "en" ? "Region" : "क्षेत्र"}</span>
          </button>
        </div>

        <div className="ks-window-tag" style={{ fontSize: 12, color: "#8b8b93", fontWeight: 500 }}>
          Window · 01–31 Mar 2026
        </div>
      </div>

      {/* ── 3. Stat Card Row (4 equal cards, gap 16px) ── */}
      <div className="ks-metrics-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}>
        {/* Card 1: Overdue Filings */}
        <div className="ks-metric-box accent-blue" style={{ background: "#151519", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: 12, padding: "18px 20px" }}>
          <div className="ks-metric-header" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#8b8b93", fontWeight: 600 }}>
            <span>🕒</span>
            <span>{lang === "en" ? "Overdue Filings" : "अतिदेय फाइलिंग"}</span>
          </div>
          <div className="ks-metric-val" style={{ fontSize: 38, fontWeight: 900, color: "#4f6ef5", margin: "10px 0 6px", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.03em" }}>
            {kpiData.overdue}
          </div>
          <div className="ks-metric-sub" style={{ fontSize: 12, color: "#8b8b93" }}>
            {kpiData.overdueSub}
          </div>
        </div>

        {/* Card 2: Open Violations */}
        <div className="ks-metric-box" style={{ background: "#151519", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: 12, padding: "18px 20px" }}>
          <div className="ks-metric-header" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#8b8b93", fontWeight: 600 }}>
            <span>⚠️</span>
            <span>{lang === "en" ? "Open Violations" : "खुले उल्लंघन"}</span>
          </div>
          <div className="ks-metric-val" style={{ fontSize: 38, fontWeight: 900, color: "#f5f5f7", margin: "10px 0 6px", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.03em" }}>
            {kpiData.open}
          </div>
          <div className="ks-metric-sub" style={{ fontSize: 12, color: "#8b8b93" }}>
            {kpiData.openSub}
          </div>
        </div>

        {/* Card 3: Escalations Pending */}
        <div className="ks-metric-box" style={{ background: "#151519", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: 12, padding: "18px 20px" }}>
          <div className="ks-metric-header" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#8b8b93", fontWeight: 600 }}>
            <span>↗️</span>
            <span>{lang === "en" ? "Escalations Pending" : "लंबित एस्केलेशन"}</span>
          </div>
          <div className="ks-metric-val" style={{ fontSize: 38, fontWeight: 900, color: "#f5f5f7", margin: "10px 0 6px", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.03em" }}>
            {kpiData.escalations}
          </div>
          <div className="ks-metric-sub" style={{ fontSize: 12, color: "#8b8b93" }}>
            {kpiData.escalationsSub}
          </div>
        </div>

        {/* Card 4: Inspections Closed */}
        <div className="ks-metric-box" style={{ background: "#151519", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: 12, padding: "18px 20px" }}>
          <div className="ks-metric-header" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#8b8b93", fontWeight: 600 }}>
            <span>📋</span>
            <span>{lang === "en" ? "Inspections Closed" : "पूर्ण निरीक्षण"}</span>
          </div>
          <div className="ks-metric-val" style={{ fontSize: 38, fontWeight: 900, color: "#f5f5f7", margin: "10px 0 6px", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.03em" }}>
            {kpiData.inspectionsClosed}
          </div>
          <div className="ks-metric-sub" style={{ fontSize: 12, color: "#8b8b93" }}>
            {kpiData.inspectionsSub}
          </div>
        </div>
      </div>

      {/* ── 4. Alert Banner ── */}
      <div
        className="ks-incident-callout"
        style={{
          background: "rgba(79, 110, 245, 0.12)",
          border: "1px solid rgba(79, 110, 245, 0.3)",
          borderRadius: 12,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div className="ks-incident-left" style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 280 }}>
          <div
            className="ks-incident-icon-box"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(79, 110, 245, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#4f6ef5",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            🔔
          </div>
          <div>
            <div className="ks-incident-title" style={{ fontSize: 14, fontWeight: 700, color: "#f5f5f7" }}>
              Gevra OC has missed 3 consecutive dust-monitoring filings
            </div>
            <div className="ks-incident-desc" style={{ fontSize: 12.5, color: "#8b8b93", marginTop: 2 }}>
              The risk engine flagged a recurring environment gap. Escalation to the SECL zonal officer is due in 2 days.
            </div>
          </div>
        </div>

        <div className="ks-incident-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            className="ks-btn-review"
            onClick={() => {
              if (onTriggerInspection) onTriggerInspection();
              if (onShowToast) onShowToast(lang === "en" ? "Reviewing Gevra OC case dossier" : "गेवरा ओसी केस दस्तावेज़ की समीक्षा की जा रही है");
            }}
            style={{
              height: 34,
              padding: "0 14px",
              borderRadius: 8,
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#f5f5f7",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {lang === "en" ? "Review case" : "केस समीक्षा"}
          </button>
          <button
            type="button"
            className="ks-btn-escalate"
            onClick={() => {
              if (onShowToast) onShowToast(lang === "en" ? "🚨 Escalation sent to SECL zonal directorate" : "🚨 एस्केलेशन एसईसीएल जोनल निदेशालय को प्रेषित");
            }}
            style={{
              height: 34,
              padding: "0 16px",
              borderRadius: 8,
              background: "#4f6ef5",
              border: "none",
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(79, 110, 245, 0.4)",
            }}
          >
            {lang === "en" ? "Escalate now" : "अब एस्केलेट करें"}
          </button>
        </div>
      </div>

      {/* ── 5. Mine-by-Mine Compliance Table ── */}
      <div className="ks-table-panel" style={{ background: "#151519", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: 12, padding: "20px", marginBottom: 20 }}>
        <div className="ks-panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 className="ks-panel-title" style={{ fontSize: 16, fontWeight: 800, color: "#f5f5f7", margin: 0 }}>
            {lang === "en" ? "Mine-by-mine compliance" : "खदान-वार अनुपालन स्थिति"}
          </h3>
          <div className="ks-panel-meta" style={{ fontSize: 12.5, color: "#8b8b93" }}>
            24 mines · sorted by risk score
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="ks-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)", fontSize: 11, color: "#5c5c64", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                <th style={{ padding: "10px 14px", fontWeight: 700 }}>MINE SITE</th>
                <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700 }}>OVERDUE</th>
                <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700 }}>OPEN</th>
                <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700 }}>SCORE</th>
                <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700 }}>SEVERITY</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row) => {
                const isSelected = activeMine && (activeMine.id === row.id || activeMine.name === row.name);
                const isCritical = row.severity === "critical";
                const isElevated = row.severity === "elevated";
                const dotColor = isCritical ? "#ef4444" : isElevated ? "#f5a623" : "#22c55e";

                return (
                  <tr
                    key={row.id || row.name}
                    className={isSelected ? "active" : ""}
                    onClick={() => {
                      if (onSelectMine) onSelectMine(row.id || row.name);
                      if (onShowToast) onShowToast(lang === "en" ? `Selected ${row.name}` : `${row.name} चयनित`);
                    }}
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                      cursor: "pointer",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "14px 14px" }}>
                      <div className="ks-mine-name" style={{ fontSize: 13.5, fontWeight: 700, color: "#f5f5f7" }}>{row.name}</div>
                      <div className="ks-mine-sub" style={{ fontSize: 12, color: "#8b8b93", marginTop: 2 }}>{row.location}</div>
                    </td>
                    <td style={{ padding: "14px 14px", textAlign: "center" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: row.overdue > 0 ? "#4f6ef5" : "#8b8b93" }}>
                        {row.overdue}
                      </span>
                    </td>
                    <td style={{ padding: "14px 14px", textAlign: "center" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#f5f5f7" }}>
                        {row.open}
                      </span>
                    </td>
                    <td style={{ padding: "14px 14px", textAlign: "center" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#f5f5f7" }}>
                        {row.score}
                      </span>
                    </td>
                    <td style={{ padding: "14px 14px", textAlign: "right" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#f5f5f7" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                        <span style={{ textTransform: "capitalize" }}>{row.severity}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 6. Bottom Two-Column Row (40/60 Split) ── */}
      <div className="ks-bottom-duo-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {/* Left: Overdue filings by week */}
        <div className="ks-table-panel" style={{ background: "#151519", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: 12, padding: "20px", display: "flex", flexDirection: "column" }}>
          <div className="ks-card-subhead" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h4 className="ks-panel-title" style={{ fontSize: 14, fontWeight: 800, color: "#f5f5f7", margin: 0 }}>
              {lang === "en" ? "Overdue filings by week" : "साप्ताहिक अतिदेय फाइलिंग"}
            </h4>
            <span className="ks-panel-meta" style={{ fontSize: 12, color: "#8b8b93" }}>
              {lang === "en" ? "Last 12 weeks" : "पिछले 12 सप्ताह"}
            </span>
          </div>

          <div className="ks-bars-container" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 160, gap: 8, paddingBottom: 4 }}>
            {weeklyData.map((item) => (
              <div key={item.week} className="ks-bar-column" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                <span className="ks-bar-num" style={{ fontSize: 10.5, fontWeight: 700, color: "#8b8b93", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>{item.count}</span>
                <div
                  className="ks-bar-rect"
                  style={{
                    width: "100%",
                    maxWidth: 24,
                    height: `${item.height}%`,
                    background: "#4f6ef5",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.3s ease",
                  }}
                />
                <span className="ks-bar-label" style={{ fontSize: 10, color: "#5c5c64", marginTop: 6, fontWeight: 600 }}>{item.week}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Flagged sites (Mapbox Dark Map Panel) */}
        <div className="ks-table-panel" style={{ background: "#151519", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: 12, padding: "20px", display: "flex", flexDirection: "column", position: "relative" }}>
          <div className="ks-card-subhead" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h4 className="ks-panel-title" style={{ fontSize: 14, fontWeight: 800, color: "#f5f5f7", margin: 0 }}>
              {lang === "en" ? "Flagged sites" : "ध्वजांकित खदान स्थल"}
            </h4>
            <span className="ks-panel-meta" style={{ fontSize: 12, color: "#8b8b93" }}>
              5 mines with open violations
            </span>
          </div>

          <div style={{ position: "relative", flex: 1, minHeight: 180, borderRadius: 8, overflow: "hidden" }}>
            <div ref={miniMapRef} style={{ width: "100%", height: "100%", minHeight: 180, background: "#f1f5f9" }} />
            {/* Mapbox attribution mark in bottom-left */}
            <div
              style={{
                position: "absolute",
                bottom: 6,
                left: 8,
                zIndex: 1000,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "rgba(255, 255, 255, 0.4)",
                background: "rgba(10, 10, 12, 0.7)",
                padding: "2px 6px",
                borderRadius: 4,
                pointerEvents: "none",
                textTransform: "lowercase",
              }}
            >
              mapbox
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
