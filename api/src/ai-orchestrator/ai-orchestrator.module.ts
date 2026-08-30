import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { ScopeService } from '../common/services/scope.service';
import { GeminiProvider } from './providers/gemini.provider';
import { GroqProvider } from './providers/groq.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { ScopeGuard } from './scope-guard';
import { RagService } from './rag.service';
import { AiOrchestratorService } from './ai-orchestrator.service';
import { AiController } from './ai.controller';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AiController],
  providers: [
    GeminiProvider,
    GroqProvider,
    OpenRouterProvider,
    ScopeGuard,
    RagService,
    AiOrchestratorService,
    ScopeService,
  ],
  exports: [AiOrchestratorService, RagService, ScopeGuard],
})
export class AiOrchestratorModule {}
