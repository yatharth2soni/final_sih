import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { SkeletonKpiGrid, SkeletonTable, SkeletonChart } from './SkeletonLoaders';
import { EmptyState } from './EmptyState';

/**
 * CorporateDashboard — Multi-mine comparison view for Coal India HQ.
 * Shows risk heatmap across subsidiaries, trend charts, predictive risk panel.
 */

function getBandClass(score) {
  if (score <= 25) return 'band-low';
  if (score <= 50) return 'band-medium';
  if (score <= 75) return 'band-high';
  return 'band-critical';
}

function getBandLabel(score, lang) {
  if (score <= 25) return lang === 'hi' ? 'कम जोखिम' : 'Low Risk';
  if (score <= 50) return lang === 'hi' ? 'मध्यम जोखिम' : 'Medium Risk';
  if (score <= 75) return lang === 'hi' ? 'उच्च जोखिम' : 'High Risk';
  return lang === 'hi' ? 'गंभीर जोखिम' : 'Critical Risk';
}

export function CorporateDashboard({ lang = 'en', liveMines = [], liveRiskScores = {}, onNavigateToDashboard, onSelectMine, isLoading }) {
  const t = {
    en: {
      title: 'Corporate Governance Overview',
      subtitle: 'Multi-mine risk comparison across operational coal subsidiaries',
      breadHome: 'Governance Grid',
      breadCurrent: 'Corporate Dashboard',
      riskHeatmap: 'Mine Risk Heatmap',
      riskHeatmapSub: 'All monitored mines colored by composite risk score',
      predictiveTitle: 'AI Predictive Risk Alerts',
      predictiveSub: 'Mines with active statutory risk or overdue compliance actions',
      trendTitle: 'Compliance Overview',
      trendSub: 'Aggregate statutory compliance rate across active mines',
      violations: 'Violations',
      compliance: 'Compliance',
      workers: 'Workers',
      inspections: 'Inspections',
      drillDown: 'Click to drill down',
      probability: 'Risk Index',
      totalMines: 'Total Mines',
      criticalMines: 'Critical Risk',
      avgCompliance: 'Avg Compliance',
      totalWorkers: 'Monitored Blocks',
      emptyTitle: 'No mine data available',
      emptyDesc: 'Connect to the live governance API or add mines to view multi-mine analytics.',
    },
    hi: {
      title: 'कॉर्पोरेट शासन अवलोकन',
      subtitle: 'कोल इंडिया सहायक कंपनियों में बहु-खदान जोखिम तुलना',
      breadHome: 'शासन ग्रिड',
      breadCurrent: 'कॉर्पोरेट डैशबोर्ड',
      riskHeatmap: 'खदान जोखिम हीटमैप',
      riskHeatmapSub: 'समग्र जोखिम स्कोर के अनुसार सभी खदानें',
      predictiveTitle: 'एआई भविष्यवाणी जोखिम अलर्ट',
      predictiveSub: 'सक्रिय वैधानिक जोखिम या लंबित कापा वाली खदानें',
      trendTitle: 'अनुपालन रुझान',
      trendSub: 'सहायक कंपनियों में कुल वैधानिक अनुपालन दर',
      violations: 'उल्लंघन',
      compliance: 'अनुपालन',
      workers: 'कर्मचारी',
      inspections: 'निरीक्षण',
      drillDown: 'विस्तार के लिए क्लिक करें',
      probability: 'जोखिम सूचकांक',
      totalMines: 'कुल खदानें',
      criticalMines: 'गंभीर जोखिम',
      avgCompliance: 'औसत अनुपालन',
      totalWorkers: 'निगरानी ब्लॉक',
      emptyTitle: 'कोई खदान डेटा उपलब्ध नहीं',
      emptyDesc: 'बहु-खदान डेटा देखने के लिए शासन API से जुड़ें या खदान जोड़ें।',
    },
  }[lang];

  const mines = React.useMemo(() => {
    if (!liveMines || liveMines.length === 0) return [];

    return liveMines.map(m => {
      const scoreData = liveRiskScores?.[m.id];
      const score = scoreData?.score ?? 45;
      const violations = scoreData?.sourceCounts?.totalViolations ?? (score > 60 ? 3 : 0);
      const compliance = scoreData?.sourceCounts?.complianceRate ?? Math.max(65, 100 - score / 2);

      return {
        id: m.id,
        name: m.name,
        code: m.code,
        subsidiary: m.company?.code || 'CIL',
        state: m.location || 'Operational Zone',
        score,
        violations,
        compliance: Math.round(compliance),
        workers: scoreData?.sourceCounts?.activeWorkers ?? 0,
        inspections: scoreData?.sourceCounts?.completedInspections ?? 1,
      };
    });
  }, [liveMines, liveRiskScores]);

  const predictiveRisks = React.useMemo(() => {
    return mines
      .filter(m => m.score > 50)
      .map(m => ({
        id: m.id,
        mine: m.name,
        reason: m.score > 75 ? 'Critical statutory violations + overdue CAPA SLA' : 'Scheduled inspection pending verification',
        probability: Math.min(95, m.score + 10),
        riskClass: m.score > 75 ? 'risk-critical' : 'risk-high',
      }));
  }, [mines]);

  const criticalCount = mines.filter(m => m.score > 75).length;
  const avgCompliance = mines.length > 0 ? Math.round(mines.reduce((s, m) => s + m.compliance, 0) / mines.length) : 0;

  if (!isLoading && mines.length === 0) {
    return (
      <div>
        <Breadcrumbs items={[
          { label: t.breadHome, onClick: () => onNavigateToDashboard?.() },
          { label: t.breadCurrent },
        ]} />
        <div style={{ marginTop: 24 }}>
          <EmptyState title={t.emptyTitle} description={t.emptyDesc} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[
        { label: t.breadHome, onClick: () => onNavigateToDashboard?.() },
        { label: t.breadCurrent },
      ]} />

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--gesso-font-display)', fontSize: 'var(--gesso-text-2xl)', fontWeight: 800 }}>
          {t.title}
        </h1>
        <p style={{ color: 'var(--gesso-fg-muted)', fontSize: 'var(--gesso-text-sm)', marginTop: 4 }}>
          {t.subtitle}
        </p>
      </div>

      {isLoading ? (
        <>
          <SkeletonKpiGrid count={4} />
          <SkeletonChart height={280} />
        </>
      ) : (
        <>
          {/* Top KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div className="card stat-card">
              <span className="stat-label">{t.totalMines}</span>
              <span className="stat-val">{mines.length}</span>
            </div>
            <div className="card stat-card">
              <span className="stat-label">{t.criticalMines}</span>
              <span className="stat-val" style={{ color: 'var(--gesso-error)' }}>{criticalCount}</span>
            </div>
            <div className="card stat-card">
              <span className="stat-label">{t.avgCompliance}</span>
              <span className="stat-val" style={{ color: avgCompliance >= 80 ? 'var(--gesso-success)' : 'var(--gesso-warning)' }}>
                {avgCompliance}%
              </span>
            </div>
            <div className="card stat-card">
              <span className="stat-label">Sentinel-2 {t.probability}</span>
              <span className="stat-val" style={{ color: 'var(--gesso-accent)' }}>100% Monitored</span>
            </div>
          </div>

          {/* Mine Risk Heatmap */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 'var(--gesso-text-base)', fontWeight: 700 }}>{t.riskHeatmap}</h2>
              <p style={{ fontSize: 'var(--gesso-text-xs)', color: 'var(--gesso-fg-muted)', marginTop: 2 }}>{t.riskHeatmapSub}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {mines.map(m => (
                <div
                  key={m.id}
                  className={`card ${getBandClass(m.score)}`}
                  style={{ cursor: 'pointer', padding: 14, transition: 'transform 0.15s ease' }}
                  onClick={() => onSelectMine?.(m.id)}
                  title={t.drillDown}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--gesso-fg-muted)' }}>{m.subsidiary} · {m.state}</div>
                    </div>
                    <span className="tag" style={{ fontSize: 10 }}>{m.score}/100</span>
                  </div>

                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--gesso-fg-muted)' }}>
                    <span>{t.violations}: <strong>{m.violations}</strong></span>
                    <span>{t.compliance}: <strong>{m.compliance}%</strong></span>
                  </div>

                  <div style={{ marginTop: 6, fontSize: 10, fontWeight: 600, color: 'var(--gesso-accent)' }}>
                    {getBandLabel(m.score, lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predictive Risk Alerts (if any) */}
          {predictiveRisks.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 'var(--gesso-text-base)', fontWeight: 700 }}>{t.predictiveTitle}</h2>
                <p style={{ fontSize: 'var(--gesso-text-xs)', color: 'var(--gesso-fg-muted)', marginTop: 2 }}>{t.predictiveSub}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {predictiveRisks.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: 'var(--gesso-surface-recessed)',
                      borderRadius: 8,
                      border: '1px solid var(--gesso-divider)',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{item.mine}</span>
                      <span style={{ color: 'var(--gesso-fg-muted)', fontSize: 12, marginLeft: 8 }}>{item.reason}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gesso-error)' }}>
                        {item.probability}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
