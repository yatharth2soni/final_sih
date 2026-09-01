import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AiCompletionOptions,
  AiProviderInterface,
  AiProviderType,
} from '../ai-orchestrator.types';

@Injectable()
export class GeminiProvider implements AiProviderInterface {
  public readonly name: AiProviderType = 'gemini';
  private readonly logger = new Logger(GeminiProvider.name);
  private client: GoogleGenerativeAI | null = null;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ai.geminiApiKey') || '';
    if (this.apiKey) {
      try {
        this.client = new GoogleGenerativeAI(this.apiKey);
      } catch (err: any) {
        this.logger.warn(`Failed to initialize Gemini SDK: ${err.message}`);
      }
    }
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  public async generateCompletion(
    prompt: string,
    systemPrompt?: string,
    options?: AiCompletionOptions,
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Gemini API key is not configured or client initialization failed.');
    }

    const timeoutMs = options?.timeoutMs || 12000;
    const candidateModels = ['gemini-3.6-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError: Error | null = null;

    for (const modelName of candidateModels) {
      try {
        const modelConfig: any = {
          model: modelName,
          generationConfig: {
            temperature: options?.temperature ?? 0.3,
            maxOutputTokens: options?.maxTokens ?? 2048,
            ...(options?.jsonMode ? { responseMimeType: 'application/json' } : {}),
          },
        };

        if (systemPrompt) {
          modelConfig.systemInstruction = systemPrompt;
        }

        const model = this.client.getGenerativeModel(modelConfig);

        const callPromise = async (): Promise<string> => {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          return response.text();
        };

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Gemini ${modelName} request timed out after ${timeoutMs}ms`)), timeoutMs),
        );

        return await Promise.race([callPromise(), timeoutPromise]);
      } catch (err: any) {
        this.logger.warn(`Gemini model ${modelName} call failed: ${err.message}`);
        lastError = err;
      }
    }

    throw lastError || new Error('All Gemini model candidates failed to respond.');
  }
}
