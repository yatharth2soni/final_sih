import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser, ScopeService } from '../common/services/scope.service';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scopeService: ScopeService,
  ) {}

  @Get()
  async search(
    @Query('q') rawQuery: string,
    @Query('category') category?: string,
    @CurrentUser() user?: RequestUser,
  ) {
    const q = (rawQuery || '').trim();
    if (!q || q.length < 2) {
      return {
        data: {
          mines: [],
          officers: [],
          inspections: [],
          violations: [],
          correctiveActions: [],
          complianceRequirements: [],
        },
      };
    }

    const accessibleMineIds = user ? await this.scopeService.getAccessibleMineIds(user) : null;
    const mineScopeFilter = accessibleMineIds !== null ? { id: { in: accessibleMineIds } } : {};
    const recordMineFilter = accessibleMineIds !== null ? { mineId: { in: accessibleMineIds } } : {};

    const [
      mines,
      officers,
      inspections,
      violations,
      correctiveActions,
      complianceRequirements,
    ] = await Promise.all([
      // 1. Mines
      this.prisma.mine.findMany({
        where: {
          ...mineScopeFilter,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { code: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, code: true, location: true, status: true },
        take: 8,
      }),

      // 2. Officers / Users
      this.prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { designation: { contains: q, mode: 'insensitive' } },
            { organization: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, email: true, role: true, designation: true, organization: true },
        take: 8,
      }),

      // 3. Inspections
      this.prisma.inspection.findMany({
        where: {
          ...recordMineFilter,
          OR: [
            { id: { contains: q, mode: 'insensitive' } },
            { purpose: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          purpose: true,
          status: true,
          scheduledFor: true,
          mine: { select: { id: true, name: true, code: true } },
        },
        take: 8,
      }),

      // 4. Violations
      this.prisma.violation.findMany({
        where: {
          ...recordMineFilter,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          severity: true,
          status: true,
          raisedAt: true,
          mine: { select: { id: true, name: true, code: true } },
        },
        take: 8,
      }),

      // 5. Corrective Actions (CAPA)
      this.prisma.correctiveAction.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
          violation: recordMineFilter,
        },
        select: {
          id: true,
          title: true,
          status: true,
          dueAt: true,
          priority: true,
          assignedTo: { select: { id: true, name: true, email: true } },
        },
        take: 8,
      }),

      // 6. Compliance Requirements
      this.prisma.complianceRequirement.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { code: { contains: q, mode: 'insensitive' } },
            { regulatoryBody: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          code: true,
          title: true,
          category: true,
          regulatoryBody: true,
        },
        take: 8,
      }),
    ]);

    return {
      data: {
        query: q,
        mines,
        officers,
        inspections,
        violations,
        correctiveActions,
        complianceRequirements,
      },
    };
  }
}
