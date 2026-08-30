import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import {
  AiCompletionOptions,
  AiProviderInterface,
  AiProviderType,
} from '../ai-orchestrator.types';

@Injectable()
export class GroqProvider implements AiProviderInterface {
  public readonly name: AiProviderType = 'groq';
  private readonly logger = new Logger(GroqProvider.name);
  private client: Groq | null = null;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ai.groqApiKey') || '';
    if (this.apiKey) {
      try {
        this.client = new Groq({ apiKey: this.apiKey });
      } catch (err: any) {
        this.logger.warn(`Failed to initialize Groq SDK: ${err.message}`);
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
      throw new Error('Groq API key is not configured or client initialization failed.');
    }

    const timeoutMs = options?.timeoutMs || 10000;
    const model = 'llama-3.3-70b-versatile';

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const callPromise = async (): Promise<string> => {
      const completion = await this.client!.chat.completions.create({
        model,
        messages,
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens ?? 2048,
        ...(options?.jsonMode ? { response_format: { type: 'json_object' } } : {}),
      });

      return completion.choices[0]?.message?.content || '';
    };

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Groq request timed out after ${timeoutMs}ms`)), timeoutMs),
    );

    return Promise.race([callPromise(), timeoutPromise]);
  }

  public async transcribeAudio(
    fileBuffer: Buffer,
    fileName: string = 'audio.wav',
    languageHint?: 'en' | 'hi',
  ): Promise<{ text: string; language?: string; duration?: number }> {
    if (!this.client) {
      throw new Error('Groq client is not initialized for audio transcription.');
    }

    // Convert Buffer to File-like structure for Groq SDK
    const file = await Groq.toFile(fileBuffer, fileName, { type: 'audio/wav' });

    const transcription = await this.client.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3-turbo',
      temperature: 0.0,
      language: languageHint || undefined,
      response_format: 'verbose_json',
    });

    return {
      text: transcription.text || '',
      language: (transcription as any).language,
      duration: (transcription as any).duration,
    };
  }
}
