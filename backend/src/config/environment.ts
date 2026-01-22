import dotenv from 'dotenv';
import path from 'path';

const env = process.env.NODE_ENV || 'development';

if (env !== 'production') {
  const envPath = path.resolve(process.cwd(), '.env');
  dotenv.config({ path: envPath });
}

export const config = {
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  apiPrefix: process.env.API_PREFIX || '/api',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'postgres',
    logging: process.env.DB_LOGGING === 'true',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret-in-production',
    expire: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
  },

  frontend: {
    development: process.env.FRONTEND_URL || 'http://localhost:5173',
    production: process.env.FRONTEND_PRODUCTION_URL || 'https://www.ishro.ly',
  },

  moamalat: {
    mid: process.env.MOAMALAT_MID || '10081014649',
    tid: process.env.MOAMALAT_TID || '99179395',
    secret: process.env.MOAMALAT_SECRET || '3a488a89b3f7993476c252f017c488bb',
    env: process.env.MOAMALAT_ENV || 'sandbox',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};

export const isDevelopment = config.environment === 'development';
export const isProduction = config.environment === 'production';
export const isTest = config.environment === 'test';

export const getFrontendUrl = (): string => {
  return isProduction ? config.frontend.production : config.frontend.development;
};

export default config;
