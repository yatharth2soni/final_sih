import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ScopeService } from '../common/services/scope.service';
import { RiskScoringModule } from '../risk-scoring/risk-scoring.module';

@Module({
  imports: [RiskScoringModule],
  controllers: [ReportsController],
  providers: [ReportsService, ScopeService],
  exports: [ReportsService],
})
export class ReportsModule {}
