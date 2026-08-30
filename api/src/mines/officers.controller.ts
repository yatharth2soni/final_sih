import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';
import { UserRole, UserStatus } from '@prisma/client';

@Controller('officers')
@UseGuards(JwtAuthGuard)
export class OfficersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getOfficers(
    @Query('mineId') mineId?: string,
    @Query('companyId') companyId?: string,
    @Query('role') role?: UserRole,
    @CurrentUser() currentUser?: RequestUser,
  ) {
    const whereClause: any = {
      status: UserStatus.ACTIVE,
    };

    if (role) {
      whereClause.role = role;
    }

    if (companyId) {
      whereClause.companyId = companyId;
    }

    if (mineId) {
      // Find officers assigned directly to this mine, or officials from the same company
      const mine = await this.prisma.mine.findUnique({
        where: { id: mineId },
        select: { companyId: true },
      });

      whereClause.OR = [
        {
          mineAssignments: {
            some: {
              mineId,
              active: true,
            },
          },
        },
        ...(mine?.companyId ? [{ companyId: mine.companyId }] : []),
        { role: UserRole.ADMIN },
        { role: UserRole.REGULATOR },
      ];
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        designation: true,
        organization: true,
        role: true,
        status: true,
        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        mineAssignments: {
          where: { active: true },
          select: {
            mine: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
      take: 100,
    });

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      designation: u.designation || (u.role === UserRole.REGULATOR ? 'DGMS Safety Inspector' : u.role === UserRole.ADMIN ? 'Statutory Administrator' : 'Safety Officer'),
      organization: u.organization || u.company?.name || 'Directorate General of Mines Safety',
      role: u.role,
      status: u.status,
      assignedMines: u.mineAssignments.map((a) => a.mine),
    }));

    return {
      data: formatted,
    };
  }
}
