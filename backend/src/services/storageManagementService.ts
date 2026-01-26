import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import logger from '@utils/logger';

const isCloudNative = Boolean(process.env.VERCEL) || process.env.CLOUD_NATIVE === 'true' || process.env.NODE_ENV === 'production';

interface StorageStats {
  totalSize: number;
  fileCount: number;
  folderSizes: Record<string, number>;
  timestamp: Date;
}

class StorageManagementService {
  private basePath: string;
  private maxStorageSize: number = 5 * 1024 * 1024 * 1024; // 5GB
  private tempCleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.basePath = process.cwd().endsWith('backend') 
      ? path.join(process.cwd(), '..') 
      : process.cwd();
  }

  async getStorageStats(): Promise<StorageStats> {
    if (isCloudNative) {
      return {
        totalSize: 0,
        fileCount: 0,
        folderSizes: { 'cloud-storage': 0 },
        timestamp: new Date()
      };
    }
    try {
      const assetsPath = path.join(this.basePath, 'backend', 'public', 'assets');
      const stats = await this.calculateFolderSize(assetsPath);
      
      return {
        totalSize: stats.size,
        fileCount: stats.fileCount,
        folderSizes: stats.folderBreakdown,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error calculating storage stats:', error);
      return {
        totalSize: 0,
        fileCount: 0,
        folderSizes: {},
        timestamp: new Date()
      };
    }
  }

  private async calculateFolderSize(
    folderPath: string, 
    folderBreakdown: Record<string, number> = {}
  ): Promise<{ size: number; fileCount: number; folderBreakdown: Record<string, number> }> {
    let totalSize = 0;
    let fileCount = 0;

    try {
      if (!fs.existsSync(folderPath)) {
        return { size: 0, fileCount: 0, folderBreakdown };
      }

      const files = await fsPromises.readdir(folderPath, { withFileTypes: true });

      for (const file of files) {
        const filePath = path.join(folderPath, file.name);
        const stats = await fsPromises.stat(filePath);

        if (file.isDirectory()) {
          const subFolderResult = await this.calculateFolderSize(filePath, folderBreakdown);
          totalSize += subFolderResult.size;
          fileCount += subFolderResult.fileCount;
          folderBreakdown[file.name] = subFolderResult.size;
        } else {
          totalSize += stats.size;
          fileCount++;
        }
      }
    } catch (error) {
      logger.error(`Error reading folder ${folderPath}:`, error);
    }

    return { size: totalSize, fileCount, folderBreakdown };
  }

  async cleanupTempUploads(maxAgeHours: number = 24): Promise<{ deletedFiles: number; freedSpace: number }> {
    if (isCloudNative) {
      return { deletedFiles: 0, freedSpace: 0 };
    }
    try {
      const tempPath = path.join(this.basePath, '.tmp-uploads');
      let deletedFiles = 0;
      let freedSpace = 0;

      if (!fs.existsSync(tempPath)) {
        return { deletedFiles, freedSpace };
      }

      const files = await fsPromises.readdir(tempPath);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(tempPath, file);
        const stats = await fsPromises.stat(filePath);
        const fileAgeHours = (now - stats.mtimeMs) / (1000 * 60 * 60);

        if (fileAgeHours > maxAgeHours) {
          try {
            await fsPromises.rm(filePath, { recursive: true, force: true });
            freedSpace += stats.size;
            deletedFiles++;
            logger.info(`Cleaned up old temp file: ${file}`);
          } catch (error) {
            logger.warn(`Failed to delete temp file ${file}:`, error);
          }
        }
      }

      logger.info(`🧹 Temp cleanup: Deleted ${deletedFiles} files, freed ${(freedSpace / 1024 / 1024).toFixed(2)}MB`);
      return { deletedFiles, freedSpace };
    } catch (error) {
      logger.error('Error during temp cleanup:', error);
      return { deletedFiles: 0, freedSpace: 0 };
    }
  }

  async startPeriodicCleanup(intervalHours: number = 12): Promise<void> {
    if (this.tempCleanupInterval) {
      clearInterval(this.tempCleanupInterval);
    }

    logger.info(`🔄 Starting periodic storage cleanup every ${intervalHours} hours`);

    this.tempCleanupInterval = setInterval(async () => {
      try {
        const result = await this.cleanupTempUploads(24);
        const stats = await this.getStorageStats();

        if (stats.totalSize > this.maxStorageSize * 0.9) {
          logger.warn(`⚠️ Storage usage is at 90% (${(stats.totalSize / 1024 / 1024 / 1024).toFixed(2)}GB)`);
          await this.aggressiveCleanup();
        }
      } catch (error) {
        logger.error('Error in periodic cleanup:', error);
      }
    }, intervalHours * 60 * 60 * 1000);
  }

  private async aggressiveCleanup(): Promise<void> {
    if (isCloudNative) return;
    try {
      const assetsPath = path.join(this.basePath, 'backend', 'public', 'assets');
      const stores = await fsPromises.readdir(assetsPath, { withFileTypes: true });
      const now = Date.now();

      for (const store of stores) {
        if (!store.isDirectory()) continue;

        const productsPath = path.join(assetsPath, store.name, 'products');
        
        if (fs.existsSync(productsPath)) {
          const images = await fsPromises.readdir(productsPath);
          
          for (const image of images) {
            const imagePath = path.join(productsPath, image);
            const stats = await fsPromises.stat(imagePath);
            const ageMonths = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24 * 30);

            if (ageMonths > 12) {
              await fsPromises.rm(imagePath, { recursive: true, force: true });
              logger.info(`Removed old image: ${store.name}/${image}`);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error in aggressive cleanup:', error);
    }
  }

  async stopPeriodicCleanup(): Promise<void> {
    if (this.tempCleanupInterval) {
      clearInterval(this.tempCleanupInterval);
      this.tempCleanupInterval = null;
      logger.info('Periodic cleanup stopped');
    }
  }

  async getStorageHealth(): Promise<{ status: 'healthy' | 'warning' | 'critical'; percentage: number; message: string }> {
    if (isCloudNative) {
      return { status: 'healthy', percentage: 0, message: 'Cloud storage managed externally' };
    }
    const stats = await this.getStorageStats();
    const percentage = (stats.totalSize / this.maxStorageSize) * 100;

    if (percentage < 70) {
      return { status: 'healthy', percentage, message: 'Storage usage is normal' };
    } else if (percentage < 90) {
      return { status: 'warning', percentage, message: 'Storage usage is getting high' };
    } else {
      return { status: 'critical', percentage, message: 'Storage usage is critical' };
    }
  }
}

export default new StorageManagementService();
