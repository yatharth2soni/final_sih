import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { EnvironmentService } from './environment.service';

@Controller('environment')
@UseGuards(JwtAuthGuard)
export class EnvironmentController {
  constructor(private readonly environmentService: EnvironmentService) {}

  @Get('summary')
  async getSummary(@Query('mineId') mineId?: string) {
    const data = await this.environmentService.getMineEnvironmentalStatus(mineId);
    return { data };
  }
}
