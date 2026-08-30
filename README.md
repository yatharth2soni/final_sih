# 🛡️ Khanan Suraksha (खनन सुरक्षा)
### Centralized AI-Enabled Smart Governance & Statutory Compliance Monitoring Platform for Indian Coal Mining Operations
**Smart India Hackathon (SIH 2026)**

---

## 📌 Executive Summary

**Khanan Suraksha** is a mission-critical, enterprise-grade governance and compliance platform designed for the **Ministry of Coal**, **Directorate General of Mines Safety (DGMS)**, **Coal India Limited (CIL)** and subsidiary mining companies (BCCL, ECL, SECL, NCL). 

The platform transitions Indian mining oversight from fragmented paper inspections and reactive accident reporting to **real-time AI-governed risk mitigation**, **geotagged field reporting with offline synchronization**, **tamper-proof cryptographic audit trails**, **interactive GIS telemetry grids**, and **bilingual (English & हिन्दी) statutory compliance management**.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Frontend ["Frontend (Vite + React SPA)"]
        UI[Unified Responsive Dashboard]
        GIS[Leaflet GIS & GeoJSON Map]
        Offline[Offline LocalStorage Queue]
        Lang[Bilingual i18n Engine: EN / HI]
    end

    subgraph Backend ["Backend API (NestJS + TypeScript)"]
        Auth[JWT Authentication & Role Scoping]
        GovControl[Governance Control Center]
        RiskEngine[AI Risk Engine: CMR 108 & 140]
        InspecMgt[Statutory Inspections & CAPA]
        AuditMod[HMAC-SHA-256 Chained Audit Trail]
        AIAssistant[Multi-Provider Governed AI / RAG]
        ReportsGen[Statutory Form III-A & Risk Dossier Exporter]
    end

    subgraph Storage ["Database & Storage"]
        PG[(PostgreSQL 16 via Prisma ORM)]
        MinIO[(S3 / MinIO Statutory Evidence Store)]
    end

    UI -->|REST / JWT| Auth
    UI -->|Overview & Metrics| GovControl
    UI -->|Telemetry & Risk| RiskEngine
    UI -->|Field Reports & Checklists| InspecMgt
    UI -->|Crypto Chain Verification| AuditMod
    UI -->|Bilingual Natural Language Queries| AIAssistant
    UI -->|PDF / CSV Downloads| ReportsGen
    Offline -.->|Auto-Sync Online| InspecMgt
    
    Auth --> PG
    GovControl --> PG
    RiskEngine --> PG
    InspecMgt --> PG
    AuditMod --> PG
    AIAssistant --> PG
    ReportsGen --> PG
    ReportsGen --> MinIO
```

---

## 🌟 Core Modules & Capabilities

| Module | Purpose & Regulatory Alignment |
| :--- | :--- |
| **Governance Control Center** | Aggregates real-time statutory metrics, category-wise compliance rates, overdue CAPAs, and risk bands across all subsidiary mines. |
| **Interactive GIS & Geofencing** | Leaflet-powered GIS map rendering actual mine boundary polygons, real-time risk severity badges, and underground sensor overlay. |
| **Field Report & Inspection Runner** | Geotagged inspection logger with offline mode, automated violation elevation, and interactive shift-wise checklist runners. |
| **AI Risk & Anomaly Engine** | Deterministic DGMS rule-weight scoring (CMR 2017 Reg. 108/140) combined with ML anomaly detection and plain-language explanations. |
| **Corrective & Preventive Action (CAPA)** | Closed-loop remediation workflow with automatic SLA tracking, escalation to GM (Safety), and digital evidence verification. |
| **HMAC-SHA-256 Audit Trail** | Cryptographically chained, tamper-evident event log. Any alteration in history breaks the mathematical verification hash chain. |
| **Bilingual Governed AI Assistant** | Grounded compliance assistant with strict role-scoping, regulatory citations (Mines Act 1952, CMR 2017), and English/Hindi fluency. |
| **Statutory Reports & DGMS Filings** | One-click generation and binary export of DGMS Form III-A, Form IV-B, Multi-Mine Safety Dossiers, and Telemetry CSVs. |

---

## 🔄 End-to-End Primary Product Story

```
[Field Inspector / Sensor]
           │
           ▼
1. Field Observation / Checklist Logged (Geotagged + Timestamped)
   └─ Works offline; queues in LocalStorage and syncs idempotently when online.
           │
           ▼
2. Database Persistence & Rule-Based Evaluation (CMR 2017 Reg. 108)
   └─ Severe non-compliances automatically elevated to Statutory Violations.
           │
           ▼
3. Dynamic Composite Risk Calculation (0–100 Score & Color Band)
   └─ Weights: Violations (35%), Delayed CAPA (25%), Compliance Health (25%), Inspection Gap (15%).
           │
           ▼
4. Automated CAPA Assignment & Alert Notification
   └─ Dispatches in-app notification and email to responsible Safety Officer with strict SLA.
           │
           ▼
5. Escalation & Verification Workflow
   └─ Overdue actions escalated to GM (Safety); closure requires digital evidence & inspector review.
           │
           ▼
