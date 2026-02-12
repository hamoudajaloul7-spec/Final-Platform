import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '@shared-types/index';
import User from '@models/User';
import { hashPassword, comparePassword, validatePasswordStrength } from '@utils/password';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '@utils/jwt';
import { sendSuccess, sendCreated, sendError, sendUnauthorized, sendNotFound } from '@utils/response';
import { generateUUID, slugify, validateEmail } from '@utils/helpers';
import logger, { logLoginAttempt, logStoreCreation } from '@utils/logger';

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, role = UserRole.CUSTOMER, storeName, storeCategory, storeDescription } = req.body;

    if (!validateEmail(email)) {
      sendError(res, 'Invalid email format', 400, 'INVALID_EMAIL');
      return;
    }

    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      sendError(res, 'Email already registered', 409, 'EMAIL_EXISTS');
      return;
    }

    const passwordStrength = validatePasswordStrength(password);
    if (!passwordStrength.valid) {
      sendError(res, 'Password does not meet security requirements', 400, 'WEAK_PASSWORD', {
        requirements: passwordStrength.errors,
      });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const userId = generateUUID();
    let storeSlug: string | undefined;

    if (role === UserRole.MERCHANT && storeName) {
      storeSlug = slugify(storeName);
      const existingSlug = await User.findOne({ where: { storeSlug } });
      if (existingSlug) {
        storeSlug = `${storeSlug}-${Date.now()}`;
      }
    }

    const newUser = await User.create({
      id: userId,
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone,
      role,
      storeName: storeName?.trim(),
      storeSlug,
      storeCategory,
      storeDescription,
      merchantVerified: false,
    });


    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });
    const refreshToken = generateRefreshToken(newUser.id);

    logger.info(`User registered: ${email} (${role})`);
    if (role === UserRole.MERCHANT) {
      logStoreCreation(newUser, 'self-registration');
    }

    const userData = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone,
      role: newUser.role,
      ...(role === UserRole.MERCHANT && {
        storeName: newUser.storeName,
        storeSlug: newUser.storeSlug,
        storeCategory: newUser.storeCategory,
      }),
    };

    sendCreated(res, {
      user: userData,
      token,
      refreshToken,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    logger.info(`[AUTH] Login attempt for email: ${email}`);

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    
    if (!user) {
      logger.warn(`[AUTH] User not found: ${email}`);
      logLoginAttempt(email, false, 'password');
      // Use 404 to allow frontend to show "Email not registered"
      sendNotFound(res, 'البريد الإلكتروني غير مسجل في النظام');
      return;
    }

    logger.info(`[AUTH] User found: ${user.email}, role: ${user.role}, storeSlug: ${user.storeSlug}`);

    // التحقق من كلمة المرور
    let isPasswordValid = await comparePassword(password, user.password);
    
    logger.info(`[AUTH] Password valid (hash check): ${isPasswordValid}`);

    // إذا لم تتطابق، تحقق مما إذا كانت كلمة المرور مخزنة كنص واضح (للتوافق مع البيانات القديمة)
    if (!isPasswordValid && user.password === password) {
      logger.info(`[AUTH] Plain text password detected, updating to hash...`);
      // تحديث كلمة المرور لتكون مشفرة
      const hashedPassword = await hashPassword(password);
      await user.update({ password: hashedPassword });
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      logger.warn(`[AUTH] Invalid password for user: ${email}`);
      logLoginAttempt(email, false, 'password');
      // Use 401 for invalid password
      sendUnauthorized(res, 'كلمة المرور غير صحيحة');
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken(user.id);

    await user.update({ lastLogin: new Date() });

    logger.info(`[AUTH] Login successful for: ${email}`);
    logLoginAttempt(email, true, 'password');

    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      ...(user.role === UserRole.MERCHANT && {
        storeName: user.storeName,
        storeSlug: user.storeSlug,
        storeCategory: user.storeCategory,
        merchantVerified: user.merchantVerified,
      }),
    };

    sendSuccess(
      res,
      {
        user: userData,
        token,
        refreshToken,
      },
      200,
      'Login successful'
    );
  } catch (error) {
    logger.error('[AUTH] Login error:', error);
    next(error);
  }
};

export const refreshToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: tokenFromBody } = req.body;

    if (!tokenFromBody) {
      sendUnauthorized(res, 'Refresh token is required');
      return;
    }

    const decoded = verifyRefreshToken(tokenFromBody);
    if (!decoded) {
      sendUnauthorized(res, 'Invalid or expired refresh token');
      return;
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      sendUnauthorized(res, 'User not found');
      return;
    }

    const newAccessToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    const newRefreshToken = generateRefreshToken(user.id);

    logger.info(`Token refreshed for user: ${user.email}`);

    sendSuccess(res, {
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    next(error);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendUnauthorized(res, 'User not authenticated');
      return;
    }

    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ['password'],
      },
    });

    if (!user) {
      sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
      return;
    }

    sendSuccess(res, user);
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

export const verifyUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      sendError(res, 'Email is required', 400);
      return;
    }

    const user = await User.findOne({ 
      where: { email: email.toLowerCase() },
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      sendNotFound(res, 'المستخدم غير موجود');
      return;
    }

    sendSuccess(res, {
      user,
      isValid: true,
      lastUpdated: user.updatedAt
    });
  } catch (error) {
    logger.error('User verification error:', error);
    sendError(res, 'فشل التحقق من المستخدم', 500);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendUnauthorized(res, 'User not authenticated');
      return;
    }

    logger.info(`User logged out: ${req.user.email}`);
    sendSuccess(res, null, 200, 'Logged out successfully');
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};
