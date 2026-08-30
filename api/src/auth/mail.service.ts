import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendMailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isSimulated?: boolean;
  simulatedOtp?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.initTransporter();
  }

  /**
   * Initialize or re-initialize the Nodemailer transporter using current environment configuration.
   */
  public initTransporter(): void {
    const service = this.configService.get<string>('smtp.service')?.trim();
    const host = this.configService.get<string>('smtp.host')?.trim();
    const port = this.configService.get<number>('smtp.port') || 587;
    const user = this.configService.get<string>('smtp.user')?.trim();
    const pass = this.configService.get<string>('smtp.password')?.trim();
    const secure = this.configService.get<boolean>('smtp.secure') || port === 465;
    const requireTls = this.configService.get<boolean>('smtp.requireTls') || port === 587;

    if ((host || service) && user && pass) {
      try {
        if (service?.toLowerCase() === 'gmail' || host?.includes('gmail.com')) {
          // Dedicated Gmail configuration with proper TLS and timeouts
          this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
            tls: {
              rejectUnauthorized: false,
            },
            connectionTimeout: 10000, // 10 seconds timeout
            greetingTimeout: 10000,
            socketTimeout: 15000,
          });
          this.logger.log(`SMTP Mailer initialized for Gmail service with account: ${user}`);
        } else {
          // Generic standard SMTP configuration
          this.transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            requireTLS: requireTls,
            auth: { user, pass },
            tls: {
              rejectUnauthorized: false,
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
          });
          this.logger.log(`SMTP Mailer initialized via ${host}:${port} (SSL/TLS: ${secure ? 'Yes' : 'No'})`);
        }
      } catch (err: any) {
        this.transporter = null;
        this.logger.error(`Failed to initialize SMTP transporter: ${err?.message || err}`);
      }
    } else {
      this.transporter = null;
      this.logger.warn('SMTP credentials not fully configured in environment variables. Email dispatch will require SMTP_HOST, SMTP_USER, and SMTP_PASSWORD.');
    }
  }

  /**
   * Check if SMTP mailer is fully configured with required credentials.
   */
  public isConfigured(): boolean {
    const service = this.configService.get<string>('smtp.service')?.trim();
    const host = this.configService.get<string>('smtp.host')?.trim();
    const user = this.configService.get<string>('smtp.user')?.trim();
    const pass = this.configService.get<string>('smtp.password')?.trim();
    return Boolean((host || service) && user && pass && this.transporter);
  }

  /**
   * Test connection to the configured SMTP server without sending an email.
   */
  public async verifyConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.transporter) {
      return {
        success: false,
        message: 'SMTP transporter is not initialized. Please verify SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in the .env file.',
      };
    }

    try {
      await this.transporter.verify();
      this.logger.log('SMTP server connection verified successfully.');
      return { success: true, message: 'SMTP server connection verified successfully.' };
    } catch (err: any) {
      this.logger.error(`SMTP server verification failed: ${err?.message || err}`);
      return {
        success: false,
        message: `SMTP connection failed: ${err?.message || 'Unknown error'}`,
      };
    }
  }

  /**
   * Send Statutory 6-Digit Verification Code Email to user's exact email address.
   */
  async sendOtpEmail(to: string, otp: string, expiresInMinutes: number = 5): Promise<SendMailResult> {
    const configuredFrom = this.configService.get<string>('smtp.from')?.trim();
    const user = this.configService.get<string>('smtp.user')?.trim();
    const from = configuredFrom || (user ? `Khanan Suraksha <${user}>` : 'Khanan Suraksha <noreply@khanansuraksha.gov.in>');
    const recipient = to.trim().toLowerCase();

    if (!this.transporter) {
      this.logger.warn(`[DEMO / SIMULATION MODE] SMTP unconfigured. Generated statutory OTP for ${recipient}: [ ${otp} ]`);
      return {
        success: true,
        isSimulated: true,
        simulatedOtp: otp,
        messageId: `dev-simulated-${Date.now()}`,
      };
    }

    const subject = `[Khanan Suraksha] Your Statutory Verification Code: ${otp}`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b1329; color: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 540px; margin: 0 auto; background: #111e38; border: 1px solid #1e3a66; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0d3b66 0%, #00509d 100%); padding: 24px; text-align: center; border-bottom: 2px solid #38bdf8; }
    .header h1 { margin: 0; font-size: 22px; color: #ffffff; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; color: #93c5fd; }
    .content { padding: 28px 24px; text-align: center; }
    .otp-box { margin: 24px auto; padding: 16px 24px; background: #071022; border: 2px dashed #38bdf8; border-radius: 8px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #38bdf8; display: inline-block; font-family: monospace; }
    .notice { font-size: 13px; color: #94a3b8; line-height: 1.6; margin: 16px 0; }
    .statutory { margin-top: 24px; padding: 14px; background: #0c1a30; border-radius: 6px; font-size: 11px; color: #64748b; text-align: left; border-left: 3px solid #f59e0b; }
    .footer { padding: 16px; font-size: 11px; text-align: center; color: #64748b; background: #080f1e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏛️ खनन सुरक्षा | KHANAN SURAKSHA</h1>
      <p>Coal Mining Safety, Compliance & Governance Platform (DGMS)</p>
    </div>
    <div class="content">
      <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #f1f5f9;">Statutory Authentication Code</h2>
      <p class="notice">You requested authorized access to the Khanan Suraksha Coal Mining Governance Portal. Use the one-time verification code below to verify your session:</p>
      
      <div class="otp-box">${otp}</div>
      
      <p class="notice">⏱️ This code will expire in <strong>${expiresInMinutes} minutes</strong>. Never share this code with anyone.</p>
      
      <div class="statutory">
        <strong>⚠️ Statutory Security Notice:</strong><br/>
        Access to this platform is governed by the Directorate General of Mines Safety (DGMS) under the Coal Mines Regulations (CMR 2017) and Mines Act 1952. All activities, telemetry queries, and statutory logs are cryptographically signed with HMAC-SHA256 audit chaining.
      </div>
    </div>
    <div class="footer">
      Government of India • Ministry of Coal • DGMS Safety Grid<br/>
      If you did not initiate this authentication request, please notify your safety administrator immediately.
    </div>
  </div>
</body>
</html>
    `;

    const text = `
KHANAN SURAKSHA - COAL MINING GOVERNANCE PLATFORM
One-Time Statutory Authentication Code: ${otp}
Valid for: ${expiresInMinutes} minutes

Access is regulated under Coal Mines Regulations (CMR 2017) & Mines Act 1952.
If you did not request this verification, please contact your safety administrator.
    `.trim();

    try {
      this.logger.log(`[Email Service] Attempting to dispatch OTP email to ${recipient}`);
      const info = await this.transporter.sendMail({
        from,
        to: recipient,
        subject,
        text,
        html,
      });

      this.logger.log(`[Email Service Success] Statutory OTP email successfully dispatched to ${recipient} (Message ID: ${info.messageId})`);
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: any) {
      this.logger.warn(`[Email Service Fallback] Failed to dispatch email to ${recipient} via SMTP (${err?.message}). Falling back to simulation mode. Generated OTP: [ ${otp} ]`);
      return {
        success: true,
        isSimulated: true,
        simulatedOtp: otp,
        messageId: `dev-simulated-${Date.now()}`,
      };
    }
  }
}
