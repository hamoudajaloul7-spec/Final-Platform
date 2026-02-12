import winston from 'winston';
import fs from 'fs';
import path from 'path';
import config from '@config/environment';

const isVercel = Boolean(process.env.VERCEL);
const isCloudNative = isVercel || process.env.CLOUD_NATIVE === 'true' || process.env.NODE_ENV === 'production';
const logsDir = path.dirname(config.logging.file);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}] ${message}${stack ? '\n' + stack : ''}`;
  })
);

const transports: winston.transport[] = [
  new winston.transports.Console({ format }),
];

if (!isCloudNative) {
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    transports.push(
      new winston.transports.File({ filename: config.logging.file })
    );
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
      })
    );
  } catch (error) {
    console.error('Failed to create log files:', error);
  }
}

const logger = winston.createLogger({
  level: config.logging.level,
  format,
  transports,
});

export const logStoreCreation = (storeData: any, createdBy: string) => {
  logger.info(`[STORE_CREATION] New store created: ${storeData.name || storeData.storeName} by ${createdBy}`, {
    storeId: storeData.id || storeData.storeId,
    email: storeData.email || storeData.ownerEmail,
    subdomain: storeData.subdomain || storeData.storeSlug,
    isAutomated: storeData.isAutomated || false,
    timestamp: new Date().toISOString()
  });
};

export const logLoginAttempt = (email: string, success: boolean, method: string) => {
  logger.info(`[LOGIN_ATTEMPT] ${email} - ${success ? 'SUCCESS' : 'FAILED'} via ${method}`, {
    email,
    success,
    method,
    timestamp: new Date().toISOString()
  });
};

export default logger;
