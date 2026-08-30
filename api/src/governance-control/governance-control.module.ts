import { Module } from '@nestjs/common';
import { GovernanceControlController } from './governance-control.controller';
import { SearchController } from './search.controller';
import { GovernanceControlService } from './governance-control.service';
import { ScopeService } from '../common/services/scope.service';

@Module({
  controllers: [GovernanceControlController, SearchController],
  providers: [GovernanceControlService, ScopeService],
  exports: [GovernanceControlService],
})
export class GovernanceControlModule {}

