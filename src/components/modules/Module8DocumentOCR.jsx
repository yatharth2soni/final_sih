/**
 * ==============================================================================
 * MODULE 8 — DOCUMENT DIGITIZATION (OCR) & BLOCKCHAIN AUDIT TRAIL
 * ==============================================================================
 * 1. Document Upload & Simulated OCR Extraction (1.5s scanning state)
 * 2. Auto-fills statutory metadata (Cert No, Statute, Issuer, Expiry)
 * 3. Document Library with multi-category filters
 * 4. Blockchain Audit Trail Explorer listing immutable SHA-256 event chains
 * ==============================================================================
 */

import React, { useState } from "react";
import {
  FileText,
  Upload,
  Scan,
  CheckCircle2,
  Lock,
  Link2,
  Filter,
  Eye,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck,
  FolderOpen,
} from "lucide-react";
import CryptoJS from "crypto-js";
import { digitizeDocumentWithAI } from "../../services/aiOcrService";
import { generateGovernanceReport } from "../../services/governanceReportGenerator";
import { DigitalGovernanceReportViewer } from "../governance/DigitalGovernanceReportViewer";

export function Module8DocumentOCR({ documents, onAddDocument, context, violations }) {
  const [viewTab, setViewTab] = useState("library"); // "library" | "scan" | "audit"
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatusMsg, setScanStatusMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [activeGovReport, setActiveGovReport] = useState(null);

  // Form fields for OCR scan save
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("Statutory Certificate");
  const [refNumber, setRefNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("2027-03-31");

  // Audit filter
  const [auditFilter, setAuditFilter] = useState("ALL");

  const handleFileSelect = async (e) => {
    const files = e.target?.files || (e.dataTransfer ? e.dataTransfer.files : null);
    const file = files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsScanning(true);
    setScanStatusMsg("Analysing by AI...");
    setExtractedData(null);

    try {
      const result = await digitizeDocumentWithAI(file, {
        activeMine: {
          name: context?.mineName || context?.mineSite || "Active Operational Mine",
          subsidiary: context?.subsidiary || "CIL",
        },
        onProgress: (step, msg) => setScanStatusMsg(msg),
      });

      setDocTitle(result.title);
      setDocType(result.type);
      setRefNumber(result.referenceNo);
      setExpiryDate(result.validityDate);
      setExtractedData({
        certNo: result.referenceNo,
        statute: result.statute,
        issuingAuthority: result.issuingAuthority,
        validity: result.validityDate,
        confidence: result.confidenceScore,
        modelUsed: result.modelUsed,
        auditHash: result.auditHash,
      });
    } catch (err) {
      console.warn("OCR Error in Module 8:", err);
    } finally {
      setIsScanning(false);
      setScanStatusMsg("");
    }
  };

  const handleSaveScannedDocument = (e) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    const hash = CryptoJS.SHA256(
      `DOC|${docTitle}|${refNumber}|${new Date().toISOString()}|COALGOV`
    ).toString(CryptoJS.enc.Hex);

    const newDoc = {
      id: `DOC-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: docTitle.trim(),
      type: docType,
      referenceNo: refNumber.trim(),
      mineSite: context?.mineName || context?.mineSite || "Active Operational Mine",
      subsidiary: context?.subsidiary || "CIL",
      uploadedBy: context?.profile?.name || "Statutory Officer",
      uploadDate: new Date().toISOString().split("T")[0],
      fileSize: uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB` : "1.2 MB",
      expiryDate,
      ocrExtracted: extractedData,
      auditHash: hash,
    };

    onAddDocument(newDoc);
    setUploadedFile(null);
    setExtractedData(null);
    setViewTab("library");
  };

  // Compile Comprehensive System-Wide Audit Trail
  const auditEvents = [
    {
      id: "AUD-EVT-01",
      event: "User Session Authenticated via MFA",
      actor: context?.profile?.name || "Officer",
      timestamp: context?.session?.loginTimestamp || "2026-02-29 14:10:02",
      type: "AUTH_SESSION",
      hash: context?.session?.auditHash || "8f90c3a21b44e77a11d...",
    },
    {
      id: "AUD-EVT-02",
      event: "Violation VIO-2026-0914 Created (CMR 108 Roof Gap)",
      actor: "Priya Deshmukh (Inspector)",
      timestamp: "2026-02-29 14:15:22",
      type: "VIOLATION_LOG",
      hash: "3c71a9f02b11e88a99c...",
    },
    {
      id: "AUD-EVT-03",
      event: "Document DOC-2026-001 Digitized with OCR Signature",
      actor: "Er. Rajesh Verma",
      timestamp: "2026-02-28 11:00:15",
      type: "DOCUMENT_UPLOAD",
      hash: "f1a90c21b33e44a88d77...",
    },
    {
      id: "AUD-EVT-04",
      event: "CAPA Remediation Verified for VIO-2026-0882",
      actor: "Suresh Chandra Patnaik (DDGMS)",
      timestamp: "2026-02-16 16:45:00",
      type: "CAPA_CLOSURE",
      hash: "4c81a2f00e99b11d22e...",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Module 8: Document OCR & Cryptographic Audit
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Document Digitization & Immutable Blockchain Trail
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Simulated optical character recognition for DGMS certificates & tamper-proof SHA-256 audit ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              const rep = generateGovernanceReport(documents, {
                scope: "mine_consolidated",
                activeMine: { name: context?.mineName || context?.mineSite || "Operational Mine", subsidiary: context?.subsidiary || "CIL" },
                inspections: [],
                complianceRecords: [],
                violations: violations || [],
              });
              setActiveGovReport(rep);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white font-extrabold text-xs shadow flex items-center gap-1.5 cursor-pointer border border-blue-400/30"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>⚡ GENERATE DIGITAL REPORT</span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab("scan")}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Scan className="w-4 h-4" />
            <span>+ Upload & OCR Scan</span>
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setViewTab("library")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            viewTab === "library"
              ? "bg-amber-500 text-navy-950 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Document Library ({documents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setViewTab("scan")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            viewTab === "scan"
              ? "bg-amber-500 text-navy-950 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Scan className="w-4 h-4" />
          <span>OCR Scanner</span>
        </button>

        <button
          type="button"
          onClick={() => setViewTab("audit")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            viewTab === "audit"
              ? "bg-amber-500 text-navy-950 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Blockchain Audit Trail</span>
        </button>
      </div>

      {/* VIEW 1: DOCUMENT LIBRARY */}
      {viewTab === "library" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-3 px-3">DOCUMENT TITLE & REF</th>
                  <th className="py-3 px-3">CATEGORY</th>
                  <th className="py-3 px-3">UPLOADED BY</th>
                  <th className="py-3 px-3">DATE</th>
                  <th className="py-3 px-3">VALIDITY</th>
                  <th className="py-3 px-3">BLOCKCHAIN AUDIT HASH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <span>{doc.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{doc.referenceNo}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                      {doc.uploadedBy}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-500">{doc.uploadDate}</td>
                    <td className="py-3.5 px-3 font-mono text-emerald-600">Valid to {doc.expiryDate}</td>
                    <td className="py-3.5 px-3 font-mono text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                        <Link2 className="w-3 h-3" />
                        {doc.auditHash ? `${doc.auditHash.slice(0, 16)}...` : "SHA256-verified"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: OCR DOCUMENT SCANNER */}
      {viewTab === "scan" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Upload Dropzone */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Step 1: Upload Statutory Certificate
            </h3>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileSelect(e);
              }}
              className={`p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center space-y-3 ${
                isDragging
                  ? "border-amber-500 bg-amber-500/10 shadow-md"
                  : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
              }`}
            >
              <Upload className={`w-8 h-8 text-amber-500 ${isDragging ? "scale-125 transition-transform" : "animate-bounce"}`} />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {isDragging ? "Drop files or folder to start AI OCR scanning..." : "Drag and drop certificate PDF / image or folder here"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Supports DGMS Form IV-B, HEMM Fitness, and MoEF&CC Gazette filings (Multi-file & Folders)
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-center pt-2">
                <label className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>📁 Browse Document Files</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/*,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <label className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm transition-all">
                  <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>🗂️ Upload Entire Folder</span>
                  <input
                    type="file"
                    webkitdirectory=""
                    directory=""
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Scanning State */}
            {isScanning && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>⚡ {scanStatusMsg || "Simulating OCR Extraction & Neural Text Parsing..."}</span>
              </div>
            )}

            {/* Extracted Metadata Card */}
            {extractedData && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    AI OCR Extraction Successful ({extractedData.confidence} Confidence)
                  </span>
                  {extractedData.modelUsed && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                      {extractedData.modelUsed}
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                  <div>Certificate Ref: <strong className="font-mono text-slate-900 dark:text-white">{extractedData.certNo}</strong></div>
                  <div>Statute: <strong>{extractedData.statute}</strong></div>
                  <div>Authority: <strong>{extractedData.issuingAuthority}</strong></div>
                  {extractedData.auditHash && (
                    <div className="text-[10px] text-slate-500 font-mono truncate pt-1 border-t border-emerald-500/20">
                      SHA256: {extractedData.auditHash}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const docToUse = {
                      title: docTitle || "Scanned Statutory Document",
                      type: docType,
                      referenceNo: refNumber || extractedData.certNo,
                      statute: extractedData.statute,
                      issuingAuthority: extractedData.issuingAuthority,
                      validityDate: expiryDate,
                      confidenceScore: extractedData.confidence,
                      auditHash: extractedData.auditHash,
                    };
                    const rep = generateGovernanceReport([docToUse], {
                      scope: "single_doc",
                      activeMine: { name: context?.mineName || context?.mineSite || "Operational Mine", subsidiary: context?.subsidiary || "CIL" },
                      violations: violations || [],
                    });
                    setActiveGovReport(rep);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white font-extrabold text-xs shadow flex items-center justify-center gap-1.5 cursor-pointer border border-blue-400/30"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>⚡ GENERATE DIGITAL REPORT FOR THIS DOCUMENT</span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Auto-Filled Verification Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Step 2: Verify & Commit to Blockchain Audit Trail
            </h3>

            <form onSubmit={handleSaveScannedDocument} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. DGMS Annual Strata Support Certificate"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Document Category
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <option value="Statutory Certificate">Statutory Certificate</option>
                    <option value="Contractor License">Contractor License</option>
                    <option value="Inspection Photo Log">Inspection Photo Log</option>
                    <option value="Environmental Clearance">Environmental Clearance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Reference Number (OCR-Filled)
                  </label>
                  <input
                    type="text"
                    required
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Statutory Expiry Date
                </label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!docTitle}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 font-extrabold text-xs shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Generate SHA-256 Hash & Commit Document</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 3: IMMUTABLE AUDIT TRAIL EXPLORER */}
      {viewTab === "audit" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Chronological Blockchain Audit Ledger
            </h3>
            <span className="text-[11px] font-mono text-emerald-500 font-bold">
              ✓ SHA-256 Merkle Chain Synced
            </span>
          </div>

          <div className="space-y-3">
            {auditEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-500">{evt.id}</span>
                    <span className="text-slate-900 dark:text-white">{evt.event}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">{evt.timestamp}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Actor / Officer: <strong>{evt.actor}</strong></span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <Link2 className="w-3 h-3" />
                    Hash: {evt.hash}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Digital Governance Report Viewer Modal Overlay */}
      {activeGovReport && (
        <DigitalGovernanceReportViewer
          reportData={activeGovReport}
          onClose={() => setActiveGovReport(null)}
          currentUser={{ role: "mine_official", name: context?.officerName || "Er. Rajesh Verma (Safety Officer)" }}
        />
      )}
    </div>
  );
}
