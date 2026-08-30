# Data Dictionary & Quality Classification — Khanan Suraksha
**AI-Enabled Smart Coal Mining Governance & Compliance Platform**  
*Problem Statement:* SIH 2026 — SIH26024 (Ministry of Coal / Coal India Limited)  
*Document Version:* 1.0.0 (Phase 4 Data Pipeline)

---

## 1. Executive Summary & Dataset Quality Matrix

The `data/` directory contains 15 CSV datasets encompassing statutory compliance, operational telemetry, workforce records, environmental readings, equipment metrics, and audit trails.

| Dataset File | Rows | Columns | Quality Classification | Primary / Natural Key | Target Prisma Model |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `01_mine_master.csv` | 10 | 17 | `CLEAN` | `mine_id` | `Mine`, `Company` |
| `02_production_monthly.csv` | 240 | 11 | `CLEAN` | `production_id` | `ProductionRecord` |
| `03_compliance_requirements.csv` | 100 | 11 | `CLEAN` | `requirement_id` | `ComplianceRequirement` |
| `04_inspections.csv` | 5,000 | 18 | `MESSY_SYNTHETIC` | `inspection_id` | `Inspection`, `Observation`, `Attachment` |
| `05_incidents.csv` | 200 | 18 | `CLEAN` | `incident_id` | `Incident` |
| `06_corrective_actions.csv` | 1,200 | 16 | `MESSY_SYNTHETIC` | `action_id` | `CorrectiveAction`, `Violation`, `Escalation` |
| `07_contractors.csv` | 100 | 17 | `CLEAN` | `contractor_id` | `Contractor`, `Contract` |
| `08_worker_attendance.csv` | 10,000 | 11 | `MESSY_SYNTHETIC` | `attendance_id` | `Worker`, `Attendance` |
| `09_environmental_readings.csv` | 50,000 | 11 | `CLEAN` | `reading_id` | `EnvironmentalReading` |
| `10_equipment.csv` | 500 | 14 | `CLEAN` | `equipment_id` | `Equipment` |
| `11_documents.csv` | 1,500 | 16 | `MESSY_SYNTHETIC` | `document_id` | `Document`, `OCRJob` |
| `12_grievances.csv` | 500 | 16 | `MESSY_SYNTHETIC` | `grievance_id` | `Grievance` |
| `13_audit_logs.csv` | 10,000 | 13 | `HISTORICAL` | `log_id` | `AuditLog` (flagged `isHistorical: true`) |
| `complex_mine_sensor_data.csv` | 15,000 | 12 | `CLEAN` | `sensor_reading_id` | `SensorReading` / `EnvironmentalReading` |
| `messy_complex_mine_sensor_data.csv` | 20,000 | 14 | `MESSY_SYNTHETIC` | `sensor_reading_id` | `SensorReading` (with quality flags) |

---

## 2. Detailed Dataset Specifications & Transformation Rules

### 2.1 `01_mine_master.csv`
- **Entity:** Mine and Subsidiary Company
- **Columns:** `mine_id`, `mine_name`, `state`, `district`, `latitude`, `longitude`, `mine_type` (`Open Cast` / `Underground`), `operational_status` (`Active` / `Suspended`), `opening_date`, `closure_date`, `lease_area_ha`, `coal_seam_thickness`, `production_capacity`, `owner_company`, `contact_phone`, `email`, `address`
- **Transformations:** Normalize `owner_company` into unique `Company` records. Extract GeoJSON boundary approximations from coordinates and `lease_area_ha`.

### 2.2 `02_production_monthly.csv`
- **Entity:** Monthly Production and Dispatch
- **Columns:** `production_id`, `mine_id`, `month_year`, `target_production`, `actual_production`, `dispatch`, `coal_grade`, `equipment_downtime_hours`, `downtime_reason`, `created_at`, `updated_at`
- **Transformations:** Foreign key resolution on `mine_id`. Parse `month_year` to `DateTime`. Validate variance percentages for anomaly scoring.

### 2.3 `03_compliance_requirements.csv`
- **Entity:** Statutory Compliance Master Rulebook
- **Columns:** `requirement_id`, `category` (Safety, Environmental, Labour), `sub_category`, `description`, `description_hindi`, `frequency`, `due_days`, `regulatory_body` (DGMS, CPCB, Labour Dept), `is_mandatory`, `penalty_amount`, `risk_level` (`Low`, `Medium`, `High`, `Critical`)
- **Transformations:** Seed statutory requirement catalog. Mapped to checklist generator for inspections.

### 2.4 `04_inspections.csv`
- **Entity:** Inspection and Observation Records
- **Columns:** `inspection_id`, `mine_id`, `inspection_date`, `inspection_time`, `inspector_id`, `inspector_name`, `inspector_role`, `requirement_id`, `checklist_item`, `response` (`Compliant`, `Non-Compliant`, `Observation`, null), `observations`, `observations_hindi`, `severity` (`Low`, `Medium`, `High`, `Critical`), `photo_reference`, `latitude`, `longitude`, `sync_status`, `sync_timestamp`
- **Quality Handling:** 1,654 null `response` values defaulted to `Observation` or flagged `INCOMPLETE`. 3,402 null `sync_timestamp` filled from `inspection_date`. Coordinates validated against mine geofence.

