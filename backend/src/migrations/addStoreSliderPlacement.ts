import sequelize from '@config/database';
import logger from '@utils/logger';

export async function addStoreSliderPlacement() {
  try {
    logger.info('🔄 Starting migration: adding placement column to store_sliders table...');

    const dialect = ((sequelize as any).options).dialect;

    if (dialect === 'sqlite') {
      await addStoreSliderPlacementSQLite();
    } else if (dialect === 'mysql') {
      await addStoreSliderPlacementMySQL();
    } else if (dialect === 'postgres') {
      await addStoreSliderPlacementPostgres();
    } else {
      throw new Error(`Unsupported database dialect: ${dialect}`);
    }

    logger.info('✅ Migration completed: store_sliders placement column added successfully');
    return { success: true };
  } catch (error) {
    logger.error('❌ Error during store_sliders placement migration:', error);
    throw error;
  }
}

async function addStoreSliderPlacementMySQL(): Promise<void> {
  try {
    await sequelize.query(`
      ALTER TABLE store_sliders
      ADD COLUMN IF NOT EXISTS placement VARCHAR(50) NOT NULL DEFAULT 'slider' AFTER image_path;
    `);
    logger.info('✅ Column placement added to store_sliders table (or already exists)');
  } catch (error) {
    logger.warn(`⚠️ Failed to add column placement: ${error}`);
  }
}

async function addStoreSliderPlacementSQLite(): Promise<void> {
  try {
    await sequelize.query(`
      ALTER TABLE store_sliders
      ADD COLUMN placement VARCHAR(50) NOT NULL DEFAULT 'slider';
    `);
    logger.info('✅ Column placement added to store_sliders table');
  } catch (error: any) {
    if (error.message && error.message.includes('duplicate column')) {
      logger.info('ℹ️ Column placement already exists in store_sliders table');
    } else {
      logger.warn(`⚠️ Error adding column placement: ${error.message}`);
    }
  }
}

async function addStoreSliderPlacementPostgres(): Promise<void> {
  try {
    await sequelize.query(`
      ALTER TABLE store_sliders
      ADD COLUMN IF NOT EXISTS placement VARCHAR(50) NOT NULL DEFAULT 'slider';
    `);
    logger.info('✅ Column placement added to store_sliders table (or already exists)');
  } catch (error) {
    logger.warn(`⚠️ Failed to add column placement: ${error}`);
  }
}

if (require.main === module) {
  (async () => {
    try {
      await addStoreSliderPlacement();
      logger.info('✅ Migration completed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Migration failed:', error);
      process.exit(1);
    }
  })();
}
