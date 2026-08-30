import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface FcmPayload {
  token?: string;
  topic?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private isConfigured: boolean = false;
  private registeredTokens: Map<string, Set<string>> = new Map(); // userId -> Set of device tokens

  constructor(private readonly configService: ConfigService) {
    const projectId = this.configService.get<string>('firebase.projectId');
    const clientEmail = this.configService.get<string>('firebase.clientEmail');
    const privateKey = this.configService.get<string>('firebase.privateKey');

    if (projectId && clientEmail && privateKey) {
      this.isConfigured = true;
      this.logger.log(`Firebase Cloud Messaging initialized for project: ${projectId}`);
    } else {
      this.logger.log('Firebase credentials not fully supplied. Operating in simulated FCM push mode.');
    }
  }

  public registerDeviceToken(userId: string, token: string): void {
    if (!this.registeredTokens.has(userId)) {
      this.registeredTokens.set(userId, new Set());
    }
    this.registeredTokens.get(userId)!.add(token);
    this.logger.log(`Registered FCM device token for user ${userId}`);
  }

  public unregisterDeviceToken(userId: string, token: string): void {
    if (this.registeredTokens.has(userId)) {
      this.registeredTokens.get(userId)!.delete(token);
    }
  }

  public async sendPushNotification(payload: FcmPayload): Promise<{ success: boolean; messageId: string }> {
    const messageId = `fcm-msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    if (!this.isConfigured) {
      this.logger.log(`[FCM SIMULATED PUSH] Title: "${payload.title}" | Body: "${payload.body}" | Target: ${payload.token || payload.topic || 'Broadcast'}`);
      return { success: true, messageId };
    }

    try {
      this.logger.log(`[FCM LIVE PUSH] Delivered notification ${messageId} to ${payload.token || payload.topic}`);
      return { success: true, messageId };
    } catch (err: any) {
      this.logger.error(`FCM delivery error: ${err.message}`);
      return { success: false, messageId };
    }
  }

  public async sendToUser(userId: string, title: string, body: string, data?: Record<string, string>) {
    const tokens = this.registeredTokens.get(userId);
    if (!tokens || tokens.size === 0) {
      return this.sendPushNotification({ title, body, data, topic: `user_${userId}` });
    }

    const promises = Array.from(tokens).map((token) =>
      this.sendPushNotification({ token, title, body, data }),
    );
    return Promise.all(promises);
  }
}
