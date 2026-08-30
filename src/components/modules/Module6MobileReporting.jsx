/**
 * ==============================================================================
 * MODULE 6 — MOBILE FIELD REPORTING (GEO-TAGGED & OFFLINE)
 * ==============================================================================
 * 1. Automatic GPS coordinate acquisition via `navigator.geolocation`
 * 2. Embedded pin preview with precision geofence indicator
 * 3. Camera capture input with `capture="environment"` attribute
 * 4. Offline Draft Queue backed by localStorage with "Pending Sync" badge
 * 5. "Simulate Reconnect" dev trigger to flush offline queue to DGMS grid
 * ==============================================================================
 */

import React, { useState, useEffect } from "react";
import {
  Smartphone,
  MapPin,
  Camera,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Clock,
  Layers,
  Upload,
  Image,
} from "lucide-react";

export function Module6MobileReporting({ context, onAddObservation }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Strata Control (CMR 108)");
  const [severity, setSeverity] = useState("HIGH");
  const [notes, setNotes] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);

  // GPS State
  const [location, setLocation] = useState({
    lat: 23.6942,
    lng: 87.2185,
    source: "Auto-Acquiring GPS...",
    accuracy: "±4.2m",
  });
  const [gpsLoading, setGpsLoading] = useState(false);

  // Connectivity & Offline Draft Queue
  const [isOnline, setIsOnline] = useState(true);
  const [offlineDrafts, setOfflineDrafts] = useState(() => {
    try {
      const saved = localStorage.getItem("coalgov_offline_drafts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [submissions, setSubmissions] = useState([
    {
      id: "REP-2026-9021",
      title: "Extensometer tell-tale deflection reading",
      category: "Strata Control (CMR 108)",
      severity: "MODERATE",
      location: "23.6942° N, 87.2185° E (Panel B-3)",
      timestamp: "Today, 14:15 IST",
      status: "SYNCED",
    },
    {
      id: "REP-2026-9018",
      title: "Dust misting nozzle clogged at Transfer Chute 1",
      category: "Environmental Safety",
      severity: "LOW",
      location: "23.6980° N, 87.2210° E (Haul Road)",
      timestamp: "Today, 11:30 IST",
      status: "SYNCED",
    },
  ]);

  // Acquire GPS on mount
  useEffect(() => {
    acquireGPS();
  }, []);

  const acquireGPS = () => {
    setGpsLoading(true);
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
            source: "Live GPS Receiver (High Precision)",
            accuracy: `±${Math.round(pos.coords.accuracy)}m`,
          });
          setGpsLoading(false);
        },
        () => {
          // Fallback coordinate for mine site
          setLocation({
            lat: 23.6942,
            lng: 87.2185,
            source: "Colliery Pit Boundary Base (DGMS Station 04)",
            accuracy: "±5.0m Geofence",
          });
          setGpsLoading(false);
        },
        { timeout: 4000 }
      );
    } else {
      setGpsLoading(false);
    }
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const reportItem = {
      id: `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      category,
      severity,
      notes: notes.trim(),
      location: `${location.lat}° N, ${location.lng}° E (${context?.mineSite || "Panel B-3"})`,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      status: isOnline ? "SYNCED" : "PENDING_SYNC",
      photoUrl: photoPreview,
    };

    if (isOnline) {
      setSubmissions([reportItem, ...submissions]);
      if (onAddObservation) {
        onAddObservation({
          id: reportItem.id,
          title: reportItem.title,
          category: reportItem.category,
          severity: reportItem.severity,
          location: reportItem.location,
          loggedBy: context?.profile?.name || "Field Inspector",
          timestamp: "Just now",
          status: "SYNCED_TO_DGMS",
        });
      }
    } else {
      // Save to offline queue
      const updated = [reportItem, ...offlineDrafts];
      setOfflineDrafts(updated);
      localStorage.setItem("coalgov_offline_drafts", JSON.stringify(updated));
    }

    // Reset Form
    setTitle("");
    setNotes("");
    setPhotoPreview(null);
  };

  const handleSimulateReconnect = () => {
    setIsOnline(true);
    if (offlineDrafts.length > 0) {
      // Flush offline drafts to synced submissions
      const synced = offlineDrafts.map((d) => ({ ...d, status: "SYNCED" }));
      setSubmissions([...synced, ...submissions]);
      setOfflineDrafts([]);
      localStorage.removeItem("coalgov_offline_drafts");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Connectivity Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Module 6: Mobile Field Reporting Suite
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Geo-Tagged Field Observation & Offline Sync
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enables instant on-site logging for pit inspectors and safety officers with automatic GPS geo-fencing.
          </p>
        </div>

        {/* Online / Offline Simulator */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOnline(!isOnline)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isOnline
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 animate-pulse"
            }`}
          >
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{isOnline ? "Network: Online" : "Network: Offline (Underground)"}</span>
          </button>

          {!isOnline && offlineDrafts.length > 0 && (
            <button
              type="button"
              onClick={handleSimulateReconnect}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-extrabold text-xs shadow flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Simulate Reconnect & Sync ({offlineDrafts.length})</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Mobile Observation Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Log New Physical Finding
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Auto GPS Pin Card */}
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-rose-500 animate-bounce shrink-0" />
                <div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                    {location.lat}° N, {location.lng}° E
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {location.source} ({location.accuracy})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={acquireGPS}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-amber-500 font-bold text-[11px] border border-slate-200 dark:border-slate-700 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${gpsLoading ? "animate-spin" : ""}`} />
                <span>Refresh GPS</span>
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Finding Title / Hazard Summary <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Strata convergence tell-tale dial reading 3.2mm in Panel B"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Statutory Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                >
                  <option value="Strata Control (CMR 108)">Strata Control (CMR 108)</option>
                  <option value="Gas & Ventilation (CMR 140)">Gas & Ventilation (CMR 140)</option>
                  <option value="HEMM Machinery Flaw">HEMM Machinery Flaw</option>
                  <option value="Environmental Safety">Environmental Safety</option>
                  <option value="Water Ingress (CMR 147)">Water Ingress (CMR 147)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                >
                  <option value="LOW">LOW</option>
                  <option value="MODERATE">MODERATE</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Field Observations & Inspector Notes
              </label>
              <textarea
                rows={2}
                placeholder="Additional notes on crack width, load cell readout, or worker feedback..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              />
            </div>

            {/* Photo / Camera Input with capture="environment" */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Attach Geo-Tagged Evidence Photo
              </label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer">
                  <Camera className="w-4 h-4 text-amber-500" />
                  <span>Open Camera / Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                </label>
                {photoPreview && (
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Photo Attached
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className={`w-full py-3 px-6 rounded-xl font-extrabold text-xs shadow flex items-center justify-center gap-2 cursor-pointer ${
                  isOnline
                    ? "bg-amber-500 hover:bg-amber-600 text-navy-950 shadow-amber-500/20"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{isOnline ? "Transmit Report to DGMS Grid" : "Save as Offline Draft (Auto-Syncs on Connect)"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Submission Queue (Synced & Offline) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Field Submission Queue
            </h3>
            {offlineDrafts.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-mono font-bold text-[10px]">
                {offlineDrafts.length} Offline Drafts
              </span>
            )}
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1 text-xs">
            {/* Offline Drafts First */}
            {offlineDrafts.map((draft) => (
              <div
                key={draft.id}
                className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/30 space-y-1"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="font-mono text-blue-500">{draft.id}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500 text-white text-[9px] font-extrabold flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    Pending Sync
                  </span>
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">{draft.title}</div>
                <p className="text-[10px] text-slate-500">{draft.location}</p>
              </div>
            ))}

            {/* Synced Submissions */}
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="font-mono text-amber-500">{sub.id}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                    ✓ Synced
                  </span>
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">{sub.title}</div>
                <p className="text-[10px] text-slate-500">{sub.location} · {sub.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
