import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from './mail.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  /**
   * Hash a plaintext password with bcrypt.
   */
  async hashPassword(password: string): Promise<string> {
    const rounds = this.configService.get<number>('bcrypt.saltRounds') || 10;
    return bcrypt.hash(password, rounds);
  }

  /**
   * Verify a plaintext password against a bcrypt hash.
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * SHA-256 hash of a raw refresh token (for DB storage).
   */
  hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Generate a cryptographically random refresh token.
   */
  generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * ──────────────────────────────────────────────────────────────────────────
   * UNIVERSAL EMAIL OTP AUTHENTICATION
   * ──────────────────────────────────────────────────────────────────────────
   */

  /**
   * Request a 6-digit cryptographically secure OTP sent to official email.
   */
  async requestOtp(rawEmail: string) {
    const email = rawEmail.trim().toLowerCase();
    this.logger.log(`[OTP Request] Verification code requested for email: ${email}`);

    // Check rate-limiting / cooldown (at least 30s between requests)
    const recentOtp = await this.prisma.emailOtp.findFirst({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - 30 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentOtp) {
      this.logger.warn(`[OTP Request Cooldown] Request throttled for email: ${email}`);
      throw new HttpException(
        {
          code: 'RATE_LIMITED',
          message: 'Please wait 30 seconds before requesting a new verification code.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Invalidate any previous unconsumed OTPs for this email
    await this.prisma.emailOtp.updateMany({
      where: { email, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    this.logger.log(`[Database] Invalidated previous pending OTP records for: ${email}`);

    // Generate 6-digit cryptographically secure OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store hashed OTP in database
    const otpRecord = await this.prisma.emailOtp.create({
      data: {
        email,
        otpHash,
        expiresAt,
      },
    });
    this.logger.log(`[Database] Stored new EmailOtp record (ID: ${otpRecord.id}) for: ${email}`);

    // Dispatch email via MailService (never expose raw OTP in response or production logs)
    this.logger.log(`[Email Service] Attempting dispatch to: ${email}`);
    const mailResult = await this.mailService.sendOtpEmail(email, rawOtp, 5);

    if (!mailResult.success) {
      this.logger.error(`[Email Service Failed] Delivery failed for ${email}: ${mailResult.error}`);
      // Remove or invalidate the failed record so the user is not locked out by the 30s cooldown
      await this.prisma.emailOtp.delete({
        where: { id: otpRecord.id },
      }).catch(() => {});
      this.logger.warn(`[Database] Rolled back pending EmailOtp record for ${email} due to dispatch failure`);

      throw new HttpException(
        {
          code: 'EMAIL_DELIVERY_FAILED',
          message: mailResult.error || 'Failed to dispatch verification code to email. Please verify mail service configuration.',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    this.logger.log(`[Email Service Success] Verification OTP code successfully delivered to: ${email}`);

    return {
      data: {
        message: mailResult.isSimulated
          ? 'Statutory verification code generated (Simulation Mode).'
          : 'Statutory verification code dispatched to email address.',
        email,
        expiresInSeconds: 300,
        isSimulated: mailResult.isSimulated || false,
        devOtp: mailResult.isSimulated ? rawOtp : undefined,
      },
    };
  }

  /**
   * Resend OTP with cooldown verification.
   */
  async resendOtp(email: string) {
    this.logger.log(`[OTP Resend] Resend requested for email: ${email.trim().toLowerCase()}`);
    return this.requestOtp(email);
  }

  /**
   * Verify 6-digit OTP, authenticate or register user, and issue session tokens.
   */
  async verifyOtp(dto: VerifyOtpDto) {
    const email = dto.email.trim().toLowerCase();
    const rawOtp = dto.otp.trim();
    this.logger.log(`[OTP Verification] Verification attempt for email: ${email}`);

    // Find the latest unconsumed OTP for this email
    const otpRecord = await this.prisma.emailOtp.findFirst({
      where: {
        email,
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      this.logger.warn(`[OTP Verification Failed] No active OTP record found for: ${email}`);
      throw new UnauthorizedException({
        code: 'INVALID_OTP',
        message: 'No active verification code found. Please request a new code.',
      });
    }

    // Check expiration
    if (otpRecord.expiresAt < new Date()) {
      await this.prisma.emailOtp.update({
        where: { id: otpRecord.id },
        data: { consumedAt: new Date() },
      });
      this.logger.warn(`[OTP Verification Failed] Expired OTP attempted for: ${email}`);
      throw new UnauthorizedException({
        code: 'OTP_EXPIRED',
        message: 'Verification code has expired. Please request a new code.',
      });
    }

    // Check attempt limits
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await this.prisma.emailOtp.update({
        where: { id: otpRecord.id },
        data: { consumedAt: new Date() },
      });
      this.logger.warn(`[OTP Verification Failed] Max attempts exceeded for: ${email}`);
      throw new UnauthorizedException({
        code: 'MAX_ATTEMPTS_EXCEEDED',
        message: 'Maximum verification attempts exceeded. Please request a new code.',
      });
    }

    // Verify OTP hash
    const isValid = await bcrypt.compare(rawOtp, otpRecord.otpHash);
    if (!isValid) {
      const updatedAttempts = otpRecord.attempts + 1;
      const willInvalidate = updatedAttempts >= otpRecord.maxAttempts;
      await this.prisma.emailOtp.update({
        where: { id: otpRecord.id },
        data: {
          attempts: updatedAttempts,
          ...(willInvalidate ? { consumedAt: new Date() } : {}),
        },
      });
      const remaining = otpRecord.maxAttempts - updatedAttempts;
      this.logger.warn(`[OTP Verification Failed] Invalid OTP entered for ${email} (Attempts: ${updatedAttempts}/${otpRecord.maxAttempts})`);
      throw new UnauthorizedException({
        code: 'INVALID_OTP',
        message: `Invalid verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Code invalidated.'}`,
      });
    }

    // Consume OTP on successful verification
    await this.prisma.emailOtp.update({
      where: { id: otpRecord.id },
      data: { consumedAt: new Date() },
    });
    // Invalidate any other old unconsumed OTPs for this email
    await this.prisma.emailOtp.updateMany({
      where: { email, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    this.logger.log(`[Database] Consumed OTP record ${otpRecord.id} and invalidated old tokens for: ${email}`);

    // Check if user already exists
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
        mineAssignments: {
          where: { active: true },
          include: { mine: true },
        },
      },
    });

    // If new user, create account with restricted default role (MINE_OFFICIAL)
    if (!user) {
      const defaultName = dto.name?.trim() || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const randomPasswordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
      
      // Auto-assign to default company if available
      const defaultCompany = await this.prisma.company.findFirst();

      const created = await this.prisma.user.create({
        data: {
          email,
          name: defaultName,
          phone: dto.phone || null,
          designation: dto.designation || 'Safety & Compliance Official',
          organization: dto.organization || defaultCompany?.name || 'Coal India Limited',
          passwordHash: randomPasswordHash,
          role: UserRole.MINE_OFFICIAL,
          status: UserStatus.ACTIVE,
          companyId: defaultCompany?.id || null,
        },
      });

      // Auto-assign default mine if available
      if (defaultCompany) {
        const defaultMine = await this.prisma.mine.findFirst({
          where: { companyId: defaultCompany.id },
        });
        if (defaultMine) {
          await this.prisma.userMineAssignment.create({
            data: {
              userId: created.id,
              mineId: defaultMine.id,
            },
          });
        }
      }

      user = await this.prisma.user.findUnique({
        where: { id: created.id },
        include: {
          company: true,
          mineAssignments: {
            where: { active: true },
            include: { mine: true },
          },
        },
      });
    }

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException({
        code: 'ACCOUNT_INACTIVE',
        message: 'Account is not active or has been restricted. Contact your statutory administrator.',
      });
    }

    // Issue JWT Access & Refresh Tokens
    const accessToken = this.generateAccessToken(user.id, user.role);
    const rawRefreshToken = this.generateRefreshToken();
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';
    const expiresAt = this.calculateExpiry(refreshExpiresIn);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(rawRefreshToken),
        expiresAt,
      },
    });

    this.logger.log(`User ${user.email} successfully authenticated via OTP`);

    return {
      data: {
        accessToken,
        refreshToken: rawRefreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          designation: user.designation,
          organization: user.organization || user.company?.name || 'Coal India Limited',
          role: user.role,
          contractorId: user.contractorId || (user.role === UserRole.CONTRACTOR ? `BCCL-CNT-${user.id.slice(0, 8).toUpperCase()}` : null),
          company: user.company,
          assignedMines: user.mineAssignments.map((a) => a.mine),
        },
      },
    };
  }

  /**
   * Get Current Authenticated User Profile with roles, mine assignments, and permissions.
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
        mineAssignments: {
          where: { active: true },
          include: { mine: true },
        },
        assignedCapas: {
          where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
          select: { id: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: 'USER_NOT_FOUND',
        message: 'Authenticated user profile not found',
      });
    }

    // Compute granular permissions based on DB role
    const permissions = {
      canManageUsers: user.role === UserRole.ADMIN,
      canConfigureMines: user.role === UserRole.ADMIN,
      canViewAuditLogs: user.role === UserRole.ADMIN || user.role === UserRole.REGULATOR,
      canVerifyAuditChain: user.role === UserRole.ADMIN || user.role === UserRole.REGULATOR,
      canViewAllMines: user.role === UserRole.ADMIN || user.role === UserRole.REGULATOR,
      canIssueViolations: user.role === UserRole.REGULATOR || user.role === UserRole.MINE_OFFICIAL,
      canConductInspections: user.role === UserRole.MINE_OFFICIAL || user.role === UserRole.REGULATOR || user.role === UserRole.ADMIN,
      canRecordObservations: user.role === UserRole.MINE_OFFICIAL || user.role === UserRole.REGULATOR || user.role === UserRole.ADMIN,
      canExecuteCapa: user.role === UserRole.MINE_OFFICIAL || user.role === UserRole.ADMIN,
      canApproveCapa: user.role === UserRole.MINE_OFFICIAL || user.role === UserRole.CORPORATE_MANAGEMENT || user.role === UserRole.ADMIN,
      canViewCompanyMines: user.role === UserRole.CORPORATE_MANAGEMENT || user.role === UserRole.ADMIN || user.role === UserRole.REGULATOR,
      canExportReports: true,
      canCaptureGps: true,
    };

    return {
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        designation: user.designation || 'Safety Official',
        organization: user.organization || user.company?.name || 'Coal India Limited',
        role: user.role,
        contractorId: user.contractorId || (user.role === UserRole.CONTRACTOR ? `BCCL-CNT-${user.id.slice(0, 8).toUpperCase()}` : null),
        status: user.status,
        company: user.company,
        assignedMines: user.mineAssignments.map((a) => a.mine),
        pendingCapasCount: user.assignedCapas.length,
        permissions,
      },
    };
  }

  /**
   * Update Profile information for the current user.
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.phone ? { phone: dto.phone.trim() } : {}),
        ...(dto.designation ? { designation: dto.designation.trim() } : {}),
        ...(dto.organization ? { organization: dto.organization.trim() } : {}),
      },
      include: {
        company: true,
        mineAssignments: {
          where: { active: true },
          include: { mine: true },
        },
      },
    });

    return {
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        designation: updated.designation,
        organization: updated.organization || updated.company?.name,
        role: updated.role,
      },
    };
  }

  /**
   * Legacy / Seed Login: validate credentials, issue access + refresh tokens.
   */
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
        mineAssignments: {
          where: { active: true },
          include: { mine: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    const passwordValid = await this.verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Account is not active. Contact your administrator.',
      });
    }

    const accessToken = this.generateAccessToken(user.id, user.role);
    const rawRefreshToken = this.generateRefreshToken();

    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';
    const expiresAt = this.calculateExpiry(refreshExpiresIn);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(rawRefreshToken),
        expiresAt,
      },
    });

    this.logger.log(`User ${user.email} logged in successfully`);

    return {
      data: {
        accessToken,
        refreshToken: rawRefreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          designation: user.designation,
          organization: user.organization || user.company?.name,
          role: user.role,
          contractorId: user.contractorId || (user.role === UserRole.CONTRACTOR ? `BCCL-CNT-${user.id.slice(0, 8).toUpperCase()}` : null),
          company: user.company,
          assignedMines: user.mineAssignments.map((a) => a.mine),
        },
      },
    };
  }

  /**
   * Refresh: validate refresh token, rotate tokens.
   */
  async refresh(rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Invalid refresh token',
      });
    }

    if (storedToken.revoked) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Refresh token has been revoked',
      });
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Refresh token has expired',
      });
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Issue new tokens
    const newAccessToken = this.generateAccessToken(
      storedToken.user.id,
      storedToken.user.role,
    );
    const newRawRefreshToken = this.generateRefreshToken();
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';

    await this.prisma.refreshToken.create({
      data: {
        userId: storedToken.user.id,
        tokenHash: this.hashToken(newRawRefreshToken),
        expiresAt: this.calculateExpiry(refreshExpiresIn),
      },
    });

    return {
      data: {
        accessToken: newAccessToken,
        refreshToken: newRawRefreshToken,
      },
    };
  }

  /**
   * Logout: revoke refresh token.
   */
  async logout(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      return { data: { message: 'Logged out' } };
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (storedToken && !storedToken.revoked) {
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      });
    }

    return {
      data: {
        message: 'Logged out successfully',
      },
    };
  }

  /**
   * Universal High-Speed Indian SMS OTP Dispatcher (Fast2SMS / 2Factor / Twilio)
   */
  async requestSmsOtp(rawPhone: string, existingOtp?: string, customApiKey?: string, customProvider?: string) {
    const cleanPhone = (rawPhone || '').replace(/[^0-9]/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      throw new BadRequestException('Please provide a valid 10-digit Indian mobile number');
    }

    const otp = existingOtp || Math.floor(100000 + Math.random() * 900000).toString();
    const fast2smsKey = (customProvider === 'fast2sms' && customApiKey)
      ? customApiKey
      : (process.env.FAST2SMS_API_KEY || this.configService.get<string>('FAST2SMS_API_KEY'));
    const twoFactorKey = (customProvider === 'twofactor' && customApiKey)
      ? customApiKey
      : (process.env.TWOFACTOR_API_KEY || this.configService.get<string>('TWOFACTOR_API_KEY'));
    
    this.logger.log(`\n================================================================`);
    this.logger.log(`[SMS GATEWAY DISPATCH] 📱 Destination: +91 ${cleanPhone}`);
    this.logger.log(`[SMS GATEWAY DISPATCH] 🔑 Statutory DGMS OTP: ${otp}`);
    this.logger.log(`[SMS GATEWAY DISPATCH] ⏰ Validity: 5 Minutes (CMR-2017 Reg. 108)`);
    this.logger.log(`================================================================\n`);

    let dispatched = false;
    let providerUsed = 'Local Statutory SMS Console Gateway';
    let message = 'SMS dispatched successfully.';

    // 1. Primary: Fast2SMS High-Speed Indian Telecom DLT Gateway
    if (fast2smsKey) {
      try {
        const fetchFn = (globalThis as any).fetch;
        if (fetchFn) {
          const res = await fetchFn('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: {
              authorization: fast2smsKey.trim(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              route: 'q',
              message: `Your Khanan Suraksha statutory login OTP is ${otp}. Valid for 5 mins. CMR-2017 compliant.`,
              numbers: cleanPhone,
            }),
          });
          const resJson = await res.json();

          if (resJson && (resJson.return === true || resJson.status_code === 200)) {
            dispatched = true;
            providerUsed = 'Fast2SMS Indian Gateway';
            message = 'Real SMS successfully delivered to your mobile phone via Fast2SMS!';
            this.logger.log(`[Fast2SMS] Cellular SMS dispatched to +91 ${cleanPhone} (Request ID: ${resJson.request_id})`);
          } else {
            message = resJson.message || 'Fast2SMS dispatch processed';
          }
        }
      } catch (err) {
        this.logger.warn(`Fast2SMS Dispatch warning: ${(err as any)?.message}`);
      }
    }

    // 3. Fallback: 2Factor.in API
    if (!dispatched && twoFactorKey) {
      try {
        const fetchFn = (globalThis as any).fetch;
        if (fetchFn) {
          const res = await fetchFn(`https://2factor.in/API/V1/${twoFactorKey.trim()}/SMS/${cleanPhone}/${otp}/AUTOGEN`);
          const resJson = await res.json();
          if (resJson && resJson.Status === 'Success') {
            dispatched = true;
            providerUsed = '2Factor.in Telecom DLT Gateway';
            message = 'SMS delivered to phone number via 2Factor.';
          }
        }
      } catch (err) {
        this.logger.warn(`2Factor Dispatch warning: ${(err as any)?.message}`);
      }
    }

    return {
      success: dispatched,
      data: {
        phone: `+91 ${cleanPhone}`,
        provider: providerUsed,
        dispatchedAt: new Date().toISOString(),
        message,
        dispatched,
      },
    };
  }

  /**
   * Verify Twilio Verify SMS Code
   */
  async verifySmsOtp(rawPhone: string, code: string) {
    const cleanPhone = (rawPhone || '').replace(/[^0-9]/g, '').slice(-10);
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioVerifySid = process.env.TWILIO_VERIFY_SERVICE_SID || 'VAb124301155879aab172adeb45540c488';

    if (twilioSid && twilioAuth) {
      try {
        const fetchFn = (globalThis as any).fetch;
        if (fetchFn) {
          const authHeader = 'Basic ' + Buffer.from(`${twilioSid.trim()}:${twilioAuth.trim()}`).toString('base64');
          const res = await fetchFn(`https://verify.twilio.com/v2/Services/${twilioVerifySid}/VerificationCheck`, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `To=${encodeURIComponent('+91' + cleanPhone)}&Code=${encodeURIComponent(code.trim())}`,
          });

          const resJson = await res.json();
          if (resJson && resJson.status === 'approved') {
            return { success: true, message: 'Twilio SMS Code Approved' };
          }
        }
      } catch (err) {
        this.logger.warn(`Twilio VerificationCheck error: ${(err as any)?.message}`);
      }
    }

    return { success: false, message: 'Invalid or expired OTP code' };
  }

  private generateAccessToken(userId: string, role: string): string {
    return this.jwtService.sign(
      { sub: userId, role },
      {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiresIn') || '15m',
      },
    );
  }

  /**
   * Parse duration strings like "7d", "15m", "1h" to a Date in the future.
   */
  private calculateExpiry(duration: string): Date {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * multipliers[unit]);
  }
}
