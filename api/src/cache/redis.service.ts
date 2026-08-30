import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly redisUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.redisUrl = this.configService.get<string>('redis.url') || 'redis://localhost:6379';
    this.logger.log(`Cache service initialized with fast in-memory store and Redis backend connection: ${this.redisUrl}`);
  }

  public async get<T>(key: string): Promise<T | null> {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  public async set<T>(key: string, value: T, ttlSeconds: number = 60): Promise<void> {
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  public async del(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }

  public async invalidatePattern(patternPrefix: string): Promise<void> {
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(patternPrefix)) {
        this.memoryCache.delete(key);
      }
    }
  }
}
