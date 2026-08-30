# Khanan Suraksha - Dataset Discovery & Mapping Report

This document analyzes all 15 CSV datasets in `data/` and specifies the mapping to the PostgreSQL / Prisma database schema.

## 01_mine_master.csv

- **Row Count:** 10
- **Columns (17):** `mine_id, mine_name, state, district, latitude, longitude, mine_type, operational_status, opening_date, closure_date, lease_area_ha, coal_seam_thickness, production_capacity, owner_company, contact_phone, email, address`
- **Duplicates:** 0
- **Null Values:** {'closure_date': 10}
- **Unique ID Candidates:** `mine_id, mine_name, district, latitude, longitude, opening_date, lease_area_ha, production_capacity, owner_company, contact_phone, email, address`

### Column Details

| Column | Inferred Type | Null Count | Unique Count | Sample Values |
| --- | --- | --- | --- | --- |
| `mine_id` | `object` | 0 | 10 | JH-001, JH-002, JH-003 |
| `mine_name` | `object` | 0 | 10 | Bharat Coal Fields - Bokaro, Dhanbad Central Mine, Giridi... |
| `state` | `object` | 0 | 3 | Jharkhand, Odisha, Chhattisgarh |
| `district` | `object` | 0 | 10 | Bokaro, Dhanbad, Giridih |
| `latitude` | `float64` | 0 | 10 | 23.6667, 23.8, 24.1833 |
| `longitude` | `float64` | 0 | 10 | 85.95, 86.45, 86.3 |
| `mine_type` | `object` | 0 | 2 | Open Cast, Underground |
| `operational_status` | `object` | 0 | 2 | Active, Suspended |
| `opening_date` | `object` | 0 | 10 | 1972-03-15, 1956-11-20, 1985-07-10 |
| `closure_date` | `float64` | 10 | 1 |  |
| `lease_area_ha` | `float64` | 0 | 10 | 4500.0, 3200.0, 5800.0 |
| `coal_seam_thickness` | `float64` | 0 | 9 | 12.5, 8.2, 15.0 |
| `production_capacity` | `int64` | 0 | 10 | 15000, 8000, 20000 |
| `owner_company` | `object` | 0 | 10 | Bharat Coal Corporation Ltd, Dhanbad Coal Mines Pvt Ltd, ... |
| `contact_phone` | `int64` | 0 | 10 | 919876543210, 919876543211, 919876543212 |
| `email` | `object` | 0 | 10 | bcc.bokaro@bharatcoal.in, dcm.dhanbad@coalmines.in, gmc.g... |
| `address` | `object` | 0 | 10 | Plot No. 45, Bokaro Steel City, Jharkhand - 827001, Dhanb... |

---

## 02_production_monthly.csv

- **Row Count:** 240
- **Columns (11):** `production_id, mine_id, month_year, target_production, actual_production, dispatch, coal_grade, equipment_downtime_hours, downtime_reason, created_at, updated_at`
- **Duplicates:** 0
- **Null Values:** None
- **Unique ID Candidates:** `production_id, actual_production, dispatch`

### Column Details

| Column | Inferred Type | Null Count | Unique Count | Sample Values |
| --- | --- | --- | --- | --- |
| `production_id` | `object` | 0 | 240 | PM-JH-001-20230101, PM-JH-001-20230201, PM-JH-001-20230301 |
| `mine_id` | `object` | 0 | 10 | JH-001, JH-002, JH-003 |
| `month_year` | `object` | 0 | 24 | 2023-01-01, 2023-02-01, 2023-03-01 |
| `target_production` | `int64` | 0 | 10 | 450000, 240000, 600000 |
| `actual_production` | `int64` | 0 | 240 | 468822, 481923, 386790 |
| `dispatch` | `int64` | 0 | 240 | 445967, 474132, 369262 |
| `coal_grade` | `object` | 0 | 5 | C, E, B |
| `equipment_downtime_hours` | `float64` | 0 | 188 | 11.8, 4.2, 24.3 |
| `downtime_reason` | `object` | 0 | 3 | Planned maintenance, Equipment breakdown, Weather delay |
| `created_at` | `object` | 0 | 24 | 2023-01-06 00:00:00, 2023-02-06 00:00:00, 2023-03-06 00:0... |
| `updated_at` | `object` | 0 | 24 | 2023-01-06 00:00:00, 2023-02-06 00:00:00, 2023-03-06 00:0... |

