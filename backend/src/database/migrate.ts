import sequelize from '@config/database';
import logger from '@utils/logger';

const dialect = (sequelize as any).getDialect
  ? (sequelize as any).getDialect()
  : ((sequelize as any).options?.dialect as string);

const createTables = async (): Promise<void> => {
  try {
    if (dialect === 'mysql') {
      await createTablesMySQL();
    } else if (dialect === 'sqlite') {
      await createTablesSQLite();
    } else {
      logger.info(`ℹ️ Skipping legacy SQL table creation for dialect: ${dialect}`);
      return;
    }

    logger.info('✅ All database tables created successfully');
  } catch (error) {
    logger.error('❌ Error creating database tables:', error);
    throw error;
  }
};

const createTablesMySQL = async (): Promise<void> => {
  // Users table
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      role ENUM('customer', 'merchant', 'admin') DEFAULT 'customer',
      store_name VARCHAR(255),
      store_slug VARCHAR(255) UNIQUE,
      store_category VARCHAR(100),
      store_description TEXT,
      store_logo VARCHAR(500),
      merchant_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      last_login TIMESTAMP NULL,
      KEY idx_email (email),
      KEY idx_role (role),
      KEY idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS stores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      merchant_id VARCHAR(36) NOT NULL,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      category VARCHAR(100) NOT NULL,
      description TEXT,
      logo VARCHAR(500),
      banner VARCHAR(500),
      is_active BOOLEAN DEFAULT TRUE,
      rating DECIMAL(3, 1),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_stores_merchant FOREIGN KEY (merchant_id) REFERENCES users(id) ON DELETE CASCADE,
      KEY idx_merchant_id (merchant_id),
      KEY idx_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS store_sliders (
      id VARCHAR(36) PRIMARY KEY,
      store_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(512),
      button_text VARCHAR(128),
      image_path VARCHAR(1024) NOT NULL,
      placement VARCHAR(50) NOT NULL DEFAULT 'slider',
      sort_order INT NOT NULL DEFAULT 0,
      metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_store_sliders_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
      KEY idx_store_id (store_id),
      KEY idx_sort_order (sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS store_ads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      store_id INT NOT NULL,
      template_id VARCHAR(50) NOT NULL,
      title VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      image_url VARCHAR(500),
      link_url VARCHAR(500),
      placement ENUM('banner', 'between_products') NOT NULL DEFAULT 'banner',
      text_position ENUM('top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right') DEFAULT 'center',
      text_color VARCHAR(7) DEFAULT '#ffffff',
      text_font VARCHAR(50) DEFAULT 'Cairo-SemiBold',
      main_text_size ENUM('sm', 'base', 'lg', 'xl', '2xl') DEFAULT 'lg',
      sub_text_size ENUM('xs', 'sm', 'base') DEFAULT 'base',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_store_ads_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
      KEY idx_store_id (store_id),
      KEY idx_is_active (is_active),
      KEY idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 3) NOT NULL,
      category VARCHAR(100) NOT NULL,
      brand VARCHAR(100),
      image VARCHAR(500),
      thumbnail VARCHAR(500),
      store_id INT,
      in_stock BOOLEAN DEFAULT TRUE,
      quantity INT DEFAULT 0,
      sku VARCHAR(100),
      rating DECIMAL(3, 1),
      review_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_products_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL,
      KEY idx_category (category),
      KEY idx_store_id (store_id),
      KEY idx_created_at (created_at),
      KEY idx_in_stock (in_stock),
      FULLTEXT idx_name_description (name, description)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(36) PRIMARY KEY,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      customer_id VARCHAR(36),
      customer_first_name VARCHAR(100) NOT NULL,
      customer_last_name VARCHAR(100) NOT NULL,
      customer_phone VARCHAR(20) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_address TEXT NOT NULL,
      customer_city VARCHAR(100) NOT NULL,
      customer_area VARCHAR(100) NOT NULL,
      location_latitude DECIMAL(10, 8),
      location_longitude DECIMAL(11, 8),
      location_accuracy INT,
      location_address TEXT,
      subtotal DECIMAL(10, 3) NOT NULL,
      discount_amount DECIMAL(10, 3) DEFAULT 0,
      discount_percentage INT DEFAULT 0,
      shipping_cost DECIMAL(10, 3) NOT NULL,
      final_total DECIMAL(10, 3) NOT NULL,
      coupon_code VARCHAR(50),
      shipping_type ENUM('normal', 'express') DEFAULT 'normal',
      shipping_estimated_time VARCHAR(50),
      payment_method ENUM('onDelivery', 'immediate') NOT NULL,
      payment_type VARCHAR(50),
      transaction_id VARCHAR(255),
      payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
      order_status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      shipped_at TIMESTAMP NULL,
      delivered_at TIMESTAMP NULL,
      CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
      KEY idx_order_number (order_number),
      KEY idx_customer_id (customer_id),
      KEY idx_status (order_status),
      KEY idx_payment_status (payment_status),
      KEY idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id VARCHAR(36) NOT NULL,
      product_id INT NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      product_price DECIMAL(10, 3) NOT NULL,
      product_image VARCHAR(500),
      size VARCHAR(50),
      color VARCHAR(50),
      quantity INT NOT NULL,
      line_total DECIMAL(10, 3) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
      KEY idx_order_id (order_id),
      KEY idx_product_id (product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      discount_percentage INT NOT NULL,
      discount_amount DECIMAL(10, 3),
      min_order_amount DECIMAL(10, 3),
      max_order_amount DECIMAL(10, 3),
      max_uses INT,
      current_uses INT DEFAULT 0,
      max_uses_per_user INT DEFAULT 1,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NULL,
      KEY idx_code (code),
      KEY idx_active (is_active),
      KEY idx_expires_at (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS user_addresses (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      city VARCHAR(100) NOT NULL,
      area VARCHAR(100) NOT NULL,
      address TEXT NOT NULL,
      phone VARCHAR(20) NOT NULL,
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      KEY idx_user_id (user_id),
      KEY idx_is_default (is_default)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id VARCHAR(36) PRIMARY KEY,
      order_id VARCHAR(36) NOT NULL,
      transaction_id VARCHAR(255) UNIQUE,
      amount DECIMAL(10, 3) NOT NULL,
      currency VARCHAR(3) DEFAULT 'LYD',
      gateway ENUM('moamalat', 'fawry', 'paypal') NOT NULL,
      gateway_response LONGTEXT,
      status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
      secure_hash VARCHAR(255),
      merchant_reference VARCHAR(255),
      system_reference VARCHAR(255),
      network_reference VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL,
      CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      KEY idx_order_id (order_id),
      KEY idx_transaction_id (transaction_id),
      KEY idx_status (status),
      KEY idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      alt_text VARCHAR(255),
      sort_order INT DEFAULT 0,
      is_primary BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      KEY idx_product_id (product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
};

const createTablesSQLite = async (): Promise<void> => {
  // Users table
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      role TEXT DEFAULT 'customer',
      store_name VARCHAR(255),
      store_slug VARCHAR(255) UNIQUE,
      store_category VARCHAR(100),
      store_description TEXT,
      store_logo VARCHAR(500),
      merchant_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME NULL
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      merchant_id VARCHAR(36) NOT NULL,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      category VARCHAR(100) NOT NULL,
      description TEXT,
      logo VARCHAR(500),
      banner VARCHAR(500),
      is_active INTEGER DEFAULT 1,
      rating DECIMAL(3, 1),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS store_sliders (
      id VARCHAR(36) PRIMARY KEY,
      store_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(512),
      button_text VARCHAR(128),
      image_path VARCHAR(1024) NOT NULL,
      placement VARCHAR(50) NOT NULL DEFAULT 'slider',
      sort_order INT NOT NULL DEFAULT 0,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS store_ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INT NOT NULL,
      template_id VARCHAR(50) NOT NULL,
      title VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      image_url VARCHAR(500),
      link_url VARCHAR(500),
      placement TEXT NOT NULL DEFAULT 'banner',
      text_position TEXT DEFAULT 'center',
      text_color VARCHAR(7) DEFAULT '#ffffff',
      text_font VARCHAR(50) DEFAULT 'Cairo-SemiBold',
      main_text_size TEXT DEFAULT 'lg',
      sub_text_size TEXT DEFAULT 'base',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 3) NOT NULL,
      category VARCHAR(100) NOT NULL,
      brand VARCHAR(100),
      image VARCHAR(500),
      thumbnail VARCHAR(500),
      store_id INT,
      in_stock INTEGER DEFAULT 1,
      quantity INT DEFAULT 0,
      sku VARCHAR(100),
      rating DECIMAL(3, 1),
      review_count INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(36) PRIMARY KEY,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      customer_id VARCHAR(36),
      customer_first_name VARCHAR(100) NOT NULL,
      customer_last_name VARCHAR(100) NOT NULL,
      customer_phone VARCHAR(20) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_address TEXT NOT NULL,
      customer_city VARCHAR(100) NOT NULL,
      customer_area VARCHAR(100) NOT NULL,
      location_latitude DECIMAL(10, 8),
      location_longitude DECIMAL(11, 8),
      location_accuracy INT,
      location_address TEXT,
      subtotal DECIMAL(10, 3) NOT NULL,
      discount_amount DECIMAL(10, 3) DEFAULT 0,
      discount_percentage INT DEFAULT 0,
      shipping_cost DECIMAL(10, 3) NOT NULL,
      final_total DECIMAL(10, 3) NOT NULL,
      coupon_code VARCHAR(50),
      shipping_type TEXT DEFAULT 'normal',
      shipping_estimated_time VARCHAR(50),
      payment_method TEXT NOT NULL,
      payment_type VARCHAR(50),
      transaction_id VARCHAR(255),
      payment_status TEXT DEFAULT 'pending',
      order_status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      shipped_at DATETIME NULL,
      delivered_at DATETIME NULL
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id VARCHAR(36) NOT NULL,
      product_id INT NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      product_price DECIMAL(10, 3) NOT NULL,
      product_image VARCHAR(500),
      size VARCHAR(50),
      color VARCHAR(50),
      quantity INT NOT NULL,
      line_total DECIMAL(10, 3) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      discount_percentage INT NOT NULL,
      discount_amount DECIMAL(10, 3),
      min_order_amount DECIMAL(10, 3),
      max_order_amount DECIMAL(10, 3),
      max_uses INT,
      current_uses INT DEFAULT 0,
      max_uses_per_user INT DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NULL
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS user_addresses (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      city VARCHAR(100) NOT NULL,
      area VARCHAR(100) NOT NULL,
      address TEXT NOT NULL,
      phone VARCHAR(20) NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id VARCHAR(36) PRIMARY KEY,
      order_id VARCHAR(36) NOT NULL,
      transaction_id VARCHAR(255) UNIQUE,
      amount DECIMAL(10, 3) NOT NULL,
      currency VARCHAR(3) DEFAULT 'LYD',
      gateway TEXT NOT NULL,
      gateway_response TEXT,
      status TEXT DEFAULT 'pending',
      secure_hash VARCHAR(255),
      merchant_reference VARCHAR(255),
      system_reference VARCHAR(255),
      network_reference VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME NULL
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INT NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      alt_text VARCHAR(255),
      sort_order INT DEFAULT 0,
      is_primary INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

// Add missing columns to existing tables
const addMissingColumns = async (): Promise<void> => {
  try {
    logger.info('🔄 Checking for missing columns...');
    
    // Add is_available column to products table if it doesn't exist
    try {
      if (dialect === 'mysql') {
        await sequelize.query(`
          ALTER TABLE products
          ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE
        `);
      } else if (dialect === 'postgres') {
        await sequelize.query(`
          ALTER TABLE products
          ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE
        `);
      } else if (dialect === 'sqlite') {
        // SQLite doesn't support IF NOT EXISTS for columns, we'll handle this differently
        const [results]: any = await sequelize.query(
          `PRAGMA table_info(products)`
        );
        const hasIsAvailable = results.some((col: any) => col.name === 'is_available');
        if (!hasIsAvailable) {
          await sequelize.query(`
            ALTER TABLE products
            ADD COLUMN is_available INTEGER DEFAULT 1
          `);
        }
      }
      logger.info('✅ is_available column added/verified in products table');
    } catch (error) {
      logger.warn('⚠️ Could not add is_available column (may already exist):', error);
    }
    
    // Add images column to products table if it doesn't exist
    try {
      if (dialect === 'mysql') {
        await sequelize.query(`
          ALTER TABLE products
          ADD COLUMN IF NOT EXISTS images JSON
        `);
      } else if (dialect === 'postgres') {
        await sequelize.query(`
          ALTER TABLE products
          ADD COLUMN IF NOT EXISTS images JSONB
        `);
      } else if (dialect === 'sqlite') {
        const [results]: any = await sequelize.query(
          `PRAGMA table_info(products)`
        );
        const hasImages = results.some((col: any) => col.name === 'images');
        if (!hasImages) {
          await sequelize.query(`
            ALTER TABLE products
            ADD COLUMN images TEXT
          `);
        }
      }
      logger.info('✅ images column added/verified in products table');
    } catch (error) {
      logger.warn('⚠️ Could not add images column (may already exist):', error);
    }
    
    // Add colors column to products table if it doesn't exist
    try {
      if (dialect === 'mysql') {
        await sequelize.query(`
          ALTER TABLE products
          ADD COLUMN IF NOT EXISTS colors JSON
        `);
      } else if (dialect === 'postgres') {
        await sequelize.query(`
          ALTER TABLE products
          ADD COLUMN IF NOT EXISTS colors JSONB
        `);
      } else if (dialect === 'sqlite') {
        const [results]: any = await sequelize.query(
          `PRAGMA table_info(products)`
        );
        const hasColors = results.some((col: any) => col.name === 'colors');
        if (!hasColors) {
          await sequelize.query(`
            ALTER TABLE products
            ADD COLUMN colors TEXT
          `);
        }
      }
      logger.info('✅ colors column added/verified in products table');
    } catch (error) {
      logger.warn('⚠️ Could not add colors column (may already exist):', error);
    }
    
    // Add sizes column to products table if it doesn't exist
    try {
      if (dialect === 'mysql') {
        await sequelize.query(`
          ALTER TABLE products
          ADD COLUMN IF NOT EXISTS sizes JSON
        `);
      } else if (dialect === 'postgres') {
        await sequelize.query(`
          ALTER TABLE products
          ADD COLUMN IF NOT EXISTS sizes JSONB
        `);
      } else if (dialect === 'sqlite') {
        const [results]: any = await sequelize.query(
          `PRAGMA table_info(products)`
        );
        const hasSizes = results.some((col: any) => col.name === 'sizes');
        if (!hasSizes) {
          await sequelize.query(`
            ALTER TABLE products
            ADD COLUMN sizes TEXT
          `);
        }
      }
      logger.info('✅ sizes column added/verified in products table');
    } catch (error) {
      logger.warn('⚠️ Could not add sizes column (may already exist):', error);
    }
    
    // Add available_sizes column to products table if it doesn't exist
    try {
      if (dialect === 'mysql') {
        await sequelize.query(`
          ALTER TABLE products
          ADD COLUMN IF NOT EXISTS available_sizes JSON
        `);
      } else if (dialect === 'postgres') {
        await sequelize.query(`
          ALTER TABLE products
          ADD COLUMN IF NOT EXISTS available_sizes JSONB
        `);
      } else if (dialect === 'sqlite') {
        const [results]: any = await sequelize.query(
          `PRAGMA table_info(products)`
        );
        const hasAvailableSizes = results.some((col: any) => col.name === 'available_sizes');
        if (!hasAvailableSizes) {
          await sequelize.query(`
            ALTER TABLE products
            ADD COLUMN available_sizes TEXT
          `);
        }
      }
      logger.info('✅ available_sizes column added/verified in products table');
    } catch (error) {
      logger.warn('⚠️ Could not add available_sizes column (may already exist):', error);
    }
    
    // Add tags column to products table if it doesn't exist
    try {
      if (dialect === 'mysql') {
        await sequelize.query(`
          ALTER TABLE products
          ADD COLUMN IF NOT EXISTS tags JSON
        `);
      } else if (dialect === 'postgres') {
        await sequelize.query(`
          ALTER TABLE products
          ADD COLUMN IF NOT EXISTS tags JSONB
        `);
      } else if (dialect === 'sqlite') {
        const [results]: any = await sequelize.query(
          `PRAGMA table_info(products)`
        );
        const hasTags = results.some((col: any) => col.name === 'tags');
        if (!hasTags) {
          await sequelize.query(`
            ALTER TABLE products
            ADD COLUMN tags TEXT
          `);
        }
      }
      logger.info('✅ tags column added/verified in products table');
    } catch (error) {
      logger.warn('⚠️ Could not add tags column (may already exist):', error);
    }
    
    logger.info('✅ Missing columns check completed');
  } catch (error) {
    logger.error('❌ Error adding missing columns:', error);
    // Don't throw - continue with migration
  }
};

const runMigrations = async (): Promise<void> => {
  try {
    logger.info('🚀 Starting database migration...');

    const { testConnection } = await import('@config/database');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    await createTables();
    await addMissingColumns();

    logger.info('✅ Database migration completed successfully');
  } catch (error) {
    logger.error('❌ Database migration failed:', error);
    throw error;
  }
};

if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('🎉 Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

export default runMigrations;
