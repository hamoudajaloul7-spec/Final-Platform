import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { Request, Response, NextFunction } from 'express';
import logger from '@utils/logger';
import memoryMonitoringService from '@services/memoryMonitoringService';

interface UploadConfig {
  maxFileSize: number;
  maxTotalSize: number;
  maxFiles: number;
  memoryThreshold: number; // percentage
}

const defaultConfig: UploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB per file
  maxTotalSize: 50 * 1024 * 1024, // 50MB total
  maxFiles: 500,
  memoryThreshold: 0.7 // 70% of heap
};

class OptimizedUploadMiddleware {
  private uploadSessions: Map<string, { size: number; fileCount: number; startTime: Date }> = new Map();

  async validateUploadSize(req: Request, config: UploadConfig = defaultConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const memUsage = process.memoryUsage();
      const heapUsagePercent = memUsage.heapUsed / memUsage.heapTotal;

      if (heapUsagePercent > config.memoryThreshold) {
        return {
          valid: false,
          error: `Server memory usage is too high (${(heapUsagePercent * 100).toFixed(1)}%). Please try again later.`
        };
      }

      const contentLength = parseInt(req.headers['content-length'] || '0', 10);

      if (contentLength > config.maxTotalSize) {
        return {
          valid: false,
          error: `Upload size (${(contentLength / 1024 / 1024).toFixed(2)}MB) exceeds maximum (${(config.maxTotalSize / 1024 / 1024).toFixed(2)}MB)`
        };
      }

      return { valid: true };
    } catch (error) {
      logger.error('Error validating upload size:', error);
      return { valid: false, error: 'Failed to validate upload size' };
    }
  }

  createOptimizedUpload(config: UploadConfig = defaultConfig) {
    const storage = multer.memoryStorage();

    return multer({
      storage,
      limits: {
        fileSize: config.maxFileSize,
        files: config.maxFiles
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg', 'image/png', 'image/webp', 'image/gif',
          'image/avif', 'image/tiff', 'image/bmp', 'image/svg+xml'
        ];

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Unsupported file type: ${file.mimetype}`));
        }
      }
    });
  }

  uploadMiddlewareWithValidation(
    fieldName: string,
    maxCount: number,
    config: UploadConfig = defaultConfig
  ) {
    const upload = this.createOptimizedUpload(config);
    const uploader = upload.array(fieldName, maxCount);

    return async (req: Request, res: Response, next: NextFunction) => {
      const sessionId = `${req.ip}-${Date.now()}`;
      
      try {
        const validation = await this.validateUploadSize(req, config);
        if (!validation.valid) {
          return res.status(413).json({ 
            success: false, 
            error: validation.error 
          });
        }

        this.uploadSessions.set(sessionId, {
          size: 0,
          fileCount: 0,
          startTime: new Date()
        });

        memoryMonitoringService.trackConnection(sessionId, `Upload: ${fieldName}`);

        const timeout = setTimeout(() => {
          if (!res.headersSent) {
            res.status(408).json({ 
              success: false, 
              error: 'Upload timeout - request took too long' 
            });
          }
          memoryMonitoringService.releaseConnection(sessionId);
          this.uploadSessions.delete(sessionId);
        }, 600000); // 10 minutes

        uploader(req, res, (err: any) => {
          clearTimeout(timeout);

          if (err) {
            logger.error(`Upload error for ${fieldName}:`, err);
            memoryMonitoringService.releaseConnection(sessionId);
            this.uploadSessions.delete(sessionId);

            if (!res.headersSent) {
              if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({
                  success: false,
                  error: `File size exceeds ${(config.maxFileSize / 1024 / 1024).toFixed(0)}MB limit`
                });
              }
              if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(413).json({
                  success: false,
                  error: `Cannot upload more than ${config.maxFiles} files`
                });
              }
              return res.status(400).json({
                success: false,
                error: err.message || 'Upload failed'
              });
            }
            return;
          }

          const session = this.uploadSessions.get(sessionId);
          if (session && req.files) {
            session.fileCount = (req.files as Express.Multer.File[]).length;
            session.size = (req.files as Express.Multer.File[]).reduce((sum, f) => sum + f.size, 0);

            const duration = new Date().getTime() - session.startTime.getTime();
            logger.info(
              `✅ Upload completed: ${session.fileCount} files, ` +
              `${(session.size / 1024 / 1024).toFixed(2)}MB in ${(duration / 1000).toFixed(1)}s`
            );
          }

          memoryMonitoringService.releaseConnection(sessionId);
          this.uploadSessions.delete(sessionId);
          next();
        });
      } catch (error) {
        logger.error('Error in upload middleware:', error);
        memoryMonitoringService.releaseConnection(sessionId);
        this.uploadSessions.delete(sessionId);

        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Internal server error during upload'
          });
        }
      }
    };
  }

  getUploadSessions(): Array<{ id: string; size: number; fileCount: number; duration: number }> {
    return Array.from(this.uploadSessions.entries()).map(([id, data]) => ({
      id,
      size: data.size,
      fileCount: data.fileCount,
      duration: new Date().getTime() - data.startTime.getTime()
    }));
  }

}


export default new OptimizedUploadMiddleware();
