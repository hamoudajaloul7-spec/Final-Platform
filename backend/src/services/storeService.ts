import Store from '../models/Store';
import logger from '@utils/logger';

/**
 * Finds a store by its slug using the real database model (Sequelize/PostgreSQL)
 * This connects to Supabase when DATABASE_URL is provided in environment variables.
 * @param slug The store slug to search for
 * @returns The store model instance or null if not found
 */
export const findStoreBySlug = async (slug: string) => {
  try {
    return await Store.findOne({
      where: { slug }
    });
  } catch (error) {
    logger.error('Error in findStoreBySlug service:', error);
    return null;
  }
};