---

## 03_compliance_requirements.csv

- **Row Count:** 100
- **Columns (11):** `requirement_id, category, sub_category, description, description_hindi, frequency, due_days, regulatory_body, is_mandatory, penalty_amount, risk_level`
- **Duplicates:** 0
- **Null Values:** None
- **Unique ID Candidates:** `requirement_id`

### Column Details

| Column | Inferred Type | Null Count | Unique Count | Sample Values |
| --- | --- | --- | --- | --- |
| `requirement_id` | `object` | 0 | 100 | REQ-001, REQ-002, REQ-003 |
| `category` | `object` | 0 | 4 | Safety, Environmental, Labour |
| `sub_category` | `object` | 0 | 17 | Mine Ventilation, Roof Support, Fire Prevention |
| `description` | `object` | 0 | 22 | Adequate ventilation system must be operational, All unde... |
| `description_hindi` | `object` | 0 | 22 | खान में सदा हवादारी प्रणाली का संचालन अनिवार्य है, भूगर्भ... |
| `frequency` | `object` | 0 | 5 | Daily, Weekly, Monthly |
| `due_days` | `int64` | 0 | 5 | 1, 7, 30 |
| `regulatory_body` | `object` | 0 | 3 | DGMS, CPCB, Labour Dept |
| `is_mandatory` | `bool` | 0 | 2 | True, False |
| `penalty_amount` | `float64` | 0 | 95 | 50000.0, 100000.0, 75000.0 |
| `risk_level` | `object` | 0 | 4 | High, Critical, Medium |

---

## 04_inspections.csv

- **Row Count:** 5,000
- **Columns (18):** `inspection_id, mine_id, inspection_date, inspection_time, inspector_id, inspector_name, inspector_role, requirement_id, checklist_item, response, observations, observations_hindi, severity, photo_reference, latitude, longitude, sync_status, sync_timestamp`
- **Duplicates:** 0
- **Null Values:** {'response': 1654, 'photo_reference': 1016, 'sync_timestamp': 3402}
- **Unique ID Candidates:** `inspection_id`

### Column Details

| Column | Inferred Type | Null Count | Unique Count | Sample Values |
| --- | --- | --- | --- | --- |
| `inspection_id` | `object` | 0 | 5000 | INS-OD-002-0000, INS-OD-001-0001, INS-CG-001-0002 |
| `mine_id` | `object` | 0 | 7 | OD-002, OD-001, CG-001 |
| `inspection_date` | `object` | 0 | 366 | 2023-05-31, 2023-01-22, 2023-03-23 |
| `inspection_time` | `object` | 0 | 1394 | 10:06:00, 23:55:00, 00:09:00 |
| `inspector_id` | `object` | 0 | 3 | INS-001, INS-002, INS-003 |
| `inspector_name` | `object` | 0 | 3 | Rajesh Kumar, Sita Devi, Amit Patel |
| `inspector_role` | `object` | 0 | 3 | Safety Officer, Environmental Officer, Labour Inspector |
| `requirement_id` | `object` | 0 | 100 | REQ-042, REQ-079, REQ-087 |
| `checklist_item` | `object` | 0 | 5 | PPE compliance, Fire equipment, Roof support |
| `response` | `object` | 1654 | 3 | Non-Compliant, Compliant |
| `observations` | `object` | 0 | 10 | PPE compliance is not adequate, Fire equipment is not ade... |
| `observations_hindi` | `object` | 0 | 10 | PPE compliance पर्याप्त नहीं है, Fire equipment पर्याप्त ... |
| `severity` | `object` | 0 | 4 | Critical, Low, Medium |
| `photo_reference` | `object` | 1016 | 3985 | PHOTO-OD-002-0000.jpg, PHOTO-OD-002-0003.jpg, PHOTO-JH-00... |
| `latitude` | `float64` | 0 | 4999 | 23.5928161, 23.8042125, 23.9452154 |
| `longitude` | `float64` | 0 | 4999 | 86.1397648, 85.8133111, 85.8163285 |
| `sync_status` | `object` | 0 | 3 | Pending, Failed, Synced |
| `sync_timestamp` | `object` | 3402 | 1451 | 2023-10-10 04:00:00, 2023-11-26 00:00:00, 2023-10-31 02:0... |

