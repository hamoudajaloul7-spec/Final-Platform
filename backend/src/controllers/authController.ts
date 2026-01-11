import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '@shared-types/index';
import User from '@models/User';
import { hashPassword, comparePassword, validatePasswordStrength } from '@utils/password';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '@utils/jwt';
import { sendSuccess, sendCreated, sendError, sendUnauthorized } from '@utils/response';
import { generateUUID, slugify, validateEmail } from '@utils/helpers';
import logger from '@utils/logger';

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

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      sendUnauthorized(res, 'Invalid email or password');
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      sendUnauthorized(res, 'Invalid email or password');
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken(user.id);

    await user.update({ lastLogin: new Date() });

    logger.info(`User logged in: ${email}`);

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
    logger.error('Login error:', error);
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
