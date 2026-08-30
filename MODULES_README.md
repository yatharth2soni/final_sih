# CoalGov Smart Governance Platform — Master Module Architecture & Compliance Mapping

This document provides a comprehensive technical mapping between the Indian Coal Mining Statutory Safety & Compliance problem statement and the 11 feature modules implemented in the **CoalGov Smart Governance Platform**.

---

## Technical Architecture & Problem Statement Mapping

| Problem Statement Requirement | Feature Module | Implementation File(s) | Key Technical Capabilities |
| :--- | :--- | :--- | :--- |
| **User Onboarding & Statutory Role Access** | **Modules 1–2: 8-Step Access Journey** | `src/components/auth/` `src/context/SessionContext.jsx` | 3 dependent dropdowns, dynamic role-to-fields config schema, password strength meter, simulated EPFO/DGMS identity binding, mobile device linking, 6-digit MFA, 15-min inactivity timer, and 6-persona demo auto-fill. |
| **Digitally track statutory compliance across safety, environment, production & labour** | **Module 3: Compliance Tracking Engine** | `src/components/modules/Module3Compliance.jsx` | 4 statutory categories, interactive checklist with live status dropdowns, month calendar grid with color-coded due dates, and verification timeline with SHA-256 hashes. |
| **Real-time monitoring of inspections, observations, violations & corrective actions** | **Module 4: Inspection & Violation Management** | `src/components/modules/Module4Inspections.jsx` | Schedule inspection action, checklist detail view with photo & coordinates, violation lifecycle (Open → In Progress → Review → Closed), CAPA verification sub-form, and **Recurring Issue Detector** (flags 3+ events in 90d). |
| **AI/analytics for high-risk areas, recurring failures, and predictive anomalies** | **Module 5: AI Risk & Analytics Engine** | `src/components/modules/Module5RiskAnalytics.jsx` | Transparent rule-based weighted risk algorithm `(violations*5 + overdue*8 + recurring*10 + delays*2)`, national risk rankings scoreboard, 6-month trendline, and predictive rising risk alerts. |
| **Geo-tagged, time-stamped field reporting via mobile with offline capability** | **Module 6: Mobile Field Reporting Suite** | `src/components/modules/Module6MobileReporting.jsx` | Auto-acquires GPS coordinates via `navigator.geolocation`, embedded pin preview with geofence indicator, `capture="environment"` camera input, localStorage-backed offline draft queue, and simulate reconnect sync button. |
| **Automated alerts, reminders, escalation chains & reporting** | **Module 7: Automated Workflow & Alert Engine** | `src/components/modules/Module7WorkflowAlerts.jsx` | Automated SLA countdown triggers, unread notification counter, visual 3-tier escalation stepper (Mine Official → Corporate → DGMS), and on-screen structured compliance report with print-to-PDF. |
| **Minimize paperwork, improve transparency & auditability (OCR + Blockchain)** | **Module 8: Document Digitization (OCR) & Audit Trail** | `src/components/modules/Module8DocumentOCR.jsx` | Simulated neural OCR extraction from certificate uploads, auto-fills statutory reference metadata, multi-category document library, and chronological SHA-256 Merkle chain explorer. |
| **Scalable across multiple mines and subsidiaries** | **Module 9: Multi-Tenant Architecture** | `src/components/modules/Module9MultiTenant.jsx` `src/data/mockData.js` | Data keyed by subsidiary and mine site, header mine switcher for Corporate & Regulator roles, and admin modal to onboard new mine sites live without code changes. |
| **Contractor & workforce management** | **Module 10: Contractor & Workforce Governance** | `src/components/modules/Module10Contractors.jsx` | Contractor fleet roster, work order validity tracker, linked worker lists with UAN/EPFO verification, and **Workforce Compliance Cross-Check** flagging expired safety training under Vocational Rules 1966. |
| **Multilingual conversational assistance** | **Module 11: Multilingual Chat Assistant** | `src/components/modules/Module11ChatAssistant.jsx` | Floating chatbot in bottom-left ("Ask CoalGov Assistant"), rule-based keyword intent matching in English and Hindi for compliance rates, scheduled inspections, grievances, and telemetry. |
| **Interactive GIS & satellite terrain mapping** | **GIS Mapping Grid** | `src/components/GisMap.jsx` | Interactive Leaflet satellite, terrain, and OpenStreetMap layers with pan-India coal mine markers, risk score color coding, and auto-centering on active colliery. |

---

## Evaluator / Judge Demo Guide

1. **Demo Auto-Fill (Bottom-Right)**:
   - Click **⚡ Demo Auto-Fill** to select any of the 6 Indian personas (*Mine Official, Corporate Management, Regulatory Authority, Contractor, Field Inspector, Worker*).
   - Shows persistent top banner with active persona and one-click clear button.

2. **Inactivity Session Countdown (Bottom-Left)**:
   - Shows live 15-minute countdown.
   - Click **⚙ Dev Mode** to toggle 30-second fast timeout with 20s warning modal to demonstrate automatic DGMS logout logic in seconds.

3. **Multilingual Chatbot (Bottom-Left)**:
   - Click **Ask CoalGov Assistant** and test quick chips like *"My Compliance Status"*, *"Pending Inspections"*, or *"How to Submit Grievance"*.

4. **Multi-Tenant Switcher (Header)**:
   - When logged in as Corporate Management or Regulatory Authority, click the mine name in the topbar to switch between ECL, BCCL, CCL, WCL, NCL, SECL, MCL without logging out.

5. **Transparency on AI & OCR**:
   - Modules 5, 8, and 11 feature transparent on-screen disclaimers explaining the prototype rule-based architecture and its structured path to production ML/LLM models.