### 2.5 `05_incidents.csv`
- **Entity:** Mine Safety Incidents & Hazard Reports
- **Columns:** `incident_id`, `mine_id`, `incident_date`, `incident_time`, `incident_type`, `severity`, `location_description`, `injuries_count`, `fatalities_count`, `equipment_damage`, `reported_by`, `investigation_status`, `root_cause`, `preventive_measures`, `closure_date`, `latitude`, `longitude`, `attachments`
- **Transformations:** Parse fatalities and injuries to numeric counters for mine risk composite scoring.

### 2.6 `06_corrective_actions.csv`
- **Entity:** Corrective & Preventive Action (CAPA) Workflow
- **Columns:** `action_id`, `violation_id`, `mine_id`, `description`, `action_type`, `assigned_to_role`, `assigned_to_name`, `priority`, `target_date`, `actual_completion_date`, `status` (`Open`, `In Progress`, `Under Review`, `Closed`, `Overdue`), `evidence_attachment`, `verification_status`, `verified_by`, `verification_date`, `escalation_level`
- **Quality Handling:** Assignees mapped to real seeded demo accounts (`Demo Mine Official`, `Demo Contractor`). `Overdue` flags computed dynamically against `target_date`.

### 2.7 `07_contractors.csv`
- **Entity:** Contractor Organizations & Mining Work Orders
- **Columns:** `contractor_id`, `company_name`, `registration_no`, `contact_person`, `contact_phone`, `email`, `contract_type`, `contract_start`, `contract_end`, `allocated_mine_ids`, `active_workers_count`, `safety_rating`, `compliance_score`, `blacklisted_status`, `pan_no`, `gstin`, `address`
- **Transformations:** Link contractor to mines via `Contract` join table. Parse multi-mine strings.

### 2.8 `08_worker_attendance.csv`
- **Entity:** Mine Personnel Attendance & Shift Telemetry
- **Columns:** `attendance_id`, `worker_id`, `worker_name`, `mine_id`, `contractor_id`, `shift` (`Morning`, `Evening`, `Night`), `date`, `check_in_time`, `check_out_time`, `ppe_compliance_status`, `health_check_status`
- **Quality Handling:** 10,000 rows normalized into `Worker` master records and indexed `Attendance` log rows.

### 2.9 `09_environmental_readings.csv`
- **Entity:** Environmental Continuous Monitoring Readings
- **Columns:** `reading_id`, `mine_id`, `reading_timestamp`, `pm2_5`, `pm10`, `so2`, `nox`, `co`, `noise_db`, `water_ph`, `water_turbidity_ntu`
- **Quality Handling:** 50,000 rows indexed on `(mine_id, reading_timestamp)`. Exceedances flagged against CPCB statutory limits.

### 2.10 `10_equipment.csv`
- **Entity:** Heavy Earth Moving Machinery (HEMM) & Critical Assets
- **Columns:** `equipment_id`, `mine_id`, `equipment_type`, `make_model`, `serial_number`, `manufacture_year`, `last_maintenance_date`, `next_maintenance_due`, `operational_status`, `telemetry_installed`, `hours_operated`, `criticality_tier`, `assigned_operator`, `safety_certificate_expiry`
- **Transformations:** Expiry alerts and maintenance schedules computed for risk index.

### 2.11 `11_documents.csv`
- **Entity:** Compliance Document Repository & OCR Pipeline
- **Columns:** `document_id`, `mine_id`, `document_type`, `title`, `issuing_authority`, `issue_date`, `expiry_date`, `file_path`, `file_size_kb`, `ocr_status`, `extracted_text`, `extracted_confidence`, `validation_status`, `reviewed_by`, `review_date`, `comments`
- **Quality Handling:** Flagged `isSimulated: true` for dev OCR extracts; authentic document upload pipeline handles file storage.

### 2.12 `12_grievances.csv`
- **Entity:** Worker & Community Grievance Redressal
- **Columns:** `grievance_id`, `mine_id`, `submitted_by_category`, `grievance_category`, `subject`, `description`, `submission_date`, `priority`, `assigned_department`, `status`, `target_resolution_date`, `resolution_notes`, `resolved_date`, `satisfaction_rating`, `escalated`, `anonymous`
- **Transformations:** Integrated into mine ESG compliance monitoring.

### 2.13 `13_audit_logs.csv`
- **Entity:** Historical Audit Trail
- **Columns:** `log_id`, `timestamp`, `user_id`, `user_name`, `user_role`, `action_type`, `entity_type`, `entity_id`, `mine_id`, `ip_address`, `status`, `details`, `hash_signature`
- **Quality Handling:** Explicitly flagged as `isHistorical: true` / `DATA_SOURCE = IMPORTED_HISTORICAL` to separate from live real-time audit logs created by system interactions.

---

## 3. Seeded Demo Accounts (Zero Invented Human Names)

Per `AGENTS.md` §4, all demo accounts use structured organizational titles:

| Role Enum | Demo Full Name | Demo Email | Target Access Scope |
| :--- | :--- | :--- | :--- |
| `MINE_OFFICIAL` | Demo Mine Official | `mine.official@khanansuraksha.gov.in` | Assigned Mine (`JH-001` Bokaro) |
| `CORPORATE_MANAGEMENT` | Demo Corporate | `corporate@khanansuraksha.gov.in` | Multi-mine enterprise portfolio |
| `REGULATOR` | Demo Regulator | `regulator.dgms@khanansuraksha.gov.in` | All mines & statutory audit trails |
| `CONTRACTOR` | Demo Contractor | `contractor.demo@khanansuraksha.gov.in` | Assigned contractor tasks & workorders |
| `ADMIN` | Demo Admin | `admin@khanansuraksha.gov.in` | Full system configuration & user management |
