import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { MailService } from '../../src/auth/mail.service';
import * as bcrypt from 'bcrypt';

process.env.NODE_ENV = 'test';

describe('Auth (Integration)', () => {
  jest.setTimeout(45000);
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    // Seed a test user
    const passwordHash = await bcrypt.hash('Test@1234', 10);
    await prisma.user.upsert({
      where: { email: 'test-auth@coalmine.gov.in' },
      update: { passwordHash },
      create: {
        name: 'Test Auth User',
        email: 'test-auth@coalmine.gov.in',
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
  }, 45000);

  afterAll(async () => {
    // Cleanup test user and their refresh tokens
    if (prisma) {
      const user = await prisma.user.findUnique({
        where: { email: 'test-auth@coalmine.gov.in' },
      });
      if (user) {
        await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
      }
      await prisma.$disconnect();
    }
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return tokens and user on valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test-auth@coalmine.gov.in', password: 'Test@1234' })
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe('test-auth@coalmine.gov.in');
      expect(res.body.data.user.role).toBe('ADMIN');
    });

    it('should return 401 on wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test-auth@coalmine.gov.in', password: 'WrongPass' })
        .expect(401);

      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 401 on non-existent email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'noone@nowhere.com', password: 'Test@1234' })
        .expect(401);

      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 400 on missing email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ password: 'Test@1234' })
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should issue new tokens on valid refresh', async () => {
      // First login to get a refresh token
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test-auth@coalmine.gov.in', password: 'Test@1234' })
        .expect(200);

      const refreshToken = loginRes.body.data.refreshToken;

      const refreshRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshRes.body.data.accessToken).toBeDefined();
      expect(refreshRes.body.data.refreshToken).toBeDefined();
      // New refresh token should be different (rotation)
      expect(refreshRes.body.data.refreshToken).not.toBe(refreshToken);
    });

    it('should reject a reused (revoked) refresh token', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test-auth@coalmine.gov.in', password: 'Test@1234' })
        .expect(200);

      const refreshToken = loginRes.body.data.refreshToken;

      // Use it once (valid)
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      // Use it again (should be revoked)
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should return 200 on valid logout', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test-auth@coalmine.gov.in', password: 'Test@1234' })
        .expect(200);

      const { accessToken, refreshToken } = loginRes.body.data;

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(res.body.data.message).toBe('Logged out successfully');
    });

    it('should return 401 on logout without access token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .send({ refreshToken: 'anything' })
        .expect(401);
    });
  });

  describe('Universal Email OTP Authentication (Integration)', () => {
    const testOtpEmail = 'officer-test-otp@coalmine.gov.in';
    let mailService: any;

    beforeEach(async () => {
      mailService = app.get(MailService);
      // Cleanup existing OTP records and test user
      await prisma.emailOtp.deleteMany({ where: { email: testOtpEmail } });
      const existingUser = await prisma.user.findUnique({ where: { email: testOtpEmail } });
      if (existingUser) {
        await prisma.refreshToken.deleteMany({ where: { userId: existingUser.id } });
        await prisma.userMineAssignment.deleteMany({ where: { userId: existingUser.id } });
        await prisma.user.delete({ where: { id: existingUser.id } });
      }
    });

    afterAll(async () => {
      await prisma.emailOtp.deleteMany({ where: { email: testOtpEmail } });
      const existingUser = await prisma.user.findUnique({ where: { email: testOtpEmail } });
      if (existingUser) {
        await prisma.refreshToken.deleteMany({ where: { userId: existingUser.id } });
        await prisma.userMineAssignment.deleteMany({ where: { userId: existingUser.id } });
        await prisma.user.delete({ where: { id: existingUser.id } });
      }
    });

    it('should successfully request OTP when mail service succeeds and persist record in DB', async () => {
      const sendMailSpy = jest.spyOn(mailService, 'sendOtpEmail').mockResolvedValueOnce({
        success: true,
        messageId: 'test-message-id-123',
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/request-otp')
        .send({ email: testOtpEmail })
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.email).toBe(testOtpEmail);
      expect(res.body.data.expiresInSeconds).toBe(300);
      expect(sendMailSpy).toHaveBeenCalledWith(testOtpEmail, expect.any(String), 5);

      // Verify OTP stored in database
      const dbRecord = await prisma.emailOtp.findFirst({
        where: { email: testOtpEmail, consumedAt: null },
      });
      expect(dbRecord).toBeDefined();
      expect(dbRecord?.otpHash).toBeDefined();
      expect(dbRecord?.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should reject OTP request with 429 if requested again within 30s cooldown', async () => {
      jest.spyOn(mailService, 'sendOtpEmail').mockResolvedValue({
        success: true,
        messageId: 'test-message-id-123',
      });

      // First request
      await request(app.getHttpServer())
        .post('/api/v1/auth/request-otp')
        .send({ email: testOtpEmail })
        .expect(200);

      // Second request immediately after
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/request-otp')
        .send({ email: testOtpEmail })
        .expect(429);

      expect(res.body.error.code).toBe('RATE_LIMITED');
    });

    it('should return 502 and rollback DB record when mail dispatch fails', async () => {
      jest.spyOn(mailService, 'sendOtpEmail').mockResolvedValueOnce({
        success: false,
        error: 'SMTP Connection Refused: host unreachable',
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/request-otp')
        .send({ email: testOtpEmail })
        .expect(502);

      expect(res.body.error.code).toBe('EMAIL_DELIVERY_FAILED');

      // Verify database record was rolled back / deleted
      const dbRecord = await prisma.emailOtp.findFirst({
        where: { email: testOtpEmail },
      });
      expect(dbRecord).toBeNull();
    });

    it('should verify valid OTP, auto-register new user, and consume OTP', async () => {
      let dispatchedOtp = '';
      jest.spyOn(mailService, 'sendOtpEmail').mockImplementation(async (...args: any[]): Promise<any> => {
        dispatchedOtp = String(args[1]);
        return { success: true, messageId: 'msg-456' };
      });

      // Request OTP
      await request(app.getHttpServer())
        .post('/api/v1/auth/request-otp')
        .send({ email: testOtpEmail })
        .expect(200);

      expect(dispatchedOtp).toMatch(/^[0-9]{6}$/);

      // Verify OTP
      const verifyRes = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({
          email: testOtpEmail,
          otp: dispatchedOtp,
          name: 'Statutory Inspector Sharma',
          designation: 'Safety Director',
        })
        .expect(200);

      expect(verifyRes.body.data.accessToken).toBeDefined();
      expect(verifyRes.body.data.refreshToken).toBeDefined();
      expect(verifyRes.body.data.user.email).toBe(testOtpEmail);
      expect(verifyRes.body.data.user.name).toBe('Statutory Inspector Sharma');

      // Verify DB record is marked consumed
      const dbRecord = await prisma.emailOtp.findFirst({
        where: { email: testOtpEmail },
      });
      expect(dbRecord?.consumedAt).not.toBeNull();

      // Ensure consumed OTP cannot be reused
      const replayRes = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({
          email: testOtpEmail,
          otp: dispatchedOtp,
        })
        .expect(401);

      expect(replayRes.body.error.code).toBe('INVALID_OTP');
    });

    it('should reject incorrect OTP code and track attempt count', async () => {
      const rawOtp = '123456';
      const otpHash = await bcrypt.hash(rawOtp, 10);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      const record = await prisma.emailOtp.create({
        data: { email: testOtpEmail, otpHash, expiresAt, attempts: 0 },
      });

      // Attempt with wrong OTP
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({ email: testOtpEmail, otp: '654321' })
        .expect(401);

      expect(res.body.error.code).toBe('INVALID_OTP');

      // Check DB attempts incremented
      const updated = await prisma.emailOtp.findUnique({ where: { id: record.id } });
      expect(updated?.attempts).toBe(1);
    });

    it('should reject expired OTP', async () => {
      const rawOtp = '123456';
      const otpHash = await bcrypt.hash(rawOtp, 10);
      const expiresAt = new Date(Date.now() - 1000); // Expired 1s ago

      await prisma.emailOtp.create({
        data: { email: testOtpEmail, otpHash, expiresAt },
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({ email: testOtpEmail, otp: rawOtp })
        .expect(401);

      expect(res.body.error.code).toBe('OTP_EXPIRED');
    });

    it('should reject OTP when max attempts (5) are exceeded', async () => {
      const rawOtp = '123456';
      const otpHash = await bcrypt.hash(rawOtp, 10);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await prisma.emailOtp.create({
        data: { email: testOtpEmail, otpHash, expiresAt, attempts: 5, maxAttempts: 5 },
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({ email: testOtpEmail, otp: rawOtp })
        .expect(401);

      expect(res.body.error.code).toBe('MAX_ATTEMPTS_EXCEEDED');
    });
  });
});
