# Research Notes — Khanan Suraksha
**AI-Enabled Smart Coal Mining Governance & Compliance Platform**  
*Problem Statement:* SIH 2026 — SIH26024 (Ministry of Coal / Coal India Limited)  
*Document Version:* 1.0.0 (Step 0 Research Pass)  
*Notice:* Independent prototype research. Contains no proprietary code; makes no claims of live integration or official affiliation with government systems.

---

## 1. Official SIH26024 Problem Text (Verified)

- **Problem Statement ID:** SIH26024
- **Title:** AI-Based Smart Governance and Compliance Monitoring System for Coal Mines
- **Organization:** Ministry of Coal / Coal India Limited
- **Category:** Software
- **Theme:** Smart Automation
- **Target Sector:** Coal Mining Operations & Regulatory Oversight

### Verbatim Problem Statement
> **Background:**
> The Indian coal mining sector is characterized by large-scale, distributed operations involving multiple subsidiaries, contractors, regulatory bodies, and field offices. Currently, governance and compliance activities—such as statutory monitoring, inspection tracking, safety observations, production reporting, and environmental compliance—are often handled through fragmented, manual, or spreadsheet-based systems, leading to inefficiencies and delays.
>
> **Objective:**
> To develop a centralized, AI-enabled smart governance platform to digitize and streamline the management of coal mining operations, replacing manual documentation with a unified digital ecosystem to improve transparency, accountability, and real-time decision-making.
>
> **Expected Solution:**
> A scalable software platform integrating:
> 1. Centralized digital ecosystem for compliance monitoring, inspection management, operational reporting, contractor management, and field activity tracking.
> 2. Real-time visibility and data-driven insights through web and mobile interfaces for monitoring multiple mining sites and subsidiaries.
> 3. Advanced technologies including AI/ML for risk analysis and anomaly detection, GIS mapping with boundary validation, OCR/document digitization, workflow automation, and immutable audit trails.
> 4. Multilingual conversational interfaces to enhance accessibility across operational roles.

---

## 2. Benchmark Systems & Research Analysis

### 2.1 CMSMS & Khanan Prahari (Ministry of Coal / BISAG-N / CMPDI)
*Public Architecture Overview:* CMSMS (Coal Mine Surveillance & Management System) utilizes satellite remote sensing, GIS boundary layers, and mobile reporting via the Khanan Prahari app. Citizen and field reports generate geo-tagged tickets automatically dispatched to designated Nodal Officers within jurisdictional buffers.

**Concrete Design Decisions Influenced in Khanan Suraksha:**
1. **Geofenced Field Capture & Lease Boundary Validation:** Field reports and mobile inspections enforce real GPS capture with lease-boundary proximity checks (configurable 100m–500m buffer) and explicit handling for offline/low-accuracy fixes.
2. **Nodal Triage & Escalation Workflow:** Field submissions move through an explicit triage state machine (`SUBMITTED -> TRIAGED -> ASSIGNED -> INSPECTED -> RESOLVED -> CLOSED`) mapped directly to role-based queues (Mine Official / Regulator).
3. **Transparent Audit Logging for All Status Transitions:** Every state update, re-assignment, and geofence verification is logged with timestamp, user ID, and action rationale, preventing silent modifications.

---

### 2.2 DGMS Statutory Framework & Compliance Checklists
*Framework Overview:* Directorate General of Mines Safety (DGMS) administers the Mines Act 1952, Coal Mines Regulations (CMR 2017), and statutory safety management plans (SMP). Enforcement relies on standardized checklists across critical domains: Ventilation, Strata Control/Roof Support, Haulage & Winding, Machinery & Heavy Earth Moving Machinery (HEMM), Electrical Safety, Dust/Gas/Fire Controls, and Mine Inundation.

**Concrete Design Decisions Influenced in Khanan Suraksha:**
1. **Standardized Violation & Observation Taxonomy:** Strict categorization under CMR 2017 statutory heads with calibrated severity levels (`CRITICAL`, `MAJOR`, `MINOR`, `OBSERVATION`) and statutory response timeframes (e.g., 24-hour mandatory interim response for Critical).
2. **Structured Digital Inspection Templates:** Replace unstructured notes with statutory checklist templates (e.g., Pre-monsoon Check, Opencast Highwall Stability, Underground Ventilation Survey) featuring discrete compliance checks and mandatory photographic/sensor evidence.
3. **Closed-Loop Statutory CAPA Workflow:** Corrective and Preventive Actions require root-cause classification, preventive barrier definitions, verified evidentiary attachment, and supervisory sign-off before regulatory closure.

---

### 2.3 NestJS + Prisma + Postgres Enterprise Patterns
*Architecture Overview:* Modern multi-tenant, clean-architecture NestJS backend with Prisma ORM, strict DTO validation (`class-validator`/`class-transformer`), JWT authentication with refresh cookie rotation, and declarative RBAC.

**Concrete Design Decisions Influenced in Khanan Suraksha:**
1. **Backend Database Scoping by Role:** Real authorization enforced at the service/repository layer: `MINE_OFFICIAL` and `CONTRACTOR` queries are strictly filtered by their assigned `mineId`/`contractorId`, while `CORPORATE_MANAGEMENT` and `REGULATOR` access cross-mine views with strict audit tracking.
2. **Standardized API Response & Error Envelope:** All endpoints adhere to REST conventions under `/api/v1/*` returning predictable schemas, structured `{ code, message, details, timestamp }` errors, and RFC 7807 problem details.
3. **Pluggable Architecture for AI, Storage & OCR:** Isolated adapter interfaces (`StorageProvider`, `OcrProvider`, `AiProvider`) allowing local/offline fallbacks during development while supporting enterprise providers in production without code changes.

---

### 2.4 Enterprise EHS / CAPA Platforms (Enablon, Cority, Intelex)
*System Overview:* Industrial Environmental Health & Safety (EHS) systems prioritize explainable risk scoring, dynamic leading/lagging indicator tracking, automated escalation matrixes, and executive compliance dashboards.

**Concrete Design Decisions Influenced in Khanan Suraksha:**
1. **Explainable Deterministic Risk Scoring:** 0–100 composite mine risk index computed transparently from weighted factors (Open Critical Violations: 35%, Overdue CAPAs: 25%, Incident Frequency/Severity: 20%, Environmental Exceedances: 10%, Equipment Downtime/Defects: 10%) accompanied by human-readable breakdown and AI summary.
2. **Lifecycle State Machine:** Uniform entity lifecycle enforced throughout the platform:
   $$\text{DETECT} \longrightarrow \text{RECORD} \longrightarrow \text{ANALYZE} \longrightarrow \text{ACT} \longrightarrow \text{ESCALATE} \longrightarrow \text{VERIFY} \longrightarrow \text{CLOSE} \longrightarrow \text{AUDIT} \longrightarrow \text{LEARN}$$
3. **GIGW 3.0 Government Design System:** Ashoka Blue (`#0B3D91`), Saffron accent (`#FF9933`), strict bilingual Hindi/English UI and AI copilot responses, full keyboard accessibility, high contrast, and unambiguous demo/historical labelling.
