import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ProductionService } from './production.service';

@Controller('production')
@UseGuards(JwtAuthGuard)
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get('summary')
  async getSummary(@Query('mineId') mineId?: string) {
    const data = await this.productionService.getProductionSummary(mineId);
    return { data };
  }
}