---

## 05_incidents.csv

- **Row Count:** 300
- **Columns (16):** `incident_id, mine_id, incident_date, incident_time, incident_type, location, equipment_involved, cause_category, cause_description, injury_severity, persons_affected, root_cause, risk_level, reported_by, reported_date, status`
- **Duplicates:** 0
- **Null Values:** {'injury_severity': 73}
- **Unique ID Candidates:** `incident_id`

### Column Details

| Column | Inferred Type | Null Count | Unique Count | Sample Values |
| --- | --- | --- | --- | --- |
| `incident_id` | `object` | 0 | 300 | INC-JH-002-000, INC-JH-001-001, INC-JH-002-002 |
| `mine_id` | `object` | 0 | 7 | JH-002, JH-001, CG-001 |
| `incident_date` | `object` | 0 | 204 | 2023-09-16, 2023-06-01, 2023-02-07 |
| `incident_time` | `object` | 0 | 263 | 03:57:00, 08:24:00, 19:43:00 |
| `incident_type` | `object` | 0 | 2 | Near Miss, Accident |
| `location` | `object` | 0 | 5 | Crusher Area, Pit Bottom, Loading Point |
| `equipment_involved` | `object` | 0 | 227 | EQ-447, EQ-279, EQ-052 |
| `cause_category` | `object` | 0 | 4 | Human Error, Electrical, Mechanical |
| `cause_description` | `object` | 0 | 5 | Worker slipped, Short circuit, Conveyor belt jam |
| `injury_severity` | `object` | 73 | 4 | Minor, Serious, Fatal |
| `persons_affected` | `int64` | 0 | 6 | 0, 2, 3 |
| `root_cause` | `object` | 0 | 4 | Human error, Poor ventilation, Equipment failure |
| `risk_level` | `object` | 0 | 4 | Critical, Low, Medium |
| `reported_by` | `object` | 0 | 3 | Sita Devi, Rajesh Kumar, Amit Patel |
| `reported_date` | `object` | 0 | 275 | 2023-09-16 01:00:00, 2023-06-01 01:00:00, 2023-02-07 04:0... |
| `status` | `object` | 0 | 4 | Open, Investigating, Escalated |

---

## 06_corrective_actions.csv

- **Row Count:** 1,500
- **Columns (15):** `action_id, inspection_id, incident_id, action_description, action_description_hindi, assigned_to, assigned_date, due_date, completion_date, status, priority, verification_required, verified_by, verification_date, delay_reason`
- **Duplicates:** 0
- **Null Values:** {'incident_id': 1027, 'completion_date': 455, 'verified_by': 770, 'verification_date': 770, 'delay_reason': 1266}
- **Unique ID Candidates:** `action_id`

### Column Details

