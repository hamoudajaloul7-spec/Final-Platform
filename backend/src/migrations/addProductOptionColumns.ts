import sequelize from '@config/database';
import logger from '@utils/logger';

export async function addProductOptionColumns() {
  try {
    logger.info('🔄 Starting migration: adding product option columns (colors/sizes/availableSizes)...');

    const dialect = ((sequelize as any).options).dialect || 'postgres';

    if (dialect === 'sqlite') {
      await addProductOptionColumnsSQLite();
    } else if (dialect === 'mysql') {
      await addProductOptionColumnsMySQL();
    } else if (dialect === 'postgres') {
      await addProductOptionColumnsPostgres();
    } else {
      throw new Error(`Unsupported database dialect: ${dialect}`);
    }

    logger.info('✅ Migration completed: product option columns added successfully');
    return { success: true };
  } catch (error) {
    logger.error('❌ Error during product option columns migration:', error);
    throw error;
  }
}

async function addProductOptionColumnsMySQL(): Promise<void> {
  const columns = [
    { name: 'colors', definition: 'JSON NULL' },
    { name: 'sizes', definition: 'JSON NULL' },
    { name: 'availableSizes', definition: 'JSON NULL' }
  ];

  for (const column of columns) {
    try {
      await sequelize.query(`
        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS ${column.name} ${column.definition};
      `);
      logger.info(`✅ Column ${column.name} added to products table (or already exists)`);
    } catch (error) {
      logger.warn(`⚠️ Failed to add column ${column.name}: ${error}`);
    }
  }
}

async function addProductOptionColumnsSQLite(): Promise<void> {
  const columnsToAdd = [
    { name: 'colors', definition: "TEXT DEFAULT '[]'" },
    { name: 'sizes', definition: "TEXT DEFAULT '[]'" },
    { name: 'availableSizes', definition: "TEXT DEFAULT '[]'" }
  ];

  for (const column of columnsToAdd) {
    try {
      await sequelize.query(`
        ALTER TABLE products
        ADD COLUMN ${column.name} ${column.definition};
      `);
      logger.info(`✅ Column ${column.name} added to products table`);
    } catch (error: any) {
      const message = String(error?.message || error);
      if (message.includes('duplicate column') || message.includes('already exists')) {
        logger.info(`ℹ️ Column ${column.name} already exists in products table`);
      } else {
        logger.warn(`⚠️ Error adding column ${column.name}: ${message}`);
      }
    }
  }
}

async function addProductOptionColumnsPostgres(): Promise<void> {
  const tableExists = await checkTableExists('products');
  if (!tableExists) {
    logger.warn('⚠️ Table products does not exist yet, skipping column additions');
    return;
  }

  const columnsToAdd = [
    { name: 'colors', definition: "JSONB DEFAULT '[]'::jsonb" },
    { name: 'sizes', definition: "JSONB DEFAULT '[]'::jsonb" },
    { name: 'availableSizes', definition: "JSONB DEFAULT '[]'::jsonb" }
  ];

  for (const col of columnsToAdd) {
    try {
      await sequelize.query(`
        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS "${col.name}" ${col.definition};
      `);
      logger.info(`✅ Column ${col.name} added to products table (or already exists)`);
    } catch (error) {
      logger.warn(`⚠️ Failed to add column ${col.name}: ${error}`);
    }
  }
}

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result: any = await sequelize.query(
      `SELECT to_regclass('public.${tableName}') as name;`,
      { raw: true }
    );
    return (result?.[0]?.[0] as any)?.name !== null;
  } catch (error) {
    logger.warn(`⚠️ Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

if (require.main === module) {
  (async () => {
    try {
      await addProductOptionColumns();
      logger.info('✅ Migration completed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Migration failed:', error);
      process.exit(1);
    }
  })();
}
