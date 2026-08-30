/**
 * ==============================================================================
 * CoalGov Smart Governance Platform — Master Mock Dataset (Section 6 Seed Data)
 * ==============================================================================
 * Exact SECL & NCL mines:
 * - Gevra OC (SECL) · Baseline Monitored Mine
 * - Dipka OC (SECL) · High Risk with >15 Pt Spike (Rising Risk Alert)
 * - Jayant OC (NCL) · Low Risk
 * - Nigahi OC (NCL) · Medium Risk
 * Dynamic dates calculated using `daysFromNow(n)` relative to narrative current date.
 * ==============================================================================
 */

import CryptoJS from "crypto-js";

// Relative date helper
export function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// Generate SHA-256 hash
export function generateAuditHash(type, id, timestamp, actor) {
  const raw = `${type}|${id}|${timestamp}|${actor}|COALGOV-DGMS-2026`;
  return `0x${CryptoJS.SHA256(raw).toString(CryptoJS.enc.Hex).slice(0, 16)}`;
}

export const SUBSIDIARIES = [
  {
    id: "sub-secl",
    name: "South Eastern Coalfields Limited (SECL)",
    code: "SECL",
    hq: "Bilaspur, Chhattisgarh",
    mines: [
      { id: "mine-gevra", name: "Gevra Open Cast", code: "GEV", type: "Opencast", lat: 22.336, lng: 82.545, state: "Chhattisgarh" },
      { id: "mine-dipka", name: "Dipka Open Cast", code: "DIP", type: "Opencast (High Risk)", lat: 22.318, lng: 82.568, state: "Chhattisgarh" },
      { id: "mine-kusmunda", name: "Kusmunda Open Cast", code: "KUS", type: "Opencast", lat: 22.345, lng: 82.688, state: "Chhattisgarh" },
    ],
  },
  {
    id: "sub-ncl",
    name: "Northern Coalfields Limited (NCL)",
    code: "NCL",
    hq: "Singrauli, Madhya Pradesh",
    mines: [
      { id: "mine-jayant", name: "Jayant Open Cast", code: "JAY", type: "Opencast (Low Risk)", lat: 24.112, lng: 82.632, state: "Madhya Pradesh" },
      { id: "mine-nigahi", name: "Nigahi Open Cast", code: "NIG", type: "Opencast (Medium Risk)", lat: 24.135, lng: 82.605, state: "Madhya Pradesh" },
      { id: "mine-dudhichua", name: "Dudhichua Open Cast", code: "DUD", type: "Opencast", lat: 24.150, lng: 82.720, state: "Uttar Pradesh" },
    ],
  },
];

