import { Module } from '@nestjs/common';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { ScopeService } from '../common/services/scope.service';
import { AiOrchestratorModule } from '../ai-orchestrator/ai-orchestrator.module';

@Module({
  imports: [AiOrchestratorModule],
  controllers: [AssistantController],
  providers: [AssistantService, ScopeService],
  exports: [AssistantService],
})
export class AssistantModule {}

