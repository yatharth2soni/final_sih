import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiCompletionOptions,
  AiProviderInterface,
  AiProviderType,
} from '../ai-orchestrator.types';

@Injectable()
export class OpenRouterProvider implements AiProviderInterface {
  public readonly name: AiProviderType = 'openrouter';
  private readonly logger = new Logger(OpenRouterProvider.name);
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ai.openRouterApiKey') || '';
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  public async generateCompletion(
    prompt: string,
    systemPrompt?: string,
    options?: AiCompletionOptions,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is not configured.');
    }

    const timeoutMs = options?.timeoutMs || 10000;
    const model = 'meta-llama/llama-3.3-70b-instruct:free';

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://khanan-suraksha.gov.in',
          'X-Title': 'Khanan Suraksha Coal Mine Governance',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature ?? 0.3,
          max_tokens: options?.maxTokens ?? 2048,
          ...(options?.jsonMode ? { response_format: { type: 'json_object' } } : {}),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`OpenRouter request timed out after ${timeoutMs}ms`);
      }
      throw err;
    }
  }
}