export const INITIAL_COMPLIANCE_ITEMS = [
  // ─── GEVRA OC SAFETY CATEGORY (8 EXACT ITEMS) ──────────────────────────────
  {
    id: "COMP-GEV-SAF-01",
    category: "Safety",
    title: "Ventilation system inspection",
    statute: "CMR 2017 Reg. 153",
    status: "Compliant",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    lastVerified: daysFromNow(-14),
    nextDue: daysFromNow(16),
    responsible: "Anjali Singh (Safety Officer)",
    docRef: "DOC-GEV-VENT-01",
    history: [
      { date: daysFromNow(-14), action: "Main fan pressure differential test passed", status: "Compliant", officer: "Anjali Singh", hash: "0x8f90c3a21b44e77a" },
    ],
  },
  {
    id: "COMP-GEV-SAF-02",
    category: "Safety",
    title: "Fire safety equipment check",
    statute: "CMR 2017 Reg. 123",
    status: "Overdue",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    lastVerified: daysFromNow(-45),
    nextDue: daysFromNow(-5),
    responsible: "Rakesh Tiwari (Inspector)",
    docRef: "DOC-GEV-FIRE-02",
    history: [
      { date: daysFromNow(-45), action: "Fire extinguisher hydraulic pressure audit overdue", status: "Overdue", officer: "Rakesh Tiwari", hash: "0x3c71a9f02b11e88a" },
    ],
  },
  {
    id: "COMP-GEV-SAF-03",
    category: "Safety",
    title: "Emergency evacuation drill logged",
    statute: "CMR 2017 Reg. 24",
    status: "Due Soon",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    lastVerified: daysFromNow(-85),
    nextDue: daysFromNow(5),
    responsible: "Anjali Singh (Safety Officer)",
    docRef: "DOC-GEV-EVAC-01",
    history: [
      { date: daysFromNow(-85), action: "Quarterly shift evacuation drill conducted in 14m", status: "Compliant", officer: "Anjali Singh", hash: "0x1b99f2a00c88d33f" },
    ],
  },
  {
    id: "COMP-GEV-SAF-04",
    category: "Safety",
    title: "Gas detection system calibration",
    statute: "CMR 2017 Reg. 153A",
    status: "Compliant",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    lastVerified: daysFromNow(-8),
    nextDue: daysFromNow(22),
    responsible: "Ventilation Wing",
    docRef: "DOC-GEV-GAS-04",
    history: [
      { date: daysFromNow(-8), action: "Sensor calibrated to 0.38% CH4 threshold", status: "Compliant", officer: "Ventilation Wing", hash: "0x99a0e4c11b22f55a" },
    ],
  },
  {
    id: "COMP-GEV-SAF-05",
    category: "Safety",
    title: "Personal protective equipment audit",
    statute: "Mines Act 1952 S.23",
    status: "Compliant",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    lastVerified: daysFromNow(-12),
    nextDue: daysFromNow(18),
    responsible: "Safety Committee",
    docRef: "DOC-GEV-PPE-01",
    history: [
      { date: daysFromNow(-12), action: "100% Type-II helmets and safety shoes verified", status: "Compliant", officer: "Anjali Singh", hash: "0x5d81b3c00e12a99c" },
    ],
  },
  {
    id: "COMP-GEV-SAF-06",
    category: "Safety",
    title: "Slope stability / bench inspection (OC)",
    statute: "DGMS Tech Circ. 04/24",
    status: "Due Soon",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    lastVerified: daysFromNow(-28),
    nextDue: daysFromNow(2),
    responsible: "Strata Control Unit",
    docRef: "DOC-GEV-SLOPE-02",
    history: [
      { date: daysFromNow(-28), action: "Overburden bench slope FOS measured at 1.34", status: "Compliant", officer: "Strata Control Unit", hash: "0x7a12d4e88b99c00e" },
    ],
  },
  {
    id: "COMP-GEV-SAF-07",
    category: "Safety",
    title: "Magazine / explosives storage inspection",
    statute: "Explosives Rules 2008",
    status: "Compliant",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    lastVerified: daysFromNow(-5),
    nextDue: daysFromNow(25),
    responsible: "Blasting Officer (First Class)",
    docRef: "DOC-GEV-EXP-01",
    history: [
      { date: daysFromNow(-5), action: "Electronic detonator stock physical audit matched", status: "Compliant", officer: "Blasting Officer", hash: "0x2e44f1c99a00b11d" },
    ],
  },
  {
    id: "COMP-GEV-SAF-08",
    category: "Safety",
    title: "First-aid room & ambulance readiness",
    statute: "Mines Rules 1955",
    status: "Compliant",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    lastVerified: daysFromNow(-7),
    nextDue: daysFromNow(23),
    responsible: "Medical Officer",
    docRef: "DOC-GEV-MED-01",
    history: [
      { date: daysFromNow(-7), action: "Emergency oxygen cylinder pressure and defibrillator ready", status: "Compliant", officer: "Medical Officer", hash: "0x6b11a9c33d44e88a" },
    ],
  },

  // ─── ENVIRONMENT CATEGORY (GEVRA) ──────────────────────────────────────────
  {
    id: "COMP-GEV-ENV-01",
    category: "Environment",
    title: "Continuous PM10 & Ambient Dust Suppression",
    statute: "Air Act 1981 / EC Condition 4",
    status: "Compliant",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    lastVerified: daysFromNow(-10),
    nextDue: daysFromNow(20),
    responsible: "Environment Officer",
    docRef: "DOC-GEV-ENV-01",
    history: [
      { date: daysFromNow(-10), action: "Haul road water misting cannons active (112 µg/m³ PM10)", status: "Compliant", officer: "Env Officer", hash: "0x0a88c2e11b77f44a" },
    ],
  },
  {
    id: "COMP-GEV-ENV-02",
    category: "Environment",
    title: "Overburden Dump Biological Reclamation & Tree Plantation",
    statute: "MoEF&CC Statutory Guideline",
    status: "Non-Compliant",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    lastVerified: daysFromNow(-60),
    nextDue: daysFromNow(-10),
    responsible: "Afforestation Wing",
    docRef: "DOC-GEV-BIO-01",
    history: [
      { date: daysFromNow(-60), action: "Sapling survival rate on south slope dropped to 52%", status: "Non-Compliant", officer: "Afforestation Wing", hash: "0xf8a01b22c33d44e" },
    ],
  },

  // ─── PRODUCTION CATEGORY (GEVRA) ───────────────────────────────────────────
  {
    id: "COMP-GEV-PRD-01",
    category: "Production",
    title: "Controlled Blasting Peak Particle Velocity (PPV) Threshold",
    statute: "CMR 2017 Reg. 164",
    status: "Compliant",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    lastVerified: daysFromNow(-3),
    nextDue: daysFromNow(12),
    responsible: "Blasting Officer",
    docRef: "DOC-GEV-PPV-01",
    history: [
      { date: daysFromNow(-3), action: "Seismograph PPV measured 4.2 mm/s (<10 mm/s limit)", status: "Compliant", officer: "Blasting Officer", hash: "0x11a2b3c4d5e6f7a" },
    ],
  },

  // ─── LABOUR CATEGORY (GEVRA) ──────────────────────────────────────────────
  {
    id: "COMP-GEV-LAB-01",
    category: "Labour",
    title: "Contract Worker UAN/EPFO & Minimum Wage Biometric Verification",
    statute: "Mines Rules 1955 / Payment of Wages Act",
    status: "Compliant",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    lastVerified: daysFromNow(-6),
    nextDue: daysFromNow(24),
    responsible: "Labour Welfare Officer",
    docRef: "DOC-GEV-LAB-01",
    history: [
      { date: daysFromNow(-6), action: "100% contract drivers matched to valid EPFO active accounts", status: "Compliant", officer: "Labour Welfare Officer", hash: "0x99c88b77a66d55e" },
    ],
  },
  {
    id: "COMP-GEV-LAB-02",
    category: "Labour",
    title: "Mandatory DGMS Refresher Safety Training (VTC Rules 1966)",
    statute: "Mines Vocational Training Rules",
    status: "Due Soon",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    lastVerified: daysFromNow(-40),
    nextDue: daysFromNow(4),
    responsible: "VTC Training Officer",
    docRef: "DOC-GEV-VTC-02",
    history: [
      { date: daysFromNow(-40), action: "Batch of 30 dumper operators refresher pending", status: "Due Soon", officer: "VTC Officer", hash: "0x44d33c22b11a00e" },
    ],
  },
];

