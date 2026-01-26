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

export default logger;
