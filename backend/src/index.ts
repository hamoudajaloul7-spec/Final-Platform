import app from './app';
import sequelize, { testConnection, syncDatabase } from '@config/database';
import { initializeModels } from '@models/index';
import config from '@config/environment';
import logger from '@utils/logger';
import { populateSliders } from '@migrations/populateSliders';
import { fixSliderPaths } from '@migrations/fixSliderPaths';
import { addStoreAdColumns } from '@migrations/addStoreAdColumns';
import { addProductOptionColumns } from '@migrations/addProductOptionColumns';
import runMigrations from '@database/migrate';
import seedDatabase from '@database/seed';

const PORT = config.port;

logger.info(`🔖 Release: ${process.env.RENDER_GIT_COMMIT || process.env.SOURCE_VERSION || process.env.GIT_COMMIT || 'unknown'}`);

const initializeDatabase = async (): Promise<void> => {
  try {
    logger.info('🔄 Initializing database models...');
    initializeModels();

    logger.info('🔗 Testing database connection...');
    let dbConnected = false;
    try {
      dbConnected = await testConnection();
      if (!dbConnected) {
        logger.warn('⚠️ Database connection failed, continuing without database');
        return;
      }
    } catch (dbError) {
      logger.warn('⚠️ Database error:', dbError);
      return;
    }

    if (dbConnected) {
      logger.info('📊 Running database migrations...');
      try {
        await runMigrations();
      } catch (error) {
        logger.error('❌ Database migration failed, continuing with sync:', error);
      }

      logger.info('📊 Synchronizing database schema...');
      try {
        await syncDatabase(false);
      } catch (error) {
        logger.error('❌ Database sync failed, aborting initialization:', error);
        return;
      }

      logger.info('🌱 Seeding database with initial data...');
      if (config.environment === 'development' || process.env.SEED_DB === 'true') {
        try {
          await seedDatabase();
        } catch (error) {
          logger.warn('⚠️ Database seeding failed, continuing:', error);
        }
      } else {
        logger.info('ℹ️ Skipping database seeding');
      }

      logger.info('📦 Fixing slider paths and populating default sliders for existing stores...');
      try {
        await fixSliderPaths();
        await populateSliders();
      } catch (error) {
        logger.warn('⚠️ Slider migration failed, continuing:', error);
      }

      logger.info('📦 Adding missing store_ads table columns...');
      try {
        await addStoreAdColumns();
      } catch (error) {
        logger.warn('⚠️ Store ads columns migration failed, continuing:', error);
      }

      logger.info('📦 Adding product option columns (colors/sizes/availableSizes)...');
      try {
        await addProductOptionColumns();
      } catch (error) {
        logger.warn('⚠️ Product option columns migration failed, continuing:', error);
      }
    }
  } catch (error) {
    logger.error('❌ Database initialization error:', error);
  }
};

const runOneTimePurge = async (): Promise<void> => {
  try {
    const confirm = process.env.ONE_TIME_PURGE_CONFIRM === 'true';
    const slugsRaw = String(process.env.ONE_TIME_PURGE_SLUGS || '').trim();
    const emailsRaw = String(process.env.ONE_TIME_PURGE_EMAILS || '').trim();
    const token = String(process.env.ADMIN_PURGE_TOKEN || '').trim();

    if (!confirm) {
      return;
    }

    if (!token) {
      logger.warn('🧨 ONE_TIME_PURGE_CONFIRM is true but ADMIN_PURGE_TOKEN is missing');
      return;
    }

    if (!slugsRaw && !emailsRaw) {
      logger.warn('🧨 ONE_TIME_PURGE_CONFIRM is true but ONE_TIME_PURGE_SLUGS/ONE_TIME_PURGE_EMAILS are empty');
      return;
    }

    const slugs = slugsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const emails = emailsRaw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (slugs.length === 0 && emails.length === 0) {
      return;
    }

    logger.warn(`🧨 ONE_TIME_PURGE enabled for slugs: ${slugs.join(', ')} | emails: ${emails.join(', ')}`);

    try {
      initializeModels();
      await sequelize.authenticate();
    } catch {
      logger.warn('⚠️ ONE_TIME_PURGE: database not available, skipping');
      return;
    }

    const { adminPurgeStores } = await import('@controllers/storeController');

    const req: any = {
      headers: { 'x-admin-token': token },
      body: { slugs, emails },
      method: 'POST',
      path: '/api/stores/admin/purge'
    };

    const res: any = {
      headersSent: false,
      status: function () { return this; },
      json: function () { return this; }
    };

    await adminPurgeStores(req as any, res as any, (() => {}) as any);
    logger.warn('🧨 ONE_TIME_PURGE completed');
  } catch (error) {
    logger.error('❌ ONE_TIME_PURGE failed:', error);
  }
};

const startServer = (): void => {
  try {
    const server = app.listen(PORT, '0.0.0.0', (): void => {
      logger.info('🚀 Starting EISHRO Backend Server...');
      logger.info(`📡 Environment: ${config.environment}`);
      logger.info(`🔌 Port: ${PORT}`);
      logger.info(`✅ Server is running on http://0.0.0.0:${PORT}`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
      logger.info(`📚 API prefix: ${config.apiPrefix}`);
    });

    server.requestTimeout = 600000;
    server.headersTimeout = 600000;
    server.keepAliveTimeout = 65000;

    process.on('unhandledRejection', (reason: any, promise: Promise<any>): void => {
      logger.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error: Error): void => {
      logger.error('🔥 Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('SIGTERM', async (): Promise<void> => {
      logger.info('SIGTERM received, shutting down gracefully...');
      server.close(async (): Promise<void> => {
        await sequelize.close();
        logger.info('✅ Server shut down successfully');
        process.exit(0);
      });
    });

    setTimeout(() => {
      runOneTimePurge();
    }, 0);

    if (process.env.SKIP_DB_INIT !== 'true') {
      initializeDatabase();
    } else {
      logger.warn('⚠️ SKIP_DB_INIT is true, skipping database initialization');
    }
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

if (!process.env.VERCEL) {
  startServer();
}

export default app;