| Column | Inferred Type | Null Count | Unique Count | Sample Values |
| --- | --- | --- | --- | --- |
| `action_id` | `object` | 0 | 1500 | CA-00000, CA-00001, CA-00002 |
| `inspection_id` | `object` | 0 | 1408 | INS-JH-002-0044, INS-JH-001-3669, INS-OD-001-4776 |
| `incident_id` | `object` | 1027 | 374 | INC-JH-001-265, INC-JH-001-043, INC-OD-001-247 |
| `action_description` | `object` | 0 | 4 | Verify compliance, Conduct training, Repair roof supports |
| `action_description_hindi` | `object` | 0 | 4 | Verify compliance को लागू किया जाना चाहिए, Conduct traini... |
| `assigned_to` | `object` | 0 | 3 | Environmental Team, Maintenance Team, Safety Team |
| `assigned_date` | `object` | 0 | 362 | 2023-11-11, 2023-07-07, 2023-11-18 |
| `due_date` | `object` | 0 | 388 | 2023-12-29, 2023-08-29, 2024-01-12 |
| `completion_date` | `object` | 455 | 362 | 2023-09-04, 2024-01-09, 2024-01-14 |
| `status` | `object` | 0 | 6 | Open, Escalated, In Progress |
| `priority` | `object` | 0 | 4 | High, Medium, Low |
| `verification_required` | `bool` | 0 | 2 | False, True |
| `verified_by` | `object` | 770 | 3 | Sita Devi, Rajesh Kumar |
| `verification_date` | `object` | 770 | 321 | 2023-09-05, 2024-01-10, 2024-01-15 |
| `delay_reason` | `object` | 1266 | 4 | Parts not available, Waiting for approval, Equipment unav... |

---

## 07_contractors.csv

- **Row Count:** 150
- **Columns (18):** `contractor_id, contractor_name, registration_number, contract_start_date, contract_end_date, contract_value, work_scope, worker_count, training_percentage, licence_number, licence_expiry, insurance_number, insurance_expiry, violations_count, risk_rating, address, phone, email`
- **Duplicates:** 0
- **Null Values:** None
- **Unique ID Candidates:** `contractor_id, registration_number, contract_value, licence_number, insurance_number, address, phone`

### Column Details

| Column | Inferred Type | Null Count | Unique Count | Sample Values |
| --- | --- | --- | --- | --- |
| `contractor_id` | `object` | 0 | 150 | CON-001, CON-002, CON-003 |
| `contractor_name` | `object` | 0 | 10 | XYZ Mining Corp, PQR Mining Services, LMN Mining Corp |
| `registration_number` | `object` | 0 | 150 | REG-001-2020, REG-002-2020, REG-003-2020 |
| `contract_start_date` | `object` | 0 | 140 | 2020-08-10, 2021-02-19, 2021-09-14 |
| `contract_end_date` | `object` | 0 | 148 | 2022-08-10, 2024-02-19, 2023-09-14 |
| `contract_value` | `float64` | 0 | 150 | 18549891.68, 2846989.05, 41635352.11 |
| `work_scope` | `object` | 0 | 5 | Transport Services, Maintenance Services, Safety Services |
| `worker_count` | `int64` | 0 | 119 | 216, 37, 232 |
| `training_percentage` | `float64` | 0 | 147 | 85.16, 77.39, 97.01 |
| `licence_number` | `object` | 0 | 150 | LIC-001, LIC-002, LIC-003 |
| `licence_expiry` | `object` | 0 | 145 | 2022-10-03, 2024-11-07, 2023-12-20 |
| `insurance_number` | `object` | 0 | 150 | INS-001, INS-002, INS-003 |
| `insurance_expiry` | `object` | 0 | 146 | 2022-10-31, 2024-09-21, 2024-01-10 |
| `violations_count` | `int64` | 0 | 13 | 5, 11, 9 |
| `risk_rating` | `object` | 0 | 4 | Medium, Critical, High |
| `address` | `object` | 0 | 150 | 709 Mining Colony, Korba, Odisha - 240879, 514 Mining Col... |
| `phone` | `int64` | 0 | 150 | 91987657519194, 91987656853325, 91987654356696 |
| `email` | `object` | 0 | 10 | contact@xyzminingcorp.com, contact@pqrminingservices.com,... |

---

## 08_worker_attendance.csv

- **Row Count:** 10,000
- **Columns (14):** `attendance_id, worker_id, mine_id, shift_date, shift_type, attendance_status, check_in_time, check_out_time, training_status, training_expiry, medical_fitness, medical_expiry, ppe_status, ppe_issues`
- **Duplicates:** 0
- **Null Values:** {'check_in_time': 1478, 'check_out_time': 1478, 'ppe_issues': 8005}
- **Unique ID Candidates:** `attendance_id`