// GEVRA FIRE SAFETY CLUSTER VIOLATIONS (Includes Recurring Issue)
export const INITIAL_VIOLATIONS = [
  {
    id: "VIO-GEV-0038",
    category: "Fire Safety (CMR 123)",
    severity: "HIGH",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    description: "Conveyor Belt Transfer Point 3 water sprinkler manifold pressure lost. High combustible coal dust accumulation.",
    raisedBy: "Rakesh Tiwari (Inspector)",
    assignedTo: "Anjali Singh (Safety Officer)",
    raisedDate: daysFromNow(-40),
    dueDate: daysFromNow(-33),
    status: "Open",
    isRecurring: true, // Fire safety cluster #1
    auditHash: "0x8f90c3a21b44e77a",
    correctiveAction: null,
  },
  {
    id: "VIO-GEV-0041",
    category: "Fire Safety (CMR 123)",
    severity: "MEDIUM",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    description: "Diesel fuel dispensing bowser grounding wire loose at Service Bay 2. Fire risk during refuelling.",
    raisedBy: "Anjali Singh (Safety Officer)",
    assignedTo: "Suresh Yadav (Contractor Lead)",
    raisedDate: daysFromNow(-25),
    dueDate: daysFromNow(-18),
    status: "Closed",
    isRecurring: true, // Fire safety cluster #2
    auditHash: "0x4a21e7b99c01d44f",
    correctiveAction: {
      actionTaken: "Replaced grounding copper clamp and tested zero resistance grounding plate.",
      completedDate: daysFromNow(-20),
      verifyingOfficer: "Anjali Singh",
    },
  },
  {
    id: "VIO-GEV-0042",
    category: "Fire Safety (CMR 123)",
    severity: "CRITICAL",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    description: "HEMM Shovel S-104 automatic fire suppression dry chemical system (AFSS) gauge showing zero charge.",
    raisedBy: "Dr. Priya Nair (DGMS Regulator)",
    assignedTo: "Anjali Singh (Safety Officer)",
    raisedDate: daysFromNow(-11),
    dueDate: daysFromNow(-8),
    status: "Open",
    isRecurring: true, // Fire safety cluster #3 -> Triggers ⚠ Recurring Issue tag!
    auditHash: "0x3c71a9f02b11e88a",
    correctiveAction: null,
  },
];

export const INITIAL_INSPECTIONS = [
  {
    id: "INS-GEV-0104",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    type: "Fire & Dust Suppression Audit",
    inspector: "Rakesh Tiwari",
    inspectorId: "INS-GEV-0456",
    scheduledDate: daysFromNow(-2),
    status: "COMPLETED",
    lat: 22.336,
    lng: 82.545,
    zone: "Sector-4 Transfer Point 3",
    notes: "Sprinkler pressure restored. Fire suppression equipment on HEMM Shovel S-104 requires recharge.",
    checklists: [
      { item: "Water misting nozzles operational", status: "PASS", note: "2.4 bar pressure verified" },
      { item: "Shovel AFSS dry chemical cylinder charged", status: "FAIL", note: "Pressure gauge at zero" },
      { item: "Fire extinguisher expiry tagged within 1 year", status: "FAIL", note: "2 expired units on bench" },
    ],
    photoUrl: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80",
    hasViolation: true,
    violationId: "VIO-GEV-0042",
  },
  {
    id: "INS-GEV-0105",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    type: "Statutory Strata & Bench Slope",
    inspector: "Anjali Singh",
    inspectorId: "SECL-2024-1123",
    scheduledDate: daysFromNow(3),
    status: "SCHEDULED",
    lat: 22.338,
    lng: 82.548,
    zone: "Overburden Bench 4",
    notes: "Scheduled weekly geotechnical slope stability and berm height audit.",
    checklists: [],
    photoUrl: null,
    hasViolation: false,
    violationId: null,
  },
];

