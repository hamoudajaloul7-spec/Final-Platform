import Store from '../models/Store';
import User from '../models/User';
import { Op } from 'sequelize';
import logger from '@utils/logger';

/**
 * Finds a store by its slug
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

/**
 * Finds a store by its name
 * @param name The store name to search for
 * @returns The store model instance or null if not found
 */
export const findStoreByName = async (name: string) => {
  try {
    return await Store.findOne({
      where: { name }
    });
  } catch (error) {
    logger.error('Error in findStoreByName service:', error);
    return null;
  }
};

/**
 * Finds users by their emails
 * @param emails Array of emails to search for
 * @returns Array of user model instances
 */
export const findUsersByEmails = async (emails: string[]) => {
  try {
    return await User.findAll({
      where: {
        email: {
          [Op.in]: emails.filter(Boolean)
        }
      }
    });
  } catch (error) {
    logger.error('Error in findUsersByEmails service:', error);
    return [];
  }
};