### Column Details

| Column | Inferred Type | Null Count | Unique Count | Sample Values |
| --- | --- | --- | --- | --- |
| `attendance_id` | `object` | 0 | 10000 | ATT-00000, ATT-00001, ATT-00002 |
| `worker_id` | `object` | 0 | 6310 | WRK-5438, WRK-0033, WRK-5516 |
| `mine_id` | `object` | 0 | 7 | OD-001, JH-002, JH-003 |
| `shift_date` | `object` | 0 | 91 | 2023-02-18, 2023-02-09, 2023-03-07 |
| `shift_type` | `object` | 0 | 3 | Morning, Night, Afternoon |
| `attendance_status` | `object` | 0 | 4 | Present, Absent, On Leave |
| `check_in_time` | `object` | 1478 | 481 | 06:24:00, 08:52:00, 22:11:00 |
| `check_out_time` | `object` | 1478 | 481 | 14:15:00, 16:38:00, 07:05:00 |
| `training_status` | `object` | 0 | 3 | Certified, Pending, Expired |
| `training_expiry` | `object` | 0 | 481 | 2023-12-14, 2023-01-10, 2023-03-05 |
| `medical_fitness` | `object` | 0 | 3 | Fit, Unfit, Pending |
| `medical_expiry` | `object` | 0 | 480 | 2023-09-23, 2023-01-12, 2023-06-25 |
| `ppe_status` | `object` | 0 | 3 | Partial, Compliant, Non-Compliant |
| `ppe_issues` | `object` | 8005 | 3 | Boots missing, Helmet missing |

---

## 09_environmental_readings.csv

- **Row Count:** 50,000
- **Columns (15):** `reading_id, mine_id, reading_date, reading_time, parameter, sub_parameter, value, unit, permissible_limit, exceedance, location, latitude, longitude, equipment_id, recorded_by`
- **Duplicates:** 0
- **Null Values:** {'unit': 4201}
- **Unique ID Candidates:** `reading_id`

### Column Details

| Column | Inferred Type | Null Count | Unique Count | Sample Values |
| --- | --- | --- | --- | --- |
| `reading_id` | `object` | 0 | 50000 | ER-000000, ER-000001, ER-000002 |
| `mine_id` | `object` | 0 | 7 | OD-001, JH-001, JH-002 |
| `reading_date` | `object` | 0 | 366 | 2023-06-24, 2023-06-06, 2023-10-16 |
| `reading_time` | `object` | 0 | 1440 | 20:26:00, 09:30:00, 10:07:00 |
| `parameter` | `object` | 0 | 6 | Dust, Water, Groundwater |
| `sub_parameter` | `object` | 0 | 9 | PM2.5, TSS, Level |
| `value` | `float64` | 0 | 985 | 59.2, 85.8, 89.9 |
| `unit` | `object` | 4201 | 5 | mg/m³, m, dB |
| `permissible_limit` | `int64` | 0 | 6 | 60, 100, 85 |
| `exceedance` | `bool` | 0 | 2 | False, True |
| `location` | `object` | 0 | 4 | Crusher Area, Effluent Treatment, Drill Site |
| `latitude` | `float64` | 0 | 49881 | 23.2309839, 23.8158104, 23.4638738 |
| `longitude` | `float64` | 0 | 49887 | 85.7272286, 85.6022027, 86.1296671 |
| `equipment_id` | `object` | 0 | 900 | SENS-PM2-094, SENS-TSS-058, SENS-Lev-095 |
| `recorded_by` | `object` | 0 | 3 | Rajesh Kumar, Amit Patel, Sita Devi |

---

## 10_equipment.csv

- **Row Count:** 500
- **Columns (17):** `equipment_id, mine_id, equipment_name, equipment_type, manufacturer, model, year_manufactured, operating_hours, last_maintenance_date, next_maintenance_date, fuel_type, fuel_consumption, breakdown_count, last_breakdown_date, breakdown_reason, sensor_anomalies, status`
- **Duplicates:** 0
- **Null Values:** {'last_breakdown_date': 42, 'breakdown_reason': 42}
- **Unique ID Candidates:** `equipment_id, equipment_name`