export const INITIAL_CONTRACTORS = [
  {
    id: "CON-01",
    companyName: "Yadav Earth Movers Pvt Ltd",
    licenseNo: "CL-CG-9912",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    contactPerson: "Suresh Yadav",
    phone: "+91-9856789012",
    status: "ACTIVE",
    workforceCount: 140,
    hasViolations: true,
    openViolationsCount: 1,
    contractPeriod: "01 Apr 2024 - 15 Sep 2026",
    licenseExpiry: daysFromNow(18), // Expiring in 18 days -> Reminder trigger!
    workers: [
      { id: "w-01", name: "Sunil Soren", trade: "Dumper Operator", uan: "100984712039", safetyTrained: false, medicalDate: daysFromNow(-380) }, // Flagged VTC
      { id: "w-02", name: "Ramesh Murmu", trade: "Excavator Pilot", uan: "100984712040", safetyTrained: false, medicalDate: daysFromNow(-400) }, // Flagged VTC
      { id: "w-03", name: "Bikash Mahato", trade: "Blaster Assistant", uan: "100984712041", safetyTrained: true, medicalDate: daysFromNow(-50) },
    ],
  },
  {
    id: "CON-02",
    companyName: "Korba Transport & Haulage Co.",
    licenseNo: "CL-CG-8801",
    mineSiteId: "mine-gevra",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    contactPerson: "P. K. Verma",
    phone: "+91-9811002244",
    status: "EXPIRED",
    workforceCount: 55,
    hasViolations: true,
    openViolationsCount: 2,
    contractPeriod: "01 Jan 2024 - 01 Feb 2026",
    licenseExpiry: daysFromNow(-28), // Expired!
    workers: [
      { id: "w-04", name: "Dileep Kumar", trade: "Water Tanker Driver", uan: "100881902144", safetyTrained: true, medicalDate: daysFromNow(-100) },
    ],
  },
];

export const INITIAL_DOCUMENTS = [
  {
    id: "DOC-2026-001",
    title: "DGMS Annual Strata & Bench Approval Gazette",
    type: "Statutory Certificate",
    referenceNo: "DGMS-CERT-2026-881",
    mineSite: "Gevra Open Cast",
    subsidiary: "SECL",
    uploadedBy: "Anjali Singh",
    uploadDate: daysFromNow(-1),
    fileSize: "1.4 MB",
    expiryDate: daysFromNow(365),
    ocrExtracted: {
      certNo: "DGMS-CERT-2026-881",
      statute: "CMR 2017 Reg. 108",
      passRating: "Grade A",
      issuingAuthority: "DDGMS Central Zone",
    },
    auditHash: "0xf1a90c21b33e44a8",
  },
];

export const INITIAL_ALERTS = [
  {
    id: "ALT-01",
    type: "Escalation",
    recipientRole: "corporate",
    title: "Critical Escalation: Fire Safety Cluster at Gevra OC",
    message: "Violation VIO-GEV-0042 (AFSS Zero Pressure) open for 3 days without verified corrective plan.",
    timestamp: "10 mins ago",
    read: false,
    targetModule: "inspections",
    targetId: "VIO-GEV-0042",
    escalationLevel: 2,
  },
  {
    id: "ALT-02",
    type: "Reminder",
    recipientRole: "mine_official",
    title: "Compliance Due Soon: Emergency Evacuation Drill",
    message: "Quarterly pit evacuation drill (CMR Reg. 24) due in 5 days at Gevra OC.",
    timestamp: "1 hour ago",
    read: false,
    targetModule: "compliance",
    targetId: "COMP-GEV-SAF-03",
    escalationLevel: 1,
  },
  {
    id: "ALT-03",
    type: "Reminder",
    recipientRole: "contractor",
    title: "Contractor License Expiring in 18 Days",
    message: "License CL-CG-9912 (Yadav Earth Movers) expires on 15 Sep 2026. Submit renewal application.",
    timestamp: "Yesterday",
    read: false,
    targetModule: "contractors",
    targetId: "CON-01",
    escalationLevel: 1,
  },
];
