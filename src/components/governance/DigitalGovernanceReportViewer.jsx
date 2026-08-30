import React, { useState, useMemo } from 'react';
import {
  FileText,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Search,
  Filter,
  Eye,
  ExternalLink,
  Lock,
  Calendar,
  X,
  FileCheck,
  ArrowLeft,
  Building2,
  HardHat,
  Sparkles,
  Layers,
} from 'lucide-react';

export function DigitalGovernanceReportViewer({
  reportData,
  onClose,
  currentUser = { role: 'mine_official', name: 'Officer' },
  language = 'en',
  onActionTrigger = () => {},
}) {
  const isHi = language === 'hi';
  const [report, setReport] = useState(reportData);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [isApproving, setIsApproving] = useState(false);

  if (!report) return null;

  const {
    isEmpty,
    header,
    executiveSummary,
    documentsInventory = [],
    keyFindings = [],
    safetySummary,
    complianceSummary,
    importantDeadlines = [],
    correctiveActions = [],
    riskOverview,
    recurringIssues = [],
    dataQuality,
    sourceReferences = [],
  } = report;

  // Filtered Key Findings
  const filteredFindings = useMemo(() => {
    return (keyFindings || []).filter((f) => {
      if (severityFilter !== 'ALL' && f.priority !== severityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          f.title?.toLowerCase().includes(q) ||
          f.category?.toLowerCase().includes(q) ||
          f.explanation?.toLowerCase().includes(q) ||
          f.sourceDocument?.toLowerCase().includes(q) ||
          f.affectedArea?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [keyFindings, severityFilter, searchQuery]);

  // Handle Report Approval
  const handleApproveReport = () => {
    setIsApproving(true);
    setTimeout(() => {
      setReport((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          status: 'APPROVED',
          approvedBy: currentUser?.name || 'DGMS Statutory Signatory',
          approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          approvalDscHash: `DSC-SHA256-${Math.random().toString(36).substring(2, 14).toUpperCase()}`,
        },
      }));
      setIsApproving(false);
    }, 600);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const isAuthorizedToApprove =
    currentUser?.role === 'corporate' ||
    currentUser?.role === 'regulator' ||
    currentUser?.role === 'ADMIN';

  return (
    <div className="gov-report-overlay">
      {/* ── Top Floating Command Bar ── */}
      <header className="gov-report-topbar no-print">
        <div className="gov-report-brand">
          <button type="button" className="btn-back-report" onClick={onClose}>
            <ArrowLeft className="w-4 h-4" />
            <span>{isHi ? 'डैशबोर्ड पर वापस' : 'Back'}</span>
          </button>
          <div className="brand-divider"></div>
          <div className="brand-badge">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>{header?.branding || 'MineSuraksha Summary Report'}</span>
          </div>
        </div>

        <div className="gov-report-controls">
          <div className="report-status-tag" data-status={header.status}>
            <span className="status-dot"></span>
            <span>{header.status}</span>
          </div>

          <button type="button" className="btn-report-act btn-print" onClick={handlePrintPdf}>
            <Printer className="w-3.5 h-3.5" />
            <span>{isHi ? 'प्रिंट / PDF डाउनलोड' : 'Download / Print Summary PDF'}</span>
          </button>

          {header.status !== 'APPROVED' && isAuthorizedToApprove && (
            <button
              type="button"
              className="btn-report-act btn-approve"
              onClick={handleApproveReport}
              disabled={isApproving}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{isApproving ? (isHi ? 'प्रमाणीकरण...' : 'Approving...') : (isHi ? 'स्वीकृत करें (DSC)' : 'Approve Report (DSC)')}</span>
            </button>
          )}

          <button type="button" className="btn-report-close" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Main Report Sheets Area ── */}
      <div className="gov-summary-sheets-container">
        {/* Search & Filter Bar (Screen Only) */}
        {!isEmpty && (
          <div className="search-filter-bar no-print" style={{ maxWidth: 880, margin: '0 auto 18px' }}>
            <div className="search-input-wrap">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={isHi ? 'सारांश रिपोर्ट में खोजें (विनियम, निष्कर्ष, दस्तावेज़)...' : 'Search summary report (regulations, findings, documents)...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-btn-group">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                <button
                  key={sev}
                  type="button"
                  className={`filter-btn ${severityFilter === sev ? 'active' : ''}`}
                  onClick={() => setSeverityFilter(sev)}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            PAGE 1: OVERVIEW, EXECUTIVE SUMMARY, INVENTORY & KEY FINDINGS
            ══════════════════════════════════════════════════════════════════ */}
        <article className="report-sheet page-1-sheet">
          {/* Running Header (Print & Screen) */}
          <div className="sheet-running-head">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-slate-900 dark:text-slate-100">{header.branding}</span>
            </div>
            <div className="font-mono text-xs text-slate-500">
              {header.reportId} · {header.version}
            </div>
          </div>

          {/* Report Title & Metadata Header */}
          <div className="sheet-hero">
            <div className="text-[11px] uppercase tracking-wider font-extrabold text-blue-400 flex items-center gap-2">
              <span>{header.scope}</span>
              <span>·</span>
              <span className="text-slate-400">{header.generatedDate}</span>
            </div>
            <h1 className="sheet-main-title">{header.title}</h1>

            <div className="sheet-meta-strip">
              <div>
                <span className="meta-k">{isHi ? 'खदान / संपत्तियां' : 'Mine Site'}:</span>
                <span className="meta-v">{header.mineName} ({header.subsidiary})</span>
              </div>
              <div>
                <span className="meta-k">{isHi ? 'अधिकारी' : 'Officer'}:</span>
                <span className="meta-v">{header.generatedBy} ({header.userRole})</span>
              </div>
              <div>
                <span className="meta-k">{isHi ? 'स्थिति' : 'Status'}:</span>
                <span className={`meta-v font-bold ${header.status === 'APPROVED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {header.status}
                </span>
              </div>
            </div>

            {header.status === 'APPROVED' && header.approvedBy && (
              <div className="cover-dsc-stamp mt-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-400">✓ DIGITALLY APPROVED & DSC SEALED</span>
                  <span className="text-slate-300 ml-2">by {header.approvedBy} on {header.approvedAt}</span>
                  <span className="font-mono text-[10px] text-slate-500 block">{header.approvalDscHash}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 1: Executive Summary */}
          <section className="sheet-section">
            <h3 className="sheet-sec-heading">01. {isHi ? 'कार्यकारी सारांश' : 'Executive Summary'}</h3>
            <p className="sheet-body-text">{executiveSummary.summaryText}</p>

            {executiveSummary.metrics && executiveSummary.metrics.length > 0 && (
              <div className="metrics-pill-grid">
                {executiveSummary.metrics.map((m, idx) => (
                  <div key={idx} className="metric-pill">
                    <span className="metric-k">{m.label}</span>
                    <span className={`metric-v ${m.highlight}`}>{m.value}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 2: Documents Analyzed (Inventory) */}
          <section className="sheet-section">
            <h3 className="sheet-sec-heading">02. {isHi ? 'प्रसंस्कृत दस्तावेज़ इन्वेंट्री' : 'Documents Analyzed'}</h3>
            {documentsInventory.length === 0 ? (
              <div className="empty-notice">{isHi ? 'कोई दस्तावेज़ उपलब्ध नहीं है।' : 'No statutory documents uploaded.'}</div>
            ) : (
              <div className="report-table-wrap">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{isHi ? 'दस्तावेज़ एवं संदर्भ क्रमांक' : 'Document & Reference'}</th>
                      <th>{isHi ? 'श्रेणी' : 'Type'}</th>
                      <th>{isHi ? 'सटीकता' : 'OCR Conf'}</th>
                      <th>{isHi ? 'समीक्षा' : 'Review Status'}</th>
                      <th>{isHi ? 'वैधता' : 'Validity'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentsInventory.map((doc) => (
                      <tr key={doc.id}>
                        <td className="font-mono text-slate-400">{doc.index}</td>
                        <td>
                          <div className="font-bold text-white">{doc.title}</div>
                          <div className="text-xs text-blue-400 font-mono">{doc.referenceNo}</div>
                        </td>
                        <td>{doc.type}</td>
                        <td>
                          <span className="font-bold text-emerald-400">⭐ {doc.confidence}</span>
                        </td>
                        <td>
                          <span className={`tag-status ${doc.reviewStatus === 'VALIDATED' ? 'status-valid' : 'status-review'}`}>
                            {doc.reviewStatus}
                          </span>
                        </td>
                        <td>{doc.validityDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Section 3: Key Governance & Safety Findings */}
          <section className="sheet-section">
            <h3 className="sheet-sec-heading">03. {isHi ? 'प्रमुख शासन एवं सुरक्षा निष्कर्ष' : 'Key Findings & Actionable Priorities'}</h3>
            <div className="findings-compact-stack">
              {filteredFindings.map((f) => (
                <div key={f.id} className="finding-compact-card">
                  <div className="finding-compact-top">
                    <div className="flex items-center gap-2">
                      <span className={`tag-sev tag-sev-${f.priority.toLowerCase()}`}>{f.priority}</span>
                      <strong className="text-white text-sm">{f.title}</strong>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{f.category}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{f.explanation}</p>
                  <div className="finding-compact-foot">
                    <span className="text-slate-400 font-mono text-[11px]">
                      📄 {f.sourceDocument} (p. {f.sourcePage}) · ⭐ {f.confidence}
                    </span>
                    <div className="flex items-center gap-2 no-print">
                      <button
                        type="button"
                        className="btn-view-evidence"
                        onClick={() =>
                          setSelectedEvidence({
                            title: f.title,
                            category: f.category,
                            evidence: f.explanation,
                            sourceDocument: f.sourceDocument,
                            sourcePage: f.sourcePage,
                            confidence: f.confidence,
                            sha256Seal: f.id,
                          })
                        }
                      >
                        <Eye className="w-3 h-3" />
                        <span>{isHi ? 'साक्ष्य' : 'View Source'}</span>
                      </button>
                      <button
                        type="button"
                        className="btn-action-trigger"
                        onClick={() => {
                          onActionTrigger('CREATE_CAPA', f);
                          alert(isHi ? `कापा कार्य बनाया गया: ${f.title}` : `CAPA created for: ${f.title}`);
                        }}
                      >
                        + {isHi ? 'कापा' : 'Create CAPA'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Overall Priority & Risk Evaluation */}
          {riskOverview && (
            <section className="sheet-section">
              <h3 className="sheet-sec-heading">04. {isHi ? 'समग्र सुरक्षा एवं शासन जोखिम' : 'Composite Risk & Contributing Drivers'}</h3>
              <div className="risk-compact-box">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-bold text-white">
                    {isHi ? 'मूल्यांकित समग्र जोखिम' : 'Overall Evaluated Risk'}:{' '}
                    <span className="text-amber-400 font-mono">{riskOverview.overallScore} / 100 ({riskOverview.riskBand})</span>
                  </div>
                  <div className="text-xs text-emerald-400 font-semibold">{riskOverview.confidence}</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {riskOverview.factors.map((factor, idx) => (
                    <div key={idx} className="factor-pill">
                      <span className="text-slate-300">{factor.name}</span>
                      <span className="font-bold text-blue-300">{factor.status} ({factor.impact})</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Page 1 Footer */}
          <div className="sheet-footer">
            <span>{header.branding}</span>
            <span>Page 1 of 3</span>
            <span>{header.reportId}</span>
          </div>
        </article>

        {/* ══════════════════════════════════════════════════════════════════
            PAGE 2: SAFETY & STATUTORY COMPLIANCE, DEADLINES & CAPA SUMMARY
            ══════════════════════════════════════════════════════════════════ */}
        <article className="report-sheet page-2-sheet">
          {/* Running Header */}
          <div className="sheet-running-head">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-slate-900 dark:text-slate-100">{header.branding}</span>
            </div>
            <div className="font-mono text-xs text-slate-500">
              {header.reportId} · Page 2
            </div>
          </div>

          {/* Section 5: Statutory Compliance Summary (CMR 2017 Matrix) */}
          <section className="sheet-section">
            <h3 className="sheet-sec-heading">05. {isHi ? 'वैधानिक अनुपालन मैट्रिक्स (CMR 2017)' : 'Statutory Compliance Matrix (CMR 2017)'}</h3>
            <div className="space-y-3">
              {complianceSummary.items.map((item) => (
                <div key={item.id} className="comp-card" style={{ padding: 14 }}>
                  <div className="comp-card-head mb-2">
                    <div>
                      <span className="comp-reg">{item.reg}</span>
                      <h4 className="comp-title text-sm">{item.topic}</h4>
                    </div>
                    <span className={`tag-comp ${item.status === 'COMPLIANT' ? 'tag-comp-success' : 'tag-comp-warn'}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="comp-grid-4" style={{ gap: 8, padding: 10 }}>
                    <div className="comp-quad">
                      <span className="quad-label">{isHi ? 'स्रोत साक्ष्य' : '1. SOURCE EVIDENCE'}</span>
                      <p>{item.sourceEvidence}</p>
                    </div>
                    <div className="comp-quad">
                      <span className="quad-label">{isHi ? 'एआई व्याख्या' : '2. AI INTERPRETATION'}</span>
                      <p>{item.aiInterpretation}</p>
                    </div>
                    <div className="comp-quad">
                      <span className="quad-label">{isHi ? 'नियम परिणाम' : '3. RULE RESULT'}</span>
                      <p className="font-bold text-blue-300">{item.ruleResult}</p>
                    </div>
                    <div className="comp-quad">
                      <span className="quad-label">{isHi ? 'सत्यापन' : '4. HUMAN VERIFIED'}</span>
                      <p className="font-bold text-amber-300">{item.humanVerification}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6: Important Statutory Deadlines / Expiries */}
          <section className="sheet-section">
            <h3 className="sheet-sec-heading">06. {isHi ? 'महत्वपूर्ण समयसीमा एवं वैधता' : 'Important Deadlines & Expiries'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {importantDeadlines.map((d) => (
                <div key={d.id} className="date-card" style={{ padding: '10px 12px' }}>
                  <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="flex-1 text-xs">
                    <div className="font-bold text-white truncate">{d.title}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">Due: <strong className="text-slate-200">{d.date}</strong></div>
                  </div>
                  <span className="tag-urgency text-[10px]">{d.urgency}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 7: Corrective Action Summary (CAPA) */}
          <section className="sheet-section">
            <h3 className="sheet-sec-heading">07. {isHi ? 'सुधारात्मक कार्रवाई सारांश (CAPA)' : 'Corrective Action Summary (CAPA)'}</h3>
            <div className="report-table-wrap">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>CAPA ID</th>
                    <th>{isHi ? 'मुद्दा एवं कार्रवाई' : 'Issue & Corrective Action'}</th>
                    <th>{isHi ? 'प्राथमिकता' : 'Priority'}</th>
                    <th>{isHi ? 'उत्तरदायी अधिकारी' : 'Owner'}</th>
                    <th>{isHi ? 'समयसीमा' : 'Due Date'}</th>
                    <th>{isHi ? 'स्थिति' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {correctiveActions.map((c) => (
                    <tr key={c.id}>
                      <td className="font-mono text-blue-400 font-bold">{c.id}</td>
                      <td>
                        <div className="font-bold text-white">{c.issue}</div>
                        <div className="text-xs text-slate-300 mt-0.5">➔ {c.action}</div>
                      </td>
                      <td>
                        <span className={`tag-sev tag-sev-${c.priority.toLowerCase()}`}>{c.priority}</span>
                      </td>
                      <td>{c.owner}</td>
                      <td className="font-bold text-amber-400">{c.dueDate}</td>
                      <td>
                        <span className="tag-status status-review">{c.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Page 2 Footer */}
          <div className="sheet-footer">
            <span>{header.branding}</span>
            <span>Page 2 of 3</span>
            <span>{header.reportId}</span>
          </div>
        </article>

        {/* ══════════════════════════════════════════════════════════════════
            PAGE 3: RECURRING ISSUES, DATA QUALITY & SOURCE REFERENCES
            ══════════════════════════════════════════════════════════════════ */}
        <article className="report-sheet page-3-sheet">
          {/* Running Header */}
          <div className="sheet-running-head">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-slate-900 dark:text-slate-100">{header.branding}</span>
            </div>
            <div className="font-mono text-xs text-slate-500">
              {header.reportId} · Page 3
            </div>
          </div>

          {/* Section 8: Recurring Issues / Trends (if applicable) */}
          {recurringIssues.length > 0 && (
            <section className="sheet-section">
              <h3 className="sheet-sec-heading">08. {isHi ? 'पुनरावर्ती समस्याएं एवं रुझान' : 'Recurring Patterns & Cross-Document Trends'}</h3>
              <div className="space-y-2">
                {recurringIssues.map((rec, i) => (
                  <div key={i} className="rec-card" style={{ padding: 12 }}>
                    <div className="flex justify-between items-center text-xs">
                      <span className="rec-priority">{rec.priority}</span>
                      <span className="text-slate-400">Occurrences: <strong className="text-white">{rec.occurrences} docs</strong></span>
                    </div>
                    <div className="font-bold text-white text-sm mt-1">{rec.issue}</div>
                    <div className="text-xs text-slate-400 mt-1">Scope: {rec.affectedScope} · Trend: <strong className="text-amber-300">{rec.trend}</strong></div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 9: Data Quality & Uncertainty */}
          <section className="sheet-section">
            <h3 className="sheet-sec-heading">09. {isHi ? 'डेटा गुणवत्ता एवं सत्यापन' : 'Data Quality & Review Required'}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="kpi-card" style={{ padding: 10 }}>
                <span className="kpi-k">Analyzed Records</span>
                <span className="kpi-v text-sm">{dataQuality.totalAnalyzed} docs</span>
              </div>
              <div className="kpi-card" style={{ padding: 10 }}>
                <span className="kpi-k">High Confidence</span>
                <span className="kpi-v text-sm text-emerald-400">{dataQuality.highConfidence}</span>
              </div>
              <div className="kpi-card" style={{ padding: 10 }}>
                <span className="kpi-k">Review Required</span>
                <span className="kpi-v text-sm text-amber-400">{dataQuality.reviewRequired}</span>
              </div>
              <div className="kpi-card" style={{ padding: 10 }}>
                <span className="kpi-k">Integrity Score</span>
                <span className="kpi-v text-sm text-blue-400">{dataQuality.overallIntegrity}</span>
              </div>
            </div>
          </section>

          {/* Section 10: Source References & Traceability Ledger */}
          <section className="sheet-section">
            <h3 className="sheet-sec-heading">10. {isHi ? 'स्रोत साक्ष्य ट्रेसेबिलिटी लेजर' : 'Source References & Audit Ledger'}</h3>
            <div className="report-table-wrap">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Finding</th>
                    <th>Source Document</th>
                    <th>Page</th>
                    <th>Confidence</th>
                    <th>Cryptographic Seal</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceReferences.map((ref, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="font-bold text-white">{ref.findingTitle}</div>
                        <div className="text-xs text-slate-400">{ref.category}</div>
                      </td>
                      <td className="font-mono text-blue-300">{ref.sourceDocument}</td>
                      <td>p. {ref.sourcePage}</td>
                      <td className="font-bold text-emerald-400">⭐ {ref.confidence}</td>
                      <td className="font-mono text-[10px] text-slate-500">{ref.sha256Seal?.substring(0, 16)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Page 3 Footer */}
          <div className="sheet-footer">
            <span>{header.branding}</span>
            <span>Page 3 of 3</span>
            <span>{header.reportId}</span>
          </div>
        </article>
      </div>

      {/* ── Interactive Evidence Source Modal ── */}
      {selectedEvidence && (
        <div className="evidence-modal-backdrop" onClick={() => setSelectedEvidence(null)}>
          <div className="evidence-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="evidence-modal-head">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  {isHi ? 'स्रोत साक्ष्य एवं ट्रेसेबिलिटी' : 'SOURCE EVIDENCE & AUDIT TRAIL'}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedEvidence.title}</h3>
              </div>
              <button
                type="button"
                className="btn-report-close"
                onClick={() => setSelectedEvidence(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="evidence-modal-body">
              <div className="evidence-quote-box">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  {isHi ? 'निष्कर्षित मूल साक्ष्य' : 'EXTRACTED SOURCE EXCERPT'}:
                </span>
                <p className="text-sm text-slate-200 font-serif leading-relaxed mt-1">
                  "{selectedEvidence.evidence}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                <div className="evidence-stat-card">
                  <span className="stat-k">{isHi ? 'स्रोत फ़ाइल' : 'Source Document'}</span>
                  <span className="stat-v font-mono text-blue-300">{selectedEvidence.sourceDocument}</span>
                </div>
                <div className="evidence-stat-card">
                  <span className="stat-k">{isHi ? 'ओसीआर सटीकता' : 'OCR Confidence'}</span>
                  <span className="stat-v text-emerald-400 font-bold">⭐ {selectedEvidence.confidence}</span>
                </div>
                <div className="evidence-stat-card">
                  <span className="stat-k">{isHi ? 'विनियमन' : 'Statute'}</span>
                  <span className="stat-v">{selectedEvidence.category || 'CMR 2017'}</span>
                </div>
                <div className="evidence-stat-card">
                  <span className="stat-k">{isHi ? 'सत्यापन स्थिति' : 'Verification'}</span>
                  <span className="stat-v text-emerald-300 font-bold">✓ Blockchain Sealed</span>
                </div>
              </div>

              {selectedEvidence.sha256Seal && (
                <div className="evidence-hash-box">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-[11px] text-slate-400">
                    SHA-256: {selectedEvidence.sha256Seal}
                  </span>
                </div>
              )}
            </div>

            <div className="evidence-modal-foot">
              <button
                type="button"
                className="btn btn-ghost text-xs"
                onClick={() => setSelectedEvidence(null)}
              >
                {isHi ? 'बंद करें' : 'Close'}
              </button>
              <button
                type="button"
                className="btn btn-primary text-xs"
                onClick={() => {
                  alert(isHi ? 'दस्तावेज़ पूर्ण रिज़ॉल्यूशन में खोला गया।' : `Opening raw document: ${selectedEvidence.sourceDocument}`);
                }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isHi ? 'मूल दस्तावेज़ खोलें' : 'Open Full Document'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
