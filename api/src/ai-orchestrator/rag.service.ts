import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CitationReference } from './ai-orchestrator.types';

export interface GroundedContext {
  contextText: string;
  citations: CitationReference[];
  intent: string;
  extractedMineId?: string;
  extractedMineName?: string;
  structuredFacts?: any;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(private readonly prisma: PrismaService) {}

  public async buildGroundedContext(
    question: string,
    mineId?: string,
    companyId?: string,
    userAccessibleMineIds?: string[] | null,
  ): Promise<GroundedContext> {
    const citations: CitationReference[] = [];
    const contextSections: string[] = [];
    const structuredFacts: any = {};

    const lower = question.toLowerCase();

    // 1. Resolve target mine if not provided directly
    let targetMine = null;
    if (mineId) {
      targetMine = await this.prisma.mine.findUnique({
        where: { id: mineId },
        include: { company: true },
      });
    } else {
      // Entity extraction
      const allMines = await this.prisma.mine.findMany({
        where: userAccessibleMineIds ? { id: { in: userAccessibleMineIds } } : undefined,
        include: { company: true },
      });

      for (const m of allMines) {
        const mineNameLower = m.name.toLowerCase();
        const mineCodeLower = m.code.toLowerCase();
        const nameTokens = mineNameLower.split(/[\s\-_,\.]+/).filter(t => t.length >= 3);
        if (
          lower.includes(mineNameLower) ||
          lower.includes(mineCodeLower) ||
          nameTokens.some(token => lower.includes(token))
        ) {
          targetMine = m;
          break;
        }
      }
    }

    if (targetMine) {
      citations.push({
        resourceType: 'Mine',
        resourceId: targetMine.id,
        label: `${targetMine.name} (${targetMine.code})`,
      });

      contextSections.push(`[TARGET MINE]
Mine: ${targetMine.name} (Code: ${targetMine.code})
Company: ${targetMine.company?.name || 'N/A'}
Location: ${targetMine.location}`);

      // Fetch latest Risk Score
      const latestRisk = await this.prisma.riskScore.findFirst({
        where: { mineId: targetMine.id },
        orderBy: { calculatedAt: 'desc' },
      });

      if (latestRisk) {
        citations.push({
          resourceType: 'RiskScore',
          resourceId: latestRisk.id,
          label: `Risk Score: ${latestRisk.score}/100 [${latestRisk.band}]`,
        });

        structuredFacts.targetRisk = {
          score: latestRisk.score,
          band: latestRisk.band,
          explanation: latestRisk.plainLanguageExplanation,
        };

        contextSections.push(`[TARGET MINE RISK SCORE]
Score: ${latestRisk.score}/100 (${latestRisk.band} Risk)
Explanation: ${latestRisk.plainLanguageExplanation}`);
      }
    }

    // 2. Fetch Top High-Risk Mines
    const topRiskScores = await this.prisma.riskScore.findMany({
      orderBy: { score: 'desc' },
      distinct: ['mineId'],
      take: 5,
      include: { mine: true },
    });

    if (topRiskScores.length > 0) {
      structuredFacts.highRiskMines = topRiskScores.map((r) => ({
        code: r.mine.code,
        name: r.mine.name,
        score: r.score,
        band: r.band,
        explanation: r.plainLanguageExplanation,
      }));

      contextSections.push(`[HIGH RISK MINES DATABASE]
${topRiskScores.map((r) => `- ${r.mine.name} (${r.mine.code}): Score ${r.score}/100 [${r.band}]. Factors: ${r.plainLanguageExplanation}`).join('\n')}`);
    }

    // 3. Fetch Overdue Corrective Actions
    const overdueCapas = await this.prisma.correctiveAction.findMany({
      where: {
        status: { in: ['OVERDUE', 'OPEN', 'IN_PROGRESS'] },
        dueAt: { lt: new Date() },
      },
      include: {
        violation: { include: { mine: true } },
        assignedTo: true,
      },
      take: 6,
      orderBy: { dueAt: 'asc' },
    });

    if (overdueCapas.length > 0) {
      structuredFacts.overdueCapas = overdueCapas.map((c) => ({
        title: c.title,
        mine: c.violation.mine.name,
        dueAt: c.dueAt.toISOString().split('T')[0],
        assignedTo: c.assignedTo.name,
      }));

      contextSections.push(`[OVERDUE CORRECTIVE ACTIONS (CAPA)]
Total Overdue: ${overdueCapas.length}+
${overdueCapas.map((c) => `- ${c.title} at ${c.violation.mine.name} (Assigned to: ${c.assignedTo.name}, Due: ${c.dueAt.toISOString().split('T')[0]})`).join('\n')}`);
    }

    // 4. Fetch Environmental Parameter Exceedances
    const exceedances = await this.prisma.environmentalReading.findMany({
      where: { exceedance: true },
      include: { mine: true },
      take: 6,
      orderBy: { readingDate: 'desc' },
    });

    if (exceedances.length > 0) {
      structuredFacts.environmentalExceedances = exceedances.map((e) => ({
        parameter: e.parameter,
        subParameter: e.subParameter,
        value: e.value,
        limit: e.permissibleLimit,
        unit: e.unit || '',
        mine: e.mine.name,
      }));

      contextSections.push(`[ENVIRONMENTAL EXCEEDANCES]
${exceedances.map((e) => `- ${e.subParameter || e.parameter} at ${e.mine.name}: ${e.value} ${e.unit || ''} (Permissible Limit: ${e.permissibleLimit} ${e.unit || ''})`).join('\n')}`);
    }

    // 5. Fetch High-Risk Contractors
    const highRiskContractors = await this.prisma.contractor.findMany({
      where: {
        riskRating: { in: ['High', 'Critical'] },
      },
      take: 5,
      orderBy: { violationsCount: 'desc' },
    });

    if (highRiskContractors.length > 0) {
      structuredFacts.highRiskContractors = highRiskContractors.map((c) => ({
        name: c.legalName,
        rating: c.riskRating,
        violations: c.violationsCount,
        training: c.trainingPercentage,
      }));

      contextSections.push(`[HIGH RISK CONTRACTORS]
${highRiskContractors.map((c) => `- ${c.legalName}: Risk=${c.riskRating}, Violations=${c.violationsCount}, Training Rate=${c.trainingPercentage}%`).join('\n')}`);
    }

    // 6. Fetch Incident Recurring Causes
    const incidents = await this.prisma.incident.findMany({
      take: 50,
      select: { rootCause: true, causeCategory: true, riskLevel: true },
    });

    if (incidents.length > 0) {
      const causeCounts: Record<string, number> = {};
      incidents.forEach((inc) => {
        const rc = inc.rootCause || 'Unspecified';
        causeCounts[rc] = (causeCounts[rc] || 0) + 1;
      });

      structuredFacts.recurringIncidentCauses = causeCounts;

      contextSections.push(`[RECURRING INCIDENT ROOT CAUSES]
${Object.entries(causeCounts).map(([cause, count]) => `- ${cause}: ${count} incidents recorded`).join('\n')}`);
    }

    // 7. Determine primary intent for tracking
    let detectedIntent = 'MINE_GOVERNANCE_QUERY';
    if (lower.includes('risk') || lower.includes('जोखिम')) {
      detectedIntent = 'MINE_RISK';
    } else if (lower.includes('compliance') || lower.includes('अनुपालन')) {
      detectedIntent = 'COMPLIANCE_STATUS';
    } else if (lower.includes('overdue') || lower.includes('capa') || lower.includes('बकाया') || lower.includes('सुधार')) {
      detectedIntent = 'OVERDUE_CAPA';
    } else if (lower.includes('environment') || lower.includes('पर्यावरण') || lower.includes('exceed')) {
      detectedIntent = 'ENVIRONMENTAL_RISK';
    } else if (lower.includes('contractor') || lower.includes('ठेकेदार')) {
      detectedIntent = 'CONTRACTOR_RISK';
    } else if (lower.includes('incident') || lower.includes('दुर्घटना') || lower.includes('cause') || lower.includes('कारण')) {
      detectedIntent = 'INCIDENT_ANALYSIS';
    } else if (lower.includes('inspection') || lower.includes('निरीक्षण')) {
      detectedIntent = 'INSPECTION_QUERY';
    }

    return {
      contextText: contextSections.join('\n\n'),
      citations,
      intent: detectedIntent,
      extractedMineId: targetMine?.id,
      extractedMineName: targetMine?.name,
      structuredFacts,
    };
  }
}
