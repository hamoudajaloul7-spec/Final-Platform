import { Router, Request, Response, NextFunction } from 'express';
import * as authController from '@controllers/authController';
import { authenticate } from '@middleware/auth';
import { validate } from '@middleware/validation';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '@validators/authValidator';

const router = Router();

router.post(
  '/register',
  (req: Request, res: Response, next: NextFunction) => validate(registerSchema)(req, res, next),
  authController.register
);

router.post(
  '/login',
  (req: Request, res: Response, next: NextFunction) => validate(loginSchema)(req, res, next),
  authController.login
);

router.post(
  '/refresh',
  (req: Request, res: Response, next: NextFunction) => validate(refreshTokenSchema)(req, res, next),
  authController.refreshToken
);

router.get('/profile', authenticate, authController.getProfile);

router.post('/verify', authController.verifyUser);

router.post('/logout', authenticate, authController.logout);

export default router;
