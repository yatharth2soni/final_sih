import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SatelliteService } from './satellite.service';
import { AssignVerificationDto } from './dto/satellite.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';
import { UserRole } from '@prisma/client';

@Controller('satellite')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SatelliteController {
  constructor(private readonly satelliteService: SatelliteService) {}

  @Get('overview')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.CORPORATE_MANAGEMENT, UserRole.MINE_OFFICIAL, UserRole.CONTRACTOR)
  async getOverview() {
    const data = await this.satelliteService.getOverview();
    return { data };
  }

  @Get('events')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.CORPORATE_MANAGEMENT, UserRole.MINE_OFFICIAL)
  async getEvents(@Query('mineId') mineId?: string) {
    const data = await this.satelliteService.getMonitoringEvents(mineId);
    return { data };
  }

  @Get('mines/:id/latest')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.CORPORATE_MANAGEMENT, UserRole.MINE_OFFICIAL, UserRole.CONTRACTOR)
  async getLatestObservation(@Param('id') mineId: string) {
    const data = await this.satelliteService.getLatestObservation(mineId);
    return { data };
  }

  @Get('mines/:id/history')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.CORPORATE_MANAGEMENT, UserRole.MINE_OFFICIAL, UserRole.CONTRACTOR)
  async getObservationsHistory(
    @Param('id') mineId: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.satelliteService.getObservationsHistory(mineId, limit ? Number(limit) : 10);
    return { data };
  }

  @Post('events/:id/assign-verification')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.CORPORATE_MANAGEMENT, UserRole.MINE_OFFICIAL)
  async assignVerification(
    @Param('id') eventId: string,
    @Body() dto: AssignVerificationDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.satelliteService.assignFieldVerification(
      eventId,
      dto.inspectorId || user.id,
      user,
    );
    return { data: result };
  }
}
