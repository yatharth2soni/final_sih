import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function runE2EVerification() {
  console.log('🚀 Starting Comprehensive Frontend-to-Backend E2E Verification...\n');

  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.init();
  const server = app.getHttpServer();

  let passed = 0;
  let failed = 0;

  async function check(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Test Logins for all 4 roles
  let officialToken = '';
  let corporateToken = '';
  let regulatorToken = '';
  let contractorToken = '';

  await check('Auth: Login as Mine Official (r.mahapatra@coalindia.gov.in)', async () => {
    const res = await request(server)
      .post('/api/v1/auth/login')
      .send({ email: 'r.mahapatra@coalindia.gov.in', password: 'Test@1234' })
      .expect(200);
    if (!res.body.data?.accessToken) throw new Error('No access token returned');
    officialToken = res.body.data.accessToken;
  });

  await check('Auth: Login as Corporate Manager (corporate@coalindia.gov.in)', async () => {
    const res = await request(server)
      .post('/api/v1/auth/login')
      .send({ email: 'corporate@coalindia.gov.in', password: 'Test@1234' })
      .expect(200);
    if (!res.body.data?.accessToken) throw new Error('No access token returned');
    corporateToken = res.body.data.accessToken;
  });

  await check('Auth: Login as DGMS Regulator (regulator@dgms.gov.in)', async () => {
    const res = await request(server)
      .post('/api/v1/auth/login')
      .send({ email: 'regulator@dgms.gov.in', password: 'Test@1234' })
      .expect(200);
    if (!res.body.data?.accessToken) throw new Error('No access token returned');
    regulatorToken = res.body.data.accessToken;
  });

  await check('Auth: Login as Contractor (contractor@easterncoking.com)', async () => {
    const res = await request(server)
      .post('/api/v1/auth/login')
      .send({ email: 'contractor@easterncoking.com', password: 'Test@1234' })
      .expect(200);
    if (!res.body.data?.accessToken) throw new Error('No access token returned');
    contractorToken = res.body.data.accessToken;
  });

  // 2. Fetch Mines
  let activeMineId = '';
  await check('Mines: List accessible mines (GET /mines)', async () => {
    const res = await request(server)
      .get('/api/v1/mines')
      .set('Authorization', `Bearer ${officialToken}`)
      .expect(200);
    const mines = res.body.data;
    if (!mines || mines.length === 0) throw new Error('No mines returned');
    activeMineId = mines[0].id;
  });

  // 3. Governance Control Overview
  await check('Governance Control: Overview (GET /governance-control/overview)', async () => {
    const res = await request(server)
      .get(`/api/v1/governance-control/overview?mineId=${activeMineId}`)
      .set('Authorization', `Bearer ${officialToken}`)
      .expect(200);
    if (!res.body.data) throw new Error('No overview payload returned');
  });

  // 4. Dashboard Mine Overview
  await check('Dashboard: Mine Overview (GET /dashboard/mine/:id/overview)', async () => {
    const res = await request(server)
      .get(`/api/v1/dashboard/mine/${activeMineId}/overview`)
      .set('Authorization', `Bearer ${officialToken}`)
      .expect(200);
    if (!res.body.data) throw new Error('No dashboard payload returned');
  });

  // 5. Risk Scoring & Anomalies
  await check('Risk: Mine Risk Score (GET /mines/:id/risk-score)', async () => {
    const res = await request(server)
      .get(`/api/v1/mines/${activeMineId}/risk-score`)
      .set('Authorization', `Bearer ${officialToken}`)
      .expect(200);
    if (res.body.data?.score === undefined) throw new Error('No risk score returned');
  });

  await check('Risk: Anomalies List (GET /anomalies)', async () => {
    const res = await request(server)
      .get(`/api/v1/anomalies?mineId=${activeMineId}`)
      .set('Authorization', `Bearer ${officialToken}`)
      .expect(200);
    if (!Array.isArray(res.body.data)) throw new Error('Anomalies response is not an array');
  });

  // 6. Compliance Register & Records
  await check('Compliance: Requirements List (GET /compliance/requirements)', async () => {
    const res = await request(server)
      .get('/api/v1/compliance/requirements')
      .set('Authorization', `Bearer ${officialToken}`)
      .expect(200);
    if (!Array.isArray(res.body.data)) throw new Error('Requirements response is not an array');
  });

  await check('Compliance: Mine Records (GET /mines/:id/compliance/records)', async () => {
    const res = await request(server)
      .get(`/api/v1/mines/${activeMineId}/compliance/records`)
      .set('Authorization', `Bearer ${officialToken}`)
      .expect(200);
    if (!Array.isArray(res.body.data)) throw new Error('Compliance records is not an array');
  });

  // 7. Attendance Summary
  await check('Attendance: Summary (GET /attendance/summary)', async () => {
    const res = await request(server)
      .get(`/api/v1/attendance/summary?mineId=${activeMineId}`)
      .set('Authorization', `Bearer ${officialToken}`)
      .expect(200);
    if (!res.body.data) throw new Error('Attendance summary missing');
  });

  // 8. Full Statutory Inspection -> Observation -> Violation -> CAPA Lifecycle
  let testInspId = '';
  let testObsId = '';
  let testViolId = '';
  let testCapaId = '';

  await check('Inspections: Schedule New Inspection (POST /inspections)', async () => {
    const res = await request(server)
      .post('/api/v1/inspections')
      .set('Authorization', `Bearer ${officialToken}`)
      .send({
        mineId: activeMineId,
        scheduledFor: new Date(Date.now() + 86400000).toISOString(),
        purpose: 'E2E Full Lifecycle Shift Safety & Ventilation Audit',
      })
      .expect(201);
    testInspId = res.body.data.id;
  });

  await check('Inspections: Start Inspection (POST /inspections/:id/start)', async () => {
    await request(server)
      .post(`/api/v1/inspections/${testInspId}/start`)
      .set('Authorization', `Bearer ${officialToken}`)
      .send({})
      .expect(200);
  });

  await check('Observations: Log Field Observation (POST /inspections/:id/observations)', async () => {
    const res = await request(server)
      .post(`/api/v1/inspections/${testInspId}/observations`)
      .set('Authorization', `Bearer ${officialToken}`)
      .send({
        title: 'Roof Support Density Inadequate at Gallery 14',
        description: 'Timber prop spacing exceeds 1.5m limit specified in Support Plan Reg 108.',
        category: 'SAFETY_HAZARD',
        severity: 'HIGH',
        findingType: 'NON_COMPLIANT',
        isViolationCandidate: true,
      })
      .expect(201);
    const obs = Array.isArray(res.body.data) ? res.body.data[0] : res.body.data;
    testObsId = obs.id;
  });

  await check('Violations: Escalate Observation to Violation (POST /observations/:id/violation)', async () => {
    const res = await request(server)
      .post(`/api/v1/observations/${testObsId}/violation`)
      .set('Authorization', `Bearer ${officialToken}`)
      .send({
        title: 'CMR 2017 Reg. 108 Violation: Improper Strata Prop Spacing',
        description: 'Prop spacing violation in active extraction seam requiring immediate timber reinforcement.',
        severity: 'HIGH',
        statutoryRule: 'CMR 2017 Reg. 108',
      })
      .expect(201);
    testViolId = res.body.data.id;
  });

  await check('CAPA: Propose Corrective Action (POST /violations/:id/corrective-actions)', async () => {
    const res = await request(server)
      .post(`/api/v1/violations/${testViolId}/corrective-actions`)
      .set('Authorization', `Bearer ${officialToken}`)
      .send({
        description: 'Install additional hydraulic props and timber cogs at 1.2m intervals within 48 hours.',
        targetDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      })
      .expect(201);
    testCapaId = res.body.data.id;
  });

  await check('Inspections: Complete Inspection (POST /inspections/:id/complete)', async () => {
    await request(server)
      .post(`/api/v1/inspections/${testInspId}/complete`)
      .set('Authorization', `Bearer ${officialToken}`)
      .send({ summary: 'Inspection completed with 1 high violation flagged and CAPA assigned.' })
      .expect(200);
  });

  // 9. Contractors, Contracts & Workers
  await check('Contractors: List Agencies (GET /contractors)', async () => {
    const res = await request(server)
      .get('/api/v1/contractors')
      .set('Authorization', `Bearer ${officialToken}`)
      .expect(200);
    if (!Array.isArray(res.body.data)) throw new Error('Contractors response is not an array');
  });

  await check('Contractors: List Contracts (GET /contractor-contracts)', async () => {
    const res = await request(server)
      .get('/api/v1/contractor-contracts')
      .set('Authorization', `Bearer ${officialToken}`)
      .expect(200);
    if (!Array.isArray(res.body.data)) throw new Error('Contracts response is not an array');
  });

  await check('Contractors: List Workers (GET /workers)', async () => {
    const res = await request(server)
      .get('/api/v1/workers')
      .set('Authorization', `Bearer ${officialToken}`)
      .expect(200);
    if (!Array.isArray(res.body.data)) throw new Error('Workers response is not an array');
  });

  // 10. Audit Trail & SHA-256 Hash-Chain Verification
  await check('Audit: Get Audit Logs (GET /audit-logs)', async () => {
    const res = await request(server)
      .get('/api/v1/audit-logs?limit=10')
      .set('Authorization', `Bearer ${officialToken}`)
      .expect(200);
    if (!Array.isArray(res.body.data)) throw new Error('Audit logs response is not an array');
  });

  await check('Audit: Cryptographic Hash-Chain Verification (GET /audit-logs/verify)', async () => {
    const res = await request(server)
      .get('/api/v1/audit-logs/verify?fromSequence=1&toSequence=5')
      .set('Authorization', `Bearer ${officialToken}`)
      .expect(200);
    if (res.body.data?.valid !== true) throw new Error('Audit chain verification failed');
  });

  // 11. Notifications
  await check('Notifications: Get Notifications (GET /notifications)', async () => {
    const res = await request(server)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${officialToken}`)
      .expect(200);
    if (!Array.isArray(res.body.data)) throw new Error('Notifications response is not an array');
  });

  await check('Notifications: Unread Count (GET /notifications/unread-count)', async () => {
    const res = await request(server)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${officialToken}`)
      .expect(200);
    if (res.body.data?.unreadCount === undefined) throw new Error('Unread count missing');
  });

  // 12. AI Governance Assistant
  await check('Assistant: Grounded Query (POST /assistant/query)', async () => {
    const res = await request(server)
      .post('/api/v1/assistant/query')
      .set('Authorization', `Bearer ${officialToken}`)
      .send({
        question: 'What is the required strata support inspection frequency under CMR 2017?',
        language: 'en',
        mineId: activeMineId,
      })
      .expect(200);
    if (!res.body.data?.answer) throw new Error('Assistant query returned no answer');
  });

  // 13. Reports: CSV, XLSX & PDF Dossier Exports
  await check('Reports: Export Statutory Table CSV (GET /reports/statutory/export?format=csv)', async () => {
    const res = await request(server)
      .get(`/api/v1/reports/statutory/export?format=csv&mineId=${activeMineId}`)
      .set('Authorization', `Bearer ${officialToken}`)
      .expect(200);
    if (!res.text.includes('Requirement Title')) throw new Error('CSV missing headers');
  });

  await check('Reports: Download PDF Risk Dossier (GET /reports/risk-dossier/:mineId)', async () => {
    const res = await request(server)
      .get(`/api/v1/reports/risk-dossier/${activeMineId}`)
      .set('Authorization', `Bearer ${officialToken}`)
      .expect(200);
    if (!res.body || res.body.length === 0) throw new Error('PDF Dossier buffer is empty');
  });

  // 14. AI Orchestrator Chat & Classification
  await check('AI Orchestrator: Chat (POST /ai/chat)', async () => {
    const res = await request(server)
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${officialToken}`)
      .send({
        question: 'Summarize ventilation anomalies in Jharia Block-4',
        language: 'en',
        mineId: activeMineId,
      })
      .expect(201);
    if (!res.body.data) throw new Error('AI chat response missing');
  });

  await check('AI Orchestrator: Intent Classification (POST /ai/classify)', async () => {
    const res = await request(server)
      .post('/api/v1/ai/classify')
      .set('Authorization', `Bearer ${officialToken}`)
      .send({
        text: 'Report critical roof fall risk at seam 3',
      })
      .expect(201);
    if (!res.body.data?.intent) throw new Error('AI classification missing intent');
  });

  // 15. Logout
  await check('Auth: Logout (POST /auth/logout)', async () => {
    await request(server)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${officialToken}`)
      .send({})
      .expect(200);
  });

  console.log(`\n══════════════════════════════════════════════════════════════════════`);
  console.log(`🎯 Frontend-to-Backend E2E Verification Complete!`);
  console.log(`   Passed: ${passed} / ${passed + failed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`══════════════════════════════════════════════════════════════════════\n`);

  await app.close();
  process.exit(failed > 0 ? 1 : 0);
}

runE2EVerification().catch((err) => {
  console.error('Fatal E2E error:', err);
  process.exit(1);
});
