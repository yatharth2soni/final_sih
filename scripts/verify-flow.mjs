// E2E Flow Verification Script for Khanan Suraksha
const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:4000/api/v1';

async function runVerification() {
  console.log('====================================================');
  console.log('🛡️ KHANAN SURAKSHA: FULL END-TO-END FLOW VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function step(name, fn) {
    try {
      process.stdout.write(`⏳ [TEST] ${name}... `);
      const res = await fn();
      console.log('✅ PASSED');
      if (res) console.log(`   └─ ${res}`);
      passed++;
      return res;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  // 1. Check Frontend Servability
  await step('Frontend SPA Web Server (Vite)', async () => {
    const res = await fetch(FRONTEND_URL);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const text = await res.text();
    if (!text.includes('Khanan Suraksha') && !text.includes('id="root"')) {
      throw new Error('Root HTML not rendered');
    }
    return `HTTP 200 OK — HTML & Assets Served from ${FRONTEND_URL}`;
  });

  // 2. Authentication & Scoping
  let token = '';
  let currentUser = null;
  await step('Backend JWT Authentication (Mine Safety Official)', async () => {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'r.mahapatra@coalindia.gov.in',
        password: 'Test@1234',
      }),
    });
    if (!res.ok) throw new Error(`Auth failed with status ${res.status}`);
    const json = await res.json();
    const data = json.data || json;
    token = data.accessToken || data.access_token || data.token;
    currentUser = data.user;
    if (!token) throw new Error('JWT accessToken missing in response');
    return `Logged in as ${currentUser.name} (${currentUser.role}) — Token received`;
  });

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Helper to parse JSON with data unwrapping
  async function parse(res) {
    const json = await res.json();
    return (json && typeof json === 'object' && 'data' in json) ? json.data : json;
  }

  // 3. Accessible Mines Scoping
  let selectedMine = null;
  await step('Mine Scoping & Geometry Retrieval', async () => {
    const res = await fetch(`${BACKEND_URL}/mines`, { headers: authHeaders });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const mines = await parse(res);
    if (!Array.isArray(mines) || mines.length === 0) throw new Error('No mines returned');
    selectedMine = mines.find(m => m.code === 'BCCL-JHA-BLK4') || mines[0];
    return `Retrieved ${mines.length} mine(s) — Selected Assigned: "${selectedMine.name}" (${selectedMine.code})`;
  });

  // 4. Governance Control Center Overview
  await step('Governance Control Center Aggregated Overview', async () => {
    const res = await fetch(`${BACKEND_URL}/governance-control/overview?mineId=${selectedMine.id}`, { headers: authHeaders });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const ov = await parse(res);
    return `Overall Risk: ${ov.risk.overallScore}/100 (${ov.risk.band}) · Avg Compliance: ${ov.compliance.overallRate}% · Overdue CAPAs: ${ov.summary.overdueCapas}`;
  });

  // 5. Dynamic AI Risk Assessment
  await step('AI Risk Assessment & DGMS Regulatory Factors', async () => {
    const res = await fetch(`${BACKEND_URL}/mines/${selectedMine.id}/risk-score`, { headers: authHeaders });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const risk = await parse(res);
    return `Score: ${risk.score}/100 (${risk.band}) · Violations wt: ${risk.factors?.violations?.weightedScore} · CAPA wt: ${risk.factors?.capas?.weightedScore}`;
  });

  // 6. Field Inspection Lifecycle (Create -> Start -> Add Observation)
  let inspectionId = '';
  let observationId = '';
  await step('Field Inspection Initiation & Start', async () => {
    const res = await fetch(`${BACKEND_URL}/inspections`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        mineId: selectedMine.id,
        scheduledFor: new Date().toISOString(),
        purpose: 'E2E Strata Support & Roof Control Verification',
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const insp = await parse(res);
    inspectionId = insp.id;

    // Transition to IN_PROGRESS
    const startRes = await fetch(`${BACKEND_URL}/inspections/${inspectionId}/start`, {
      method: 'POST',
      headers: authHeaders,
    });
    if (!startRes.ok) throw new Error(`Start inspection status ${startRes.status}`);
    const started = await parse(startRes);

    return `Inspection Created & Started: ID #${inspectionId.slice(0, 8)} (Status: ${started.status})`;
  });

  await step('Geotagged Field Observation Logging', async () => {
    const res = await fetch(`${BACKEND_URL}/inspections/${inspectionId}/observations`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        observations: [
          {
            title: 'Strata roof sag observed near Panel B-3 junction',
            description: 'Noticeable 9mm convergence detected over 24h period exceeding baseline limit.',
            category: 'SAFETY',
            severity: 'CRITICAL',
            findingType: 'NON_COMPLIANCE',
            isViolationCandidate: true,
          }
        ],
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const obsList = await parse(res);
    observationId = Array.isArray(obsList) ? obsList[0]?.id : obsList?.id;
    return `Observation Logged: ID #${observationId?.slice(0, 8)} (CRITICAL / NON_COMPLIANCE)`;
  });

  // 7. Auto-Raise Statutory Violation
  let violationId = '';
  await step('Statutory Violation Elevation', async () => {
    const res = await fetch(`${BACKEND_URL}/observations/${observationId}/violation`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Statutory Violation: CMR 2017 Reg. 108 Roof Support Non-Compliance',
        description: 'Roof bolt tension below 50 kN standard with active convergence drift.',
        severity: 'CRITICAL',
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const viol = await parse(res);
    violationId = viol.id;
    return `Violation Elevated: ID #${violationId?.slice(0, 8)} — Status: ${viol.status}`;
  });

  // 8. Assign Corrective Action (CAPA)
  let capaId = '';
  await step('Closed-Loop Corrective Action (CAPA) Assignment', async () => {
    const res = await fetch(`${BACKEND_URL}/violations/${violationId}/corrective-actions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: `Re-bolt & re-survey strata at ${selectedMine.name}`,
        description: 'Install secondary props and verify convergence within 24 hours SLA.',
        assignedToId: currentUser.id,
        dueAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const capa = await parse(res);
    capaId = capa.id;
    return `CAPA Assigned: ID #${capaId?.slice(0, 8)} — SLA: 24 Hours — Status: ${capa.status}`;
  });

  // 9. Cryptographic Audit Chain Verification
  await step('HMAC-SHA-256 Tamper-Proof Audit Chain Verification', async () => {
    const res = await fetch(`${BACKEND_URL}/audit-logs/verify?fromSequence=1&toSequence=5`, { headers: authHeaders });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const auditRes = await parse(res);
    if (!auditRes.valid) throw new Error(`Chain broken at sequence #${auditRes.brokenAtSequence}`);
    return `Cryptographic Chain Verified: Blocks #${auditRes.fromSequence}..#${auditRes.toSequence} (${auditRes.verifiedCount} blocks validated) — Valid: true`;
  });

  // 10. Governed AI Assistant (English & Hindi)
  await step('Governed AI Assistant Query (English & Hindi)', async () => {
    const resEn = await fetch(`${BACKEND_URL}/assistant/query`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        question: 'Why is Jharia Block-4 at high risk?',
        language: 'en',
        mineId: selectedMine.id,
      }),
    });
    if (!resEn.ok) throw new Error(`English query status ${resEn.status}`);
    const dataEn = await parse(resEn);

    const resHi = await fetch(`${BACKEND_URL}/assistant/query`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        question: 'खदान की सुरक्षा स्थिति क्या है?',
        language: 'hi',
        mineId: selectedMine.id,
      }),
    });
    if (!resHi.ok) throw new Error(`Hindi query status ${resHi.status}`);
    const dataHi = await parse(resHi);

    return `EN: "${dataEn.answer?.slice(0, 45)}..."\n   └─ HI: "${dataHi.answer?.slice(0, 45)}..."`;
  });

  // 11. Statutory Form III-A & Risk Dossier Exporters
  await step('Statutory Form III-A & Risk Dossier Binary Generation', async () => {
    const resCsv = await fetch(`${BACKEND_URL}/reports/statutory/export?format=csv&mineId=${selectedMine.id}`, { headers: authHeaders });
    if (!resCsv.ok) throw new Error(`Form III-A CSV export status ${resCsv.status}`);
    const csvBlob = await resCsv.blob();

    const resDossier = await fetch(`${BACKEND_URL}/reports/risk-dossier/${selectedMine.id}`, { headers: authHeaders });
    if (!resDossier.ok) throw new Error(`Risk Dossier export status ${resDossier.status}`);
    const dossierBlob = await resDossier.blob();

    return `Form III-A CSV (${csvBlob.size} bytes) · Risk Dossier PDF (${dossierBlob.size} bytes) generated`;
  });

  console.log('\n====================================================');
  console.log(`📊 FINAL RESULT: ${passed} Passed, ${failed} Failed`);
  console.log(failed === 0 ? '🏆 ALL END-TO-END FLOWS OPERATIONAL & VERIFIED!' : '⚠️ SOME CHECKS FAILED');
  console.log('====================================================\n');
}

runVerification().catch(console.error);
