import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ScopeService } from '../common/services/scope.service';
import { AiOrchestratorService } from './ai-orchestrator.service';
import {
  AiAnalyzeInspectionDto,
  AiChatDto,
  AiClassifyDto,
  AiExplainRiskDto,
  AiRecommendActionDto,
  AiSummarizeDto,
} from './dto/ai-requests.dto';

import { RolesGuard } from '../common/guards/roles.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(
    private readonly aiService: AiOrchestratorService,
    private readonly scopeService: ScopeService,
  ) {}

  @Post('chat')
  async chat(@Body() dto: AiChatDto, @CurrentUser() user: any) {
    const accessibleMineIds = await this.scopeService.getAccessibleMineIds(user);

    if (dto.mineId) {
      await this.scopeService.assertMineAccess(user, dto.mineId);
    }

    const response = await this.aiService.chat(
      dto.question,
      dto.language,
      dto.mineId,
      dto.companyId,
      accessibleMineIds,
    );

    return { data: response };
  }

  @Post('summarize')
  async summarize(@Body() dto: AiSummarizeDto) {
    const systemPrompt = `You are a statutory compliance summarization specialist for coal mining operations. Summarize the following document concisely in ${dto.language === 'hi' ? 'Hindi' : 'English'}.`;
    const { text, provider } = await this.aiService.executeWithFallback(
      dto.content,
      systemPrompt,
      { temperature: 0.2, maxTokens: 1024 },
    );

    return {
      data: {
        summary: text || dto.content.slice(0, 300) + '...',
        language: dto.language || 'en',
        provider,
      },
    };
  }

  @Post('analyze-inspection')
  async analyzeInspection(@Body() dto: AiAnalyzeInspectionDto) {
    const analysis = await this.aiService.analyzeInspection(
      dto.inspectionData,
      dto.language || 'en',
    );
    return { data: analysis };
  }

  @Post('explain-risk')
  async explainRisk(@Body() dto: AiExplainRiskDto) {
    const explanation = await this.aiService.explainRisk(
      dto.mineName,
      dto.score,
      dto.band,
      dto.factors,
      dto.language || 'en',
    );
    return { data: explanation };
  }

  @Post('recommend-action')
  async recommendAction(@Body() dto: AiRecommendActionDto) {
    const recommendation = await this.aiService.recommendAction(
      dto.violationTitle,
      dto.description,
      dto.severity,
      dto.language || 'en',
    );
    return { data: recommendation };
  }

  @Post('transcribe')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max for audio
    }),
  )
  async transcribeAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body('language') language?: 'en' | 'hi',
  ) {
    if (!file) {
      return { error: 'No audio file uploaded' };
    }

    const transcription = await this.aiService.transcribeAudio(
      file.buffer,
      file.originalname || 'field_audio.wav',
      language,
    );

    // Also classify the transcribed text automatically for immediate action routing
    const classification = await this.aiService.classifyIntent(transcription.text);

    return {
      data: {
        ...transcription,
        classification,
      },
    };
  }

  @Post('classify')
  async classify(@Body() dto: AiClassifyDto) {
    const result = await this.aiService.classifyIntent(dto.text);
    return { data: result };
  }

  @Get('providers-status')
  getProvidersStatus() {
    return {
      data: {
        primary: 'gemini',
        fastVoice: 'groq',
        fallback: 'openrouter',
        activeProviders: ['gemini', 'groq', 'openrouter', 'deterministic'],
      },
    };
  }
}
