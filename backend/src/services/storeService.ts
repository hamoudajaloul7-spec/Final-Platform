import Store from '../models/Store';

/**
 * Finds a store by its slug using the real database model
 * @param slug The store slug to search for
 * @returns The store model instance or null if not found
 */
export const findStoreBySlug = async (slug: string) => {
  try {
    return await Store.findOne({
      where: { slug }
    });
  } catch (error) {
    console.error('Error in findStoreBySlug service:', error);
    return null;
  }
};
