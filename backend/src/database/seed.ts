import sequelize from '@config/database';
import logger from '@utils/logger';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import User from '@models/User';
import Store from '@models/Store';
import { UserRole } from '@shared-types/index';

const seedDatabase = async (): Promise<void> => {
  try {
    logger.info('🌱 Starting database seeding...');

    // Removed forced cleanup to prevent data loss on every restart
    /*
    try {
      const userToDelete = await User.findOne({ where: { email: 'salem.mfurjani@gmail.com' } });
      if (userToDelete) {
        await Store.destroy({ where: { merchantId: userToDelete.id } });
        await userToDelete.destroy();
        logger.info('🗑️ Forced cleanup: "Shekha" store and merchant deleted successfully');
      }
    } catch (cleanupErr) {
      logger.warn('⚠️ Cleanup skipped or failed:', cleanupErr);
    }
    */

    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminId = uuidv4();

    await User.findOrCreate({
      where: { email: 'admin@eishro.ly' },
      defaults: {
        id: adminId,
        email: 'admin@eishro.ly',
        password: adminPassword,
        firstName: 'مدير',
        lastName: 'النظام',
        phone: '+21891000000',
        role: UserRole.ADMIN,
        merchantVerified: true,
      }
    });

    const merchants = [
      {
        id: uuidv4(),
        email: 'merchant1@eishro.ly',
        password: await bcrypt.hash('merchant123', 10),
        firstName: 'أحمد',
        lastName: 'التاجر',
        phone: '+21891000001',
        storeName: 'نواعم',
        storeSlug: 'nawaem',
        storeCategory: 'ملابس نسائية',
        storeDescription: 'متجر متخصص في الملابس النسائية الأنيقة والعصرية'
      },
      {
        id: uuidv4(),
        email: 'merchant2@eishro.ly',
        password: await bcrypt.hash('merchant123', 10),
        firstName: 'فاطمة',
        lastName: 'التاجرة',
        phone: '+21891000002',
        storeName: 'شيرين',
        storeSlug: 'sheirine',
        storeCategory: 'إكسسوارات ومجوهرات',
        storeDescription: 'متجر متخصص في الإكسسوارات والمجوهرات الراقية'
      },
      {
        id: uuidv4(),
        email: 'merchant3@eishro.ly',
        password: await bcrypt.hash('merchant123', 10),
        firstName: 'علي',
        lastName: 'البائع',
        phone: '+21891000003',
        storeName: 'Pretty',
        storeSlug: 'pretty',
        storeCategory: 'عطور وجمال',
        storeDescription: 'متجر متخصص في العطور ومنتجات الجمال'
      },
      {
        id: uuidv4(),
        email: 'merchant4@eishro.ly',
        password: await bcrypt.hash('merchant123', 10),
        firstName: 'محمود',
        lastName: 'التجار',
        phone: '+21891000004',
        storeName: 'Delta Store',
        storeSlug: 'delta-store',
        storeCategory: 'إلكترونيات وأجهزة',
        storeDescription: 'متجر متخصص في الإلكترونيات والأجهزة الكهربائية'
      },
      {
        id: uuidv4(),
        email: 'merchant5@eishro.ly',
        password: await bcrypt.hash('merchant123', 10),
        firstName: 'سارة',
        lastName: 'الجمالية',
        phone: '+21891000005',
        storeName: 'Magna Beauty',
        storeSlug: 'magna-beauty',
        storeCategory: 'مستحضرات تجميل',
        storeDescription: 'متجر متخصص في مستحضرات التجميل والعناية بالبشرة'
      },
      {
        id: uuidv4(),
        email: 'salem.mfurjani@gmail.com',
        password: await bcrypt.hash('S@lem2026', 10),
        firstName: 'سالم',
        lastName: 'الفرجياني',
        phone: '+218927774442',
        storeName: 'متجر شيخة',
        storeSlug: 'shekha',
        storeCategory: 'ملابس وأزياء',
        storeDescription: 'متجر شيخة - أرقى الموديلات الفاخرة'
      }
    ];

    for (const merchant of merchants) {
      try {
        const [user] = await User.findOrCreate({
          where: { email: merchant.email },
          defaults: {
            id: merchant.id,
            email: merchant.email,
            password: merchant.password,
            firstName: merchant.firstName,
            lastName: merchant.lastName,
            phone: merchant.phone,
            role: UserRole.MERCHANT,
            storeName: merchant.storeName,
            storeSlug: merchant.storeSlug,
            storeCategory: merchant.storeCategory,
            storeDescription: merchant.storeDescription,
            merchantVerified: true,
          }
        });

        await Store.findOrCreate({
          where: { slug: merchant.storeSlug },
          defaults: {
            merchantId: user.id,
            name: merchant.storeName,
            slug: merchant.storeSlug,
            category: merchant.storeCategory,
            description: merchant.storeDescription,
            isActive: true,
          }
        });

        logger.info(`✅ Merchant and store created/verified: ${merchant.storeSlug}`);
      } catch (error) {
        logger.warn(`⚠️ Error creating merchant ${merchant.storeSlug}:`, error);
      }
    }

    // Seed sample customers
    const customers = [
      {
        id: uuidv4(),
        email: 'customer1@eishro.ly',
        password: await bcrypt.hash('customer123', 10),
        firstName: 'محمد',
        lastName: 'العميل',
        phone: '+21891000003'
      },
      {
        id: uuidv4(),
        email: 'customer2@eishro.ly',
        password: await bcrypt.hash('customer123', 10),
        firstName: 'سارة',
        lastName: 'العميلة',
        phone: '+21891000004'
      }
    ];

    for (const customer of customers) {
      await User.findOrCreate({
        where: { email: customer.email },
        defaults: {
          id: customer.id,
          email: customer.email,
          password: customer.password,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          role: UserRole.CUSTOMER,
          merchantVerified: false,
        }
      });
    }

    logger.info('✅ Database seeding completed successfully');
  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('🎉 Seeding script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Seeding script failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;