### Column Details

| Column | Inferred Type | Null Count | Unique Count | Sample Values |
| --- | --- | --- | --- | --- |
| `equipment_id` | `object` | 0 | 500 | EQ-000, EQ-001, EQ-002 |
| `mine_id` | `object` | 0 | 7 | JH-002, JH-001, CG-001 |
| `equipment_name` | `object` | 0 | 500 | Drill Rig 0, Roof Bolter 1, Excavator 2 |
| `equipment_type` | `object` | 0 | 8 | Drill Rig, Roof Bolter, Excavator |
| `manufacturer` | `object` | 0 | 8 | Atlas Copco, Sandvik, Ashok Leyland |
| `model` | `object` | 0 | 498 | Atl-1047, San-2889, San-5254 |
| `year_manufactured` | `int64` | 0 | 14 | 2014, 2012, 2010 |
| `operating_hours` | `int64` | 0 | 493 | 17246, 7010, 29652 |
| `last_maintenance_date` | `object` | 0 | 281 | 2023-05-19, 2023-02-01, 2023-12-07 |
| `next_maintenance_date` | `object` | 0 | 286 | 2023-10-24, 2023-05-15, 2024-01-30 |
| `fuel_type` | `object` | 0 | 2 | Diesel, Electric |
| `fuel_consumption` | `float64` | 0 | 242 | 59.11, 0.0, 38.52 |
| `breakdown_count` | `int64` | 0 | 11 | 0, 9, 5 |
| `last_breakdown_date` | `object` | 42 | 263 | 2023-01-23, 2023-11-13, 2023-01-08 |
| `breakdown_reason` | `object` | 42 | 5 | Hydraulic leak, Jam, Electrical fault |
| `sensor_anomalies` | `int64` | 0 | 16 | 0, 6, 4 |
| `status` | `object` | 0 | 4 | Operational, Broken, Maintenance |

---

## 11_documents.csv

- **Row Count:** 2,000
- **Columns (13):** `document_id, mine_id, document_type, document_number, issue_date, expiry_date, issuing_authority, ocr_text_status, verification_status, file_path, file_size_kb, uploaded_by, uploaded_date`
- **Duplicates:** 0
- **Null Values:** {'mine_id': 95}
- **Unique ID Candidates:** `document_id, document_number, file_path`

### Column Details

| Column | Inferred Type | Null Count | Unique Count | Sample Values |
| --- | --- | --- | --- | --- |
| `document_id` | `object` | 0 | 2000 | DOC-00000, DOC-00001, DOC-00002 |
| `mine_id` | `object` | 95 | 8 | OD-002, CG-001, JH-002 |
| `document_type` | `object` | 0 | 9 | Insurance Certificate, Mining Lease, Audit Report |
| `document_number` | `object` | 0 | 2000 | Ins-0000-2023, Min-0001-2023, Aud-0002-2023 |
| `issue_date` | `object` | 0 | 692 | 2022-01-11, 2023-10-31, 2023-06-27 |
| `expiry_date` | `object` | 0 | 1285 | 2026-01-10, 2027-10-30, 2025-06-26 |
| `issuing_authority` | `object` | 0 | 5 | State PCB, CPCB, Insurance Company |
| `ocr_text_status` | `object` | 0 | 3 | Extracted, Pending, Failed |
| `verification_status` | `object` | 0 | 4 | Expired, Verified, Pending |
| `file_path` | `object` | 0 | 2000 | /documents/insurance_certificate/OD-002/0000.pdf, /docume... |
| `file_size_kb` | `int64` | 0 | 1595 | 2823, 4330, 4927 |
| `uploaded_by` | `object` | 0 | 3 | Sita Devi, Rajesh Kumar, Amit Patel |
| `uploaded_date` | `object` | 0 | 698 | 2022-02-10 00:00:00, 2023-11-23 00:00:00, 2023-07-13 00:0... |