6. Immutable Cryptographic Logging (HMAC-SHA-256 Hash Chain)
   └─ Every state change recorded with cryptographic sequence linking to previous block.
           │
           ▼
7. Real-Time Dashboard & AI Natural Language Explanation
   └─ Executives and regulators inspect subsidiary benchmarks, export dossiers, and query AI assistant.
```

---

## 👥 Role-Based Access Scoping

The system enforces strict role-based access control (RBAC) governed by `ScopeService`:

1. **Mine Safety Official (`MINE_OFFICIAL`)**: Scoped to assigned mine blocks. Can start shift inspections, log geotagged field observations, run checklists, and execute assigned CAPAs.
2. **Corporate Safety Director (`CORPORATE`)**: Scoped across all company subsidiary mines (e.g. CIL / BCCL). Can monitor multi-mine safety benchmarks, allocate resources, and export executive risk dossiers.
3. **DGMS National Inspector / Regulator (`REGULATOR`)**: Global statutory oversight. Can inspect any mine block, verify cryptographic audit chains, issue Section 22A stop-work notices, and review monthly Form III-A filings.
4. **Contractor / Mining Agency (`CONTRACTOR`)**: Scoped to agency contract panels. Tracks Form V statutory licenses, worker shift inductions, and safety star ratings.

---

## 🔑 Demo Credentials

| Role | Email | Password | Scope / Default Context |
| :--- | :--- | :--- | :--- |
| **Mine Safety Official** | `r.mahapatra@coalindia.gov.in` | `Test@1234` | Jharia Block-4 (BCCL) |
| **Corporate Director** | `corporate@coalindia.gov.in` | `Test@1234` | All BCCL / CIL Subsidiary Mines |
| **DGMS Regulator** | `regulator@dgms.gov.in` | `Test@1234` | Global National Grid (All Mines) |
| **Mining Contractor** | `contractor@easterncoking.com` | `Test@1234` | Section B / Panel B-3 |

> 💡 **Quick Login Tip:** On the login page, click any of the **Quick Demo Fill** buttons (`Official`, `Corporate`, `Regulator`) to immediately populate credentials.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** v18+ (tested on Node v20/v24)
- **PostgreSQL** 14+ (or Docker Postgres container)
- **npm** or **pnpm**

---

### Step 1: Clone Repository & Install Dependencies

```bash
# Clone repository
git clone https://github.com/yatharth2soni/hackathon3.git khanan-suraksha
cd khanan-suraksha

# Install frontend dependencies
npm install

# Install backend dependencies
cd api
npm install
```

---

### Step 2: Configure Environment Variables

#### Backend Configuration (`api/.env`):
```env
PORT=4000
NODE_ENV=development

# Supabase Cloud PostgreSQL Connection
DATABASE_URL="postgresql://postgres.xzkjkanwijrucsrwintb:Soni_yatharth@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require"

# JWT Authentication & Rotation Secrets
JWT_ACCESS_SECRET="dev-access-secret-khanan-suraksha-2026"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="dev-refresh-secret-khanan-suraksha-2026"
JWT_REFRESH_EXPIRES_IN="7d"

# Bcrypt Salt Rounds
BCRYPT_SALT_ROUNDS=10

# CORS Allowed Origins
CORS_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"

# Seed User Default Password
SEED_DEFAULT_PASSWORD="Test@1234"

# AI Model API Keys (Optional - deterministic rule-based fallback active by default)
GEMINI_API_KEY=""
GROQ_API_KEY=""
OPENROUTER_API_KEY=""
FREELLMAPI_API_KEY=""

# Redis Cache & Queue
REDIS_URL="redis://localhost:6379"

# Object Storage (MinIO / S3)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="khanan-suraksha"
MINIO_USE_SSL=false

# Email Delivery (SMTP / Transactional)
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM=""
SMTP_SECURE=false
```

#### Frontend Configuration (`.env` or root configuration):
```env
VITE_API_URL=http://localhost:4000/api/v1
```

---

### Step 3: Initialize Database & Run Seed Script

```bash
cd api

# Push Prisma schema to PostgreSQL database
npx prisma db push

# Populate live mines, compliance requirements, telemetry, contractors & users
npx prisma db seed
```

---

### Step 4: Run Application

Open two terminal windows:

#### Terminal 1 — Start NestJS Backend API:
```bash
cd api
npm run start:dev
# API starts at http://localhost:4000/api/v1
# Health check: http://localhost:4000/api/v1/health
```

#### Terminal 2 — Start Vite React Frontend:
```bash
npm run dev
# Frontend starts at http://localhost:5173
```

---

## 🧪 Verification & Quality Gate Commands

```bash
# 1. Verify Frontend Production Build
npm run build

# 2. Verify Backend Production Compilation
cd api && npm run build

# 3. Execute Complete Automated Test Suite (14 Suites, 149 Tests)
cd api && npm test
```

---

## 📄 License & Attribution
Developed for the **Smart India Hackathon (SIH 2026)**.  
Ministry of Coal & Directorate General of Mines Safety (DGMS) statutory standards compliant.