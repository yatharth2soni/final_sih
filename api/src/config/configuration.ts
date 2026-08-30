export default () => {
  // Production security safeguard: fail fast if secrets are missing or using insecure defaults
  if (process.env.NODE_ENV === 'production') {
    const defaultSecrets = [
      'change-me',
      'change-me-too',
      'dev-access-secret-khanan-suraksha-2026',
      'dev-refresh-secret-khanan-suraksha-2026',
    ];
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!accessSecret || defaultSecrets.includes(accessSecret) || accessSecret.length < 32) {
      throw new Error(
        'FATAL: In production mode, JWT_ACCESS_SECRET must be configured with a cryptographically secure random string of at least 32 characters.',
      );
    }
    if (!refreshSecret || defaultSecrets.includes(refreshSecret) || refreshSecret.length < 32) {
      throw new Error(
        'FATAL: In production mode, JWT_REFRESH_SECRET must be configured with a cryptographically secure random string of at least 32 characters.',
      );
    }
  }

  return {
    port: parseInt(process.env.PORT || '4000', 10),
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-khanan-suraksha-2026',
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-khanan-suraksha-2026',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    bcrypt: {
      saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    },
    cors: {
      allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173')
        .split(',')
        .map((o) => o.trim()),
    },
    ai: {
      geminiApiKey: process.env.GEMINI_API_KEY || '',
      groqApiKey: process.env.GROQ_API_KEY || '',
      openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
      freeLlmApiKey: process.env.FREELLMAPI_API_KEY || '',
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    storage: {
      endpoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000', 10),
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
      bucket: process.env.MINIO_BUCKET || 'khanan-suraksha',
      useSSL: process.env.MINIO_USE_SSL === 'true',
    },
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    },
    smtp: {
      service: process.env.SMTP_SERVICE || '',
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || process.env.EMAIL_USER || '',
      password: process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASS || '',
      from: process.env.SMTP_FROM || '',
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      requireTls: process.env.SMTP_REQUIRE_TLS === 'true' || process.env.SMTP_PORT === '587',
    },
    seed: {
      defaultPassword: process.env.SEED_DEFAULT_PASSWORD || 'Test@1234',
    },
  };
};