---

## 12_grievances.csv

- **Row Count:** 500
- **Columns (15):** `grievance_id, mine_id, grievance_date, category, priority, raised_by, raised_by_type, description, description_hindi, assigned_officer, assigned_date, sla_days, resolution_status, resolution_date, resolution_notes`
- **Duplicates:** 0
- **Null Values:** {'resolution_date': 293, 'resolution_notes': 293}
- **Unique ID Candidates:** `grievance_id`

### Column Details

| Column | Inferred Type | Null Count | Unique Count | Sample Values |
| --- | --- | --- | --- | --- |
| `grievance_id` | `object` | 0 | 500 | GRV-0000, GRV-0001, GRV-0002 |
| `mine_id` | `object` | 0 | 7 | OD-002, JH-001, OD-001 |
| `grievance_date` | `object` | 0 | 272 | 2023-08-14, 2023-10-03, 2023-07-20 |
| `category` | `object` | 0 | 5 | Working Conditions, Wages, Community |
| `priority` | `object` | 0 | 4 | Critical, Medium, Low |
| `raised_by` | `object` | 0 | 445 | Worker-0202, Community Member-0249, Worker-0497 |
| `raised_by_type` | `object` | 0 | 2 | Worker, Community Member |
| `description` | `object` | 0 | 5 | Delayed wage payment, Poor ventilation, Noise pollution |
| `description_hindi` | `object` | 0 | 5 | विलंबित वेतन भुगतान, खराब हवादारी, शोर प्रदूषण |
| `assigned_officer` | `object` | 0 | 3 | Rajesh Kumar, Sita Devi, Amit Patel |
| `assigned_date` | `object` | 0 | 270 | 2023-08-14, 2023-10-06, 2023-07-21 |
| `sla_days` | `int64` | 0 | 4 | 2, 7, 14 |
| `resolution_status` | `object` | 0 | 5 | In Progress, Escalated, Open |
| `resolution_date` | `object` | 293 | 168 | 2023-07-22, 2023-03-07, 2023-11-04 |
| `resolution_notes` | `object` | 293 | 6 | Resolved: Poor ventilation, Resolved: Delayed wage paymen... |

---

## 13_audit_logs.csv

- **Row Count:** 15,000
- **Columns (14):** `log_id, timestamp, user_id, user_name, user_role, action, table_affected, record_id, old_value, new_value, ip_address, device_info, status, error_message`
- **Duplicates:** 0
- **Null Values:** {'table_affected': 3850, 'record_id': 3850, 'error_message': 14247}
- **Unique ID Candidates:** `log_id`

### Column Details

| Column | Inferred Type | Null Count | Unique Count | Sample Values |
| --- | --- | --- | --- | --- |
| `log_id` | `object` | 0 | 15000 | AL-000000, AL-000001, AL-000002 |
| `timestamp` | `object` | 0 | 14779 | 2023-07-20 10:27:00, 2023-04-04 05:43:00, 2023-04-19 08:3... |
| `user_id` | `object` | 0 | 3 | USER-001, USER-002, USER-003 |
| `user_name` | `object` | 0 | 3 | Rajesh Kumar, Sita Devi, Amit Patel |
| `user_role` | `object` | 0 | 3 | Safety Officer, Environmental Officer, Labour Inspector |
| `action` | `object` | 0 | 8 | Reject, Login, Create |
| `table_affected` | `object` | 3850 | 12 | inspections, grievances, production_monthly |
| `record_id` | `object` | 3850 | 6754 | REC-06492, REC-02308, REC-05973 |
| `old_value` | `object` | 0 | 100 | old_38, old_7, old_73 |
| `new_value` | `object` | 0 | 100 | new_87, new_70, new_34 |
| `ip_address` | `object` | 0 | 13377 | 192.168.248.204, 192.168.88.251, 192.168.38.60 |
| `device_info` | `object` | 0 | 3 | Windows 10, Mac OS, Linux |
| `status` | `object` | 0 | 2 | Success, Failed |
| `error_message` | `object` | 14247 | 4 | Database timeout, Invalid ID, Permission denied |

