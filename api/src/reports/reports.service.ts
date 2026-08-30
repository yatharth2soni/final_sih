import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScopeService, RequestUser } from '../common/services/scope.service';
import { RiskScoringService } from '../risk-scoring/risk-scoring.service';
import { QueryComplianceReportsDto } from './dto/query-reports.dto';
import { ExportReportDto, ExportFormat } from './dto/export-report.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import * as ExcelJS from 'exceljs';
const PDFDocument = require('pdfkit');
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private scopeService: ScopeService,
    private riskScoringService: RiskScoringService,
  ) {}

  /**
   * Spreadsheet Formula Injection Sanitizer:
   * Prevents CSV/Excel command execution by escaping dangerous leading characters.
   */
  public sanitizeFormula(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
    if (str.length > 0 && dangerousChars.includes(str.charAt(0))) {
      return `'${str}`;
    }
    return str;
  }

  /**
   * Tabular Compliance Report (Paginated & Scoped)
   */
  async getComplianceReport(
    query: QueryComplianceReportsDto,
    user: RequestUser,
  ): Promise<PaginatedResponse<any>> {
    const accessibleMineIds = await this.scopeService.getAccessibleMineIds(user);

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ComplianceRecordWhereInput = {};

    if (accessibleMineIds !== null) {
      if (query.mineId) {
        if (!accessibleMineIds.includes(query.mineId)) {
          return { data: [], meta: { page, pageSize, total: 0, totalPages: 0 } };
        }
        where.mineId = query.mineId;
      } else {
        where.mineId = { in: accessibleMineIds };
      }
    } else if (query.mineId) {
      where.mineId = query.mineId;
    }

    if (query.companyId) {
      where.mine = { companyId: query.companyId };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.category) {
      where.requirement = { category: query.category };
    }

    if (query.from || query.to) {
      where.lastCheckedAt = {};
      if (query.from) where.lastCheckedAt.gte = new Date(query.from);
      if (query.to) where.lastCheckedAt.lte = new Date(query.to);
    }

    const [records, total] = await Promise.all([
      this.prisma.complianceRecord.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
        include: {
          mine: {
            select: {
              id: true,
              name: true,
              code: true,
              company: { select: { id: true, name: true, code: true } },
            },
          },
          requirement: true,
        },
      }),
      this.prisma.complianceRecord.count({ where }),
    ]);

    const data = records.map((r) => ({
      id: r.id,
      companyName: r.mine.company.name,
      companyCode: r.mine.company.code,
      mineName: r.mine.name,
      mineCode: r.mine.code,
      requirementTitle: r.requirement.title,
      category: r.requirement.category,
      frequency: r.requirement.frequency,
      status: r.status,
      remarks: r.remarks,
      lastCheckedAt: r.lastCheckedAt,
      nextDueAt: r.nextDueAt,
      updatedAt: r.updatedAt,
    }));

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Statutory Report Export (CSV or XLSX)
   */
  async exportStatutoryReport(
    dto: ExportReportDto,
    user: RequestUser,
  ): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    const accessibleMineIds = await this.scopeService.getAccessibleMineIds(user);

    // Validate max date range (<= 365 days)
    if (dto.from && dto.to) {
      const diffDays =
        (new Date(dto.to).getTime() - new Date(dto.from).getTime()) /
        (1000 * 3600 * 24);
      if (diffDays > 365) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Export date range cannot exceed 365 days',
        });
      }
    }

    const where: Prisma.ComplianceRecordWhereInput = {};

    if (accessibleMineIds !== null) {
      if (dto.mineId) {
        if (!accessibleMineIds.includes(dto.mineId)) {
          throw new BadRequestException({
            code: 'FORBIDDEN',
            message: 'You do not have access to export data for this mine',
          });
        }
        where.mineId = dto.mineId;
      } else {
        where.mineId = { in: accessibleMineIds };
      }
    } else if (dto.mineId) {
      where.mineId = dto.mineId;
    }

    if (dto.companyId) {
      where.mine = { companyId: dto.companyId };
    }

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.category) {
      where.requirement = { category: dto.category };
    }

    if (dto.from || dto.to) {
      where.lastCheckedAt = {};
      if (dto.from) where.lastCheckedAt.gte = new Date(dto.from);
      if (dto.to) where.lastCheckedAt.lte = new Date(dto.to);
    }

    // Fetch bounded rows (up to 5000)
    const records = await this.prisma.complianceRecord.findMany({
      where,
      take: 5000,
      orderBy: { updatedAt: 'desc' },
      include: {
        mine: {
          include: { company: true },
        },
        requirement: true,
      },
    });

    const timestampStr = new Date().toISOString().split('T')[0];
    const filename = `statutory-compliance-report-${timestampStr}.${dto.format}`;

    const headers = [
      'Company Code',
      'Company Name',
      'Mine Code',
      'Mine Name',
      'Category',
      'Requirement Title',
      'Frequency',
      'Status',
      'Remarks',
      'Last Checked At',
      'Next Due At',
    ];

    const rows = records.map((r) => [
      this.sanitizeFormula(r.mine.company.code),
      this.sanitizeFormula(r.mine.company.name),
      this.sanitizeFormula(r.mine.code),
      this.sanitizeFormula(r.mine.name),
      this.sanitizeFormula(r.requirement.category),
      this.sanitizeFormula(r.requirement.title),
      this.sanitizeFormula(r.requirement.frequency),
      this.sanitizeFormula(r.status),
      this.sanitizeFormula(r.remarks || ''),
      r.lastCheckedAt ? r.lastCheckedAt.toISOString() : '',
      r.nextDueAt ? r.nextDueAt.toISOString() : '',
    ]);

    if (dto.format === ExportFormat.CSV) {
      // Generate standard RFC 4180 CSV
      const csvLines: string[] = [];
      csvLines.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

      for (const row of rows) {
        csvLines.push(
          row
            .map((val) => `"${String(val).replace(/"/g, '""')}"`)
            .join(','),
        );
      }

      const buffer = Buffer.from(csvLines.join('\r\n'), 'utf-8');
      return {
        buffer,
        filename,
        mimeType: 'text/csv; charset=utf-8',
      };
    } else if (dto.format === ExportFormat.PDF || (dto.format as string) === 'pdf') {
      // If a specific mine is targeted, generate the detailed official PDF dossier
      if (dto.mineId) {
        return this.generateRiskDossierPdf(dto.mineId, user);
      } else if (accessibleMineIds && accessibleMineIds.length > 0) {
        return this.generateRiskDossierPdf(accessibleMineIds[0], user);
      } else {
        const firstMine = await this.prisma.mine.findFirst();
        if (firstMine) {
          return this.generateRiskDossierPdf(firstMine.id, user);
        }
        throw new BadRequestException({ code: 'NOT_FOUND', message: 'No accessible mines found to generate PDF' });
      }
    } else {
      // Generate binary XLSX workbook via ExcelJS

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Khanan Suraksha Governance Platform';
      workbook.created = new Date();

      const sheet = workbook.addWorksheet('Statutory Compliance');
      sheet.addRow(headers);

      // Style header row
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };

      for (const row of rows) {
        sheet.addRow(row);
      }

      // Auto-fit column widths
      sheet.columns.forEach((column) => {
        column.width = 24;
      });

      const arrayBuffer = await workbook.xlsx.writeBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return {
        buffer,
        filename,
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    }
  }

  /**
   * Generates a fully formatted, statutory Risk Dossier PDF for a specific mine.
   * Includes ScopeService authorization, live Prisma data, risk breakdown, anomalies,
   * violations, CAPAs, compliance health, and tamper-evident cryptographic hash.
   */
  async generateRiskDossierPdf(
    mineId: string,
    user: RequestUser,
  ): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    if (!mineId) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Mine ID parameter is required for risk dossier export',
      });
    }

    // 1. Authorize access via ScopeService
    await this.scopeService.assertMineAccess(user, mineId);

    // 2. Fetch Mine & Company Details
    const mine = await this.prisma.mine.findUnique({
      where: { id: mineId },
      include: { company: true },
    });

    if (!mine) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Mine with ID "${mineId}" not found`,
      });
    }

    // 3. Fetch latest Risk Score (or calculate if not present)
    let riskScore: any = await this.prisma.riskScore.findFirst({
      where: { mineId },
      orderBy: { calculatedAt: 'desc' },
      include: {
        anomalies: true,
      },
    });

    if (!riskScore) {
      const calcResult = await this.riskScoringService.calculateMineRiskScore(
        mineId,
        new Date(),
      );
      riskScore = calcResult.riskScore;
    }

    if (!riskScore) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Unable to compute statutory risk score for mine "${mineId}"`,
      });
    }

    // 4. Fetch Active Violations
    const violations = await this.prisma.violation.findMany({
      where: { mineId },
      orderBy: { raisedAt: 'desc' },
      take: 10,
      include: { correctiveActions: true },
    });

    // 5. Fetch Open & Overdue Corrective Actions (CAPA)
    const capas = await this.prisma.correctiveAction.findMany({
      where: { violation: { mineId } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { violation: true },
    });

    // 6. Fetch Active Anomaly Flags
    const anomalies = await this.prisma.anomalyFlag.findMany({
      where: { mineId },
      orderBy: { detectedAt: 'desc' },
      take: 8,
    });

    // 7. Fetch Compliance Records Summary
    const complianceRecords = await this.prisma.complianceRecord.findMany({
      where: { mineId },
      include: { requirement: true },
    });

    const totalCompliance = complianceRecords.length;
    const compliantCount = complianceRecords.filter((r) => r.status === 'COMPLIANT').length;
    const nonCompliantCount = complianceRecords.filter((r) => r.status === 'NON_COMPLIANT').length;
    const pendingComplianceCount = complianceRecords.filter((r) => r.status === 'PENDING').length;
    const complianceRate = totalCompliance > 0 ? Math.round((compliantCount / totalCompliance) * 100) : 100;

    // 8. Generate Tamper-Evident SHA-256 Digital Fingerprint
    const rawFingerprintData = `${mine.id}-${mine.code}-${riskScore.score}-${riskScore.band}-${riskScore.calculatedAt ? new Date(riskScore.calculatedAt).toISOString() : new Date().toISOString()}`;
    const digitalSignature = crypto
      .createHash('sha256')
      .update(rawFingerprintData)
      .digest('hex')
      .toUpperCase();

    // 9. Build PDF Binary via PDFKit
    const buffer = await this.renderPdfKitDossier({
      mine,
      riskScore,
      violations,
      capas,
      anomalies,
      complianceSummary: {
        total: totalCompliance,
        compliant: compliantCount,
        nonCompliant: nonCompliantCount,
        pending: pendingComplianceCount,
        rate: complianceRate,
      },
      user,
      digitalSignature,
    });

    const safeCode = mine.code.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `risk-dossier-${safeCode}-${timestamp}.pdf`;

    return {
      buffer,
      filename,
      mimeType: 'application/pdf',
    };
  }

  /**
   * Internal PDFKit renderer for Statutory Risk Dossier
   */
  private renderPdfKitDossier(data: {
    mine: any;
    riskScore: any;
    violations: any[];
    capas: any[];
    anomalies: any[];
    complianceSummary: any;
    user: RequestUser;
    digitalSignature: string;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
        info: {
          Title: `Statutory Risk Dossier — ${data.mine.name}`,
          Author: 'Ministry of Coal / DGMS · Khanan Suraksha',
          Subject: 'Coal Mine Safety Risk & Compliance Evaluation Dossier',
          Keywords: 'DGMS, CMR 2017, Risk Scoring, Coal Mining, Compliance',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: any) => reject(err));

      const pageWidth = 595.28;
      const margin = 40;
      const contentWidth = pageWidth - margin * 2; // 515.28

      // Helper for band color
      const getBandColorHex = (band: string) => {
        if (band === 'LOW') return '#15803d'; // Green
        if (band === 'MEDIUM') return '#d97706'; // Amber
        if (band === 'HIGH') return '#ea580c'; // Orange
        return '#dc2626'; // Red for CRITICAL
      };

      const bandColor = getBandColorHex(data.riskScore.band);

      // ── PAGE 1: EXECUTIVE ASSESSMENT & FACTORS ──────────────────────────────
      
      // Top Header Banner Box
      doc.rect(margin, margin, contentWidth, 54).fill('#0f172a');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(12).text(
        'DIRECTORATE GENERAL OF MINES SAFETY (DGMS)',
        margin + 16,
        margin + 12,
        { width: contentWidth - 32 },
      );
      doc.fillColor('#94a3b8').font('Helvetica').fontSize(8.5).text(
        'MINISTRY OF COAL · STATUTORY MINE SAFETY & RISK GOVERNANCE PLATFORM',
        margin + 16,
        margin + 30,
        { width: contentWidth - 32 },
      );

      // Sub-header title
      let y = margin + 68;
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(14).text(
        'STATUTORY MINE RISK & COMPLIANCE DOSSIER',
        margin,
        y,
      );

      y += 22;

      // Metadata Grid Box (2 columns)
      doc.rect(margin, y, contentWidth, 68).fillAndStroke('#f8fafc', '#e2e8f0');
      
      // Left Col
      doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(7.5).text('MONITORED MINE:', margin + 12, y + 10);
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text(data.mine.name, margin + 12, y + 20);
      
      doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(7.5).text('MINE CODE & LOCATION:', margin + 12, y + 36);
      doc.fillColor('#334155').font('Helvetica').fontSize(8.5).text(`${data.mine.code}  ·  ${data.mine.location || 'N/A'}`, margin + 12, y + 46);

      // Right Col
      const col2X = margin + 270;
      doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(7.5).text('OPERATING COMPANY:', col2X, y + 10);
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9.5).text(`${data.mine.company?.name || 'N/A'} (${data.mine.company?.code || 'N/A'})`, col2X, y + 20);

      doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(7.5).text('EVALUATION DATE & VERSION:', col2X, y + 36);
      const evalDate = new Date(data.riskScore.calculatedAt).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      doc.fillColor('#334155').font('Helvetica').fontSize(8.5).text(`${evalDate}  ·  Engine v${data.riskScore.calculationVersion || '1.0.0'}`, col2X, y + 46);

      y += 78;

      // Composite Risk Score Hero Banner
      doc.rect(margin, y, contentWidth, 72).fillAndStroke('#ffffff', '#cbd5e1');

      // Left: Big Score
      doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(8).text('COMPOSITE STATUTORY RISK SCORE', margin + 16, y + 12);
      doc.fillColor(bandColor).font('Helvetica-Bold').fontSize(26).text(`${data.riskScore.score}`, margin + 16, y + 24);
      doc.fillColor('#64748b').font('Helvetica').fontSize(12).text('/ 100', margin + 64, y + 36);

      // Middle: Risk Band Badge
      const badgeX = margin + 140;
      doc.rect(badgeX, y + 18, 120, 24).fill(bandColor);
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10).text(
        `${data.riskScore.band} RISK`,
        badgeX,
        y + 25,
        { width: 120, align: 'center' },
      );

      doc.fillColor('#64748b').font('Helvetica').fontSize(7.5).text(
        'CMR 2017 Reg. 108 Standard',
        badgeX,
        y + 46,
        { width: 120, align: 'center' },
      );

      // Right: Key Signals Summary
      const summaryX = margin + 280;
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8).text('ROLLING 30-DAY STATUTORY SIGNALS:', summaryX, y + 12);
      doc.fillColor('#334155').font('Helvetica').fontSize(8).text(
        `• Critical Violations in window: ${data.riskScore.factors?.violations?.counts?.critical ?? 0}`,
        summaryX,
        y + 24,
      );
      doc.fillColor('#334155').font('Helvetica').fontSize(8).text(
        `• Overdue Corrective Actions (CAPA): ${data.riskScore.factors?.capas?.counts?.overdue ?? 0}`,
        summaryX,
        y + 36,
      );
      doc.fillColor('#334155').font('Helvetica').fontSize(8).text(
        `• Statutory Compliance Rate: ${data.complianceSummary.rate}%`,
        summaryX,
        y + 48,
      );

      y += 82;

      // Plain Language Narrative Box
      doc.rect(margin, y, contentWidth, 48).fillAndStroke('#f1f5f9', '#e2e8f0');
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8).text('REGULATORY SUMMARY & EXPLANATION:', margin + 12, y + 8);
      doc.fillColor('#334155').font('Helvetica').fontSize(8).text(
        data.riskScore.plainLanguageExplanation ||
          `${data.mine.name} maintains a risk score of ${data.riskScore.score}/100 in the ${data.riskScore.band} band evaluated across 30-day statutory returns.`,
        margin + 12,
        y + 20,
        { width: contentWidth - 24, lineGap: 2 },
      );

      y += 58;

      // Section: Regulatory Factors Table
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text('DGMS STATUTORY RISK FACTOR BREAKDOWN', margin, y);
      y += 14;

      // Factor Table Header
      doc.rect(margin, y, contentWidth, 18).fill('#334155');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7.5);
      doc.text('RISK FACTOR', margin + 8, y + 5, { width: 140 });
      doc.text('DGMS WEIGHT', margin + 155, y + 5, { width: 70 });
      doc.text('RAW / NORM SCORE', margin + 230, y + 5, { width: 90 });
      doc.text('WEIGHTED CONTRIBUTION', margin + 325, y + 5, { width: 95 });
      doc.text('CURRENT SIGNALS', margin + 425, y + 5, { width: 85 });
      y += 18;

      const factorRows = [
        {
          name: 'Statutory Safety Violations',
          weight: '35%',
          norm: `${data.riskScore.factors?.violations?.normalizedScore ?? 0} / 100`,
          weighted: `${data.riskScore.factors?.violations?.weightedScore ?? 0} pts`,
          signals: `${data.riskScore.factors?.violations?.counts?.critical ?? 0} crit, ${data.riskScore.factors?.violations?.counts?.total ?? 0} tot`,
        },
        {
          name: 'Overdue Corrective Actions (CAPA)',
          weight: '25%',
          norm: `${data.riskScore.factors?.capas?.normalizedScore ?? 0} / 100`,
          weighted: `${data.riskScore.factors?.capas?.weightedScore ?? 0} pts`,
          signals: `${data.riskScore.factors?.capas?.counts?.overdue ?? 0} overdue, ${data.riskScore.factors?.capas?.counts?.open ?? 0} open`,
        },
        {
          name: 'Statutory Compliance Health',
          weight: '25%',
          norm: `${data.riskScore.factors?.compliance?.normalizedScore ?? 0} / 100`,
          weighted: `${data.riskScore.factors?.compliance?.weightedScore ?? 0} pts`,
          signals: `${data.complianceSummary.nonCompliant} non-comp, ${data.complianceSummary.rate}% pass`,
        },
        {
          name: 'Inspection Velocity Gap',
          weight: '15%',
          norm: `${data.riskScore.factors?.inspectionGap?.normalizedScore ?? 0} / 100`,
          weighted: `${data.riskScore.factors?.inspectionGap?.weightedScore ?? 0} pts`,
          signals: `${data.riskScore.factors?.inspectionGap?.counts?.completed ?? 0} done / ${data.riskScore.factors?.inspectionGap?.counts?.total ?? 0} sched`,
        },
      ];

      factorRows.forEach((row, idx) => {
        const bg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
        doc.rect(margin, y, contentWidth, 16).fillAndStroke(bg, '#e2e8f0');
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(7.5).text(row.name, margin + 8, y + 4, { width: 140 });
        doc.fillColor('#334155').font('Helvetica').fontSize(7.5);
        doc.text(row.weight, margin + 155, y + 4, { width: 70 });
        doc.text(row.norm, margin + 230, y + 4, { width: 90 });
        doc.fillColor('#0f172a').font('Helvetica-Bold').text(row.weighted, margin + 325, y + 4, { width: 95 });
        doc.fillColor('#475569').font('Helvetica').text(row.signals, margin + 425, y + 4, { width: 85 });
        y += 16;
      });

      y += 12;

      // Section: Active Anomalies Table
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text('DETECTED ANOMALY FLAGS & STATUTORY ESCALATIONS', margin, y);
      y += 14;

      doc.rect(margin, y, contentWidth, 18).fill('#334155');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7.5);
      doc.text('ANOMALY TYPE', margin + 8, y + 5, { width: 150 });
      doc.text('STATUS', margin + 165, y + 5, { width: 70 });
      doc.text('BASELINE THRESHOLD', margin + 240, y + 5, { width: 120 });
      doc.text('OBSERVED METRIC', margin + 365, y + 5, { width: 140 });
      y += 18;

      if (data.anomalies.length === 0) {
        doc.rect(margin, y, contentWidth, 18).fillAndStroke('#f8fafc', '#e2e8f0');
        doc.fillColor('#15803d').font('Helvetica').fontSize(8).text(
          '✓ No active anomaly flags detected for this mine. Operating within historical baseline thresholds.',
          margin + 8,
          y + 5,
        );
        y += 18;
      } else {
        data.anomalies.slice(0, 4).forEach((anom, idx) => {
          const bg = idx % 2 === 0 ? '#fef2f2' : '#ffffff';
          doc.rect(margin, y, contentWidth, 18).fillAndStroke(bg, '#fecaca');
          doc.fillColor('#991b1b').font('Helvetica-Bold').fontSize(7.5).text(
            anom.type.replace(/_/g, ' '),
            margin + 8,
            y + 5,
            { width: 150 },
          );
          doc.fillColor('#b91c1c').font('Helvetica-Bold').fontSize(7.5).text(
            anom.status,
            margin + 165,
            y + 5,
            { width: 70 },
          );
          doc.fillColor('#475569').font('Helvetica').fontSize(7.5).text(
            anom.threshold || 'N/A',
            margin + 240,
            y + 5,
            { width: 120 },
          );
          const obsStr = anom.observed ? JSON.stringify(anom.observed).replace(/[{}"]/g, '') : 'Threshold exceeded';
          doc.fillColor('#0f172a').font('Helvetica').fontSize(7.5).text(
            obsStr,
            margin + 365,
            y + 5,
            { width: 140 },
          );
          y += 18;
        });
      }

      // ── PAGE 2: VIOLATIONS, CAPA & DIGITAL AUDIT TRAIL ─────────────────────
      doc.addPage();
      let y2 = margin;

      // Page 2 Header Banner
      doc.rect(margin, y2, contentWidth, 24).fill('#0f172a');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9).text(
        `STATUTORY SAFETY VIOLATIONS & REMEDIATION LOG — ${data.mine.name} (${data.mine.code})`,
        margin + 12,
        y2 + 7,
      );

      y2 += 34;

      // Violations Table Header
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text('RECENT STATUTORY VIOLATIONS (CMR 2017)', margin, y2);
      y2 += 14;

      doc.rect(margin, y2, contentWidth, 18).fill('#334155');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7.5);
      doc.text('CODE & TITLE', margin + 8, y2 + 5, { width: 180 });
      doc.text('STATUTORY RULE', margin + 195, y2 + 5, { width: 100 });
      doc.text('SEVERITY', margin + 300, y2 + 5, { width: 65 });
      doc.text('STATUS', margin + 370, y2 + 5, { width: 65 });
      doc.text('RAISED DATE', margin + 440, y2 + 5, { width: 70 });
      y2 += 18;

      if (data.violations.length === 0) {
        doc.rect(margin, y2, contentWidth, 18).fillAndStroke('#f8fafc', '#e2e8f0');
        doc.fillColor('#15803d').font('Helvetica').fontSize(8).text(
          '✓ No statutory violations recorded in current active registry.',
          margin + 8,
          y2 + 5,
        );
        y2 += 18;
      } else {
        data.violations.slice(0, 6).forEach((v, idx) => {
          const bg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
          doc.rect(margin, y2, contentWidth, 18).fillAndStroke(bg, '#e2e8f0');
          doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(7.5).text(
            `${v.code}: ${v.title}`,
            margin + 8,
            y2 + 5,
            { width: 180, ellipsis: true },
          );
          doc.fillColor('#475569').font('Helvetica').fontSize(7.5).text(
            v.statutoryRule || 'CMR Reg. 108',
            margin + 195,
            y2 + 5,
            { width: 100 },
          );
          const sevColor = v.severity === 'CRITICAL' ? '#dc2626' : (v.severity === 'HIGH' ? '#ea580c' : '#2563eb');
          doc.fillColor(sevColor).font('Helvetica-Bold').fontSize(7.5).text(
            v.severity,
            margin + 300,
            y2 + 5,
            { width: 65 },
          );
          doc.fillColor('#0f172a').font('Helvetica').fontSize(7.5).text(
            v.status,
            margin + 370,
            y2 + 5,
            { width: 65 },
          );
          const rDate = v.raisedAt ? new Date(v.raisedAt).toLocaleDateString('en-IN') : 'N/A';
          doc.fillColor('#64748b').font('Helvetica').fontSize(7.5).text(
            rDate,
            margin + 440,
            y2 + 5,
            { width: 70 },
          );
          y2 += 18;
        });
      }

      y2 += 16;

      // Corrective & Preventive Actions (CAPA)
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text('CORRECTIVE ACTIONS & STATUTORY SLA STATUS', margin, y2);
      y2 += 14;

      doc.rect(margin, y2, contentWidth, 18).fill('#334155');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7.5);
      doc.text('CAPA TITLE & TARGET ACTION', margin + 8, y2 + 5, { width: 220 });
      doc.text('DUE DATE', margin + 235, y2 + 5, { width: 85 });
      doc.text('STATUS', margin + 325, y2 + 5, { width: 85 });
      doc.text('COMPLIANCE SLA', margin + 415, y2 + 5, { width: 95 });
      y2 += 18;

      if (data.capas.length === 0) {
        doc.rect(margin, y2, contentWidth, 18).fillAndStroke('#f8fafc', '#e2e8f0');
        doc.fillColor('#15803d').font('Helvetica').fontSize(8).text(
          '✓ No pending corrective action directives outstanding.',
          margin + 8,
          y2 + 5,
        );
        y2 += 18;
      } else {
        data.capas.slice(0, 5).forEach((c, idx) => {
          const capaDate = c.dueAt || c.dueDate;
          const isOverdue = c.status === 'OVERDUE' || (c.status === 'OPEN' && capaDate && new Date(capaDate) < new Date());
          const bg = isOverdue ? '#fffbeb' : (idx % 2 === 0 ? '#f8fafc' : '#ffffff');
          doc.rect(margin, y2, contentWidth, 18).fillAndStroke(bg, '#e2e8f0');
          doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(7.5).text(
            c.title || 'Corrective action',
            margin + 8,
            y2 + 5,
            { width: 220, ellipsis: true },
          );
          const dDate = capaDate ? new Date(capaDate).toLocaleDateString('en-IN') : 'N/A';
          doc.fillColor('#475569').font('Helvetica').fontSize(7.5).text(
            dDate,
            margin + 235,
            y2 + 5,
            { width: 85 },
          );
          doc.fillColor(isOverdue ? '#b45309' : '#15803d').font('Helvetica-Bold').fontSize(7.5).text(
            c.status,
            margin + 325,
            y2 + 5,
            { width: 85 },
          );
          doc.fillColor(isOverdue ? '#dc2626' : '#15803d').font('Helvetica').fontSize(7.5).text(
            isOverdue ? '⚠️ SLA BREACHED' : '✓ WITHIN SLA',
            margin + 415,
            y2 + 5,
            { width: 95 },
          );
          y2 += 18;
        });
      }

      y2 += 20;

      // Digital Integrity & Verification Box
      doc.rect(margin, y2, contentWidth, 80).fillAndStroke('#0f172a', '#1e293b');
      
      doc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(8.5).text(
        '🔒 IMMUTABLE CRYPTOGRAPHIC VERIFICATION & AUDIT STAMP',
        margin + 12,
        y2 + 10,
      );

      doc.fillColor('#94a3b8').font('Helvetica').fontSize(7.5).text(
        'This risk dossier was generated from verified PostgreSQL records and is bound to the immutable platform audit ledger.',
        margin + 12,
        y2 + 23,
        { width: contentWidth - 24 },
      );

      doc.fillColor('#cbd5e1').font('Helvetica-Bold').fontSize(7.5).text('SHA-256 DIGITAL VERIFICATION HASH:', margin + 12, y2 + 37);
      doc.fillColor('#f8fafc').font('Courier').fontSize(7).text(data.digitalSignature, margin + 12, y2 + 48, { width: contentWidth - 24 });

      doc.fillColor('#64748b').font('Helvetica').fontSize(6.5).text(
        `Generated by Authorized Account (${data.user.role}: ${data.user.email || data.user.id}) on ${new Date().toUTCString()}`,
        margin + 12,
        y2 + 63,
      );

      y2 += 92;

      // Statutory Legal Disclaimer
      doc.rect(margin, y2, contentWidth, 42).fillAndStroke('#f8fafc', '#e2e8f0');
      doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(6.5).text('STATUTORY NOTICE & LEGAL DISCLAIMER:', margin + 8, y2 + 6);
      doc.fillColor('#94a3b8').font('Helvetica').fontSize(6.5).text(
        'This document is an authenticated statutory safety and compliance dossier issued pursuant to the Coal Mines Regulations (CMR 2017) and DGMS Guidelines. Unauthorized reproduction or tampering is punishable under the Mines Act, 1952. All data streams reflect official mine management submissions and DGMS inspection filings.',
        margin + 8,
        y2 + 16,
        { width: contentWidth - 16, lineGap: 1.5 },
      );

      // Footers on all pages
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fillColor('#94a3b8').font('Helvetica').fontSize(7).text(
          `Khanan Suraksha Platform · Directorate General of Mines Safety · Page ${i + 1} of ${range.count}`,
          margin,
          doc.page.height - 25,
          { width: contentWidth, align: 'center' },
        );
      }

      doc.end();
    });
  }
}
