import Store from '../models/Store';

/**
 * Finds a store by its slug
 * @param slug The store slug to search for
 * @returns The store model instance or null if not found
 */
export const findStoreBySlug = async (slug: string) => {
  return await Store.findOne({
    where: { slug }
  });
};
