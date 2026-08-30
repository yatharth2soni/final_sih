import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GovernanceControlService } from './governance-control.service';
import { OverviewQueryDto } from './dto/overview-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';

@Controller('governance-control')
@UseGuards(JwtAuthGuard)
export class GovernanceControlController {
  constructor(
    private readonly governanceControlService: GovernanceControlService,
  ) {}

  @Get('overview')
  async getOverview(
    @Query() query: OverviewQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.governanceControlService.getOverview(query, user);
    return { data };
  }
}