---

## complex_mine_sensor_data.csv

- **Row Count:** 25,000
- **Columns (12):** `mine_id, equipment_type, shift, operating_hours, temperature_C, vibration, pressure_bar, dust_level_ug, rpm, oil_temp_C, load_percentage, machine_failure`
- **Duplicates:** 0
- **Null Values:** None
- **Unique ID Candidates:** `None`

### Column Details

| Column | Inferred Type | Null Count | Unique Count | Sample Values |
| --- | --- | --- | --- | --- |
| `mine_id` | `object` | 0 | 6 | JH-001, OD-002, CG-001 |
| `equipment_type` | `object` | 0 | 5 | Excavator, Drill Rig, Crusher |
| `shift` | `object` | 0 | 3 | Night, Afternoon, Morning |
| `operating_hours` | `float64` | 0 | 24672 | 3807.95, 9512.07, 7346.74 |
| `temperature_C` | `float64` | 0 | 6451 | 66.27, 61.4, 50.11 |
| `vibration` | `float64` | 0 | 19337 | 3.0704, 2.5968, 2.0455 |
| `pressure_bar` | `float64` | 0 | 7958 | 80.22, 66.43, 123.79 |
| `dust_level_ug` | `float64` | 0 | 16895 | 114.91, 274.43, 194.79 |
| `rpm` | `float64` | 0 | 22324 | 1548.5, 1355.45, 2146.31 |
| `oil_temp_C` | `float64` | 0 | 4649 | 79.14, 82.9, 70.24 |
| `load_percentage` | `float64` | 0 | 7648 | 84.92, 50.17, 94.99 |
| `machine_failure` | `int64` | 0 | 2 | 0, 1 |

---

## messy_complex_mine_sensor_data.csv

- **Row Count:** 30,000
- **Columns (15):** `mine_id, equipment_type, shift, maintenance_status, operating_hours, temperature_C, vibration, pressure_bar, dust_level_ug, rpm, oil_temp_C, load_percentage, humidity_pct, bearing_temp_C, machine_failure`
- **Duplicates:** 0
- **Null Values:** {'temperature_C': 2375, 'vibration': 2335, 'pressure_bar': 2319, 'rpm': 2524, 'oil_temp_C': 2338, 'bearing_temp_C': 2371}
- **Unique ID Candidates:** `None`

### Column Details

| Column | Inferred Type | Null Count | Unique Count | Sample Values |
| --- | --- | --- | --- | --- |
| `mine_id` | `object` | 0 | 6 | OD-002, JH-001, JH-002 |
| `equipment_type` | `object` | 0 | 6 | Drill Rig, Loader, Crusher |
| `shift` | `object` | 0 | 3 | Night, Afternoon, Morning |
| `maintenance_status` | `object` | 0 | 3 | On Schedule, Recent, Overdue |
| `operating_hours` | `float64` | 0 | 26424 | 8388.0, 3505.1, 2799.5 |
| `temperature_C` | `float64` | 2375 | 7883 | 61.46, 79.55, 99.62 |
| `vibration` | `float64` | 2335 | 21327 | 1.944, 3.2551, 2.1432 |
| `pressure_bar` | `float64` | 2319 | 10092 | 78.37, 91.95, 102.24 |
| `dust_level_ug` | `float64` | 0 | 19117 | 116.84, 183.57, 240.1 |
| `rpm` | `float64` | 2524 | 11897 | 1281.9, 1783.7, 1484.9 |
| `oil_temp_C` | `float64` | 2338 | 5518 | 64.77, 88.91, 63.97 |
| `load_percentage` | `float64` | 0 | 8695 | 88.33, 58.32, 44.61 |
| `humidity_pct` | `float64` | 0 | 7358 | 51.41, 75.29, 81.09 |
| `bearing_temp_C` | `float64` | 2371 | 7823 | 74.82, 81.81, 115.56 |
| `machine_failure` | `int64` | 0 | 2 | 1, 0 |

---

