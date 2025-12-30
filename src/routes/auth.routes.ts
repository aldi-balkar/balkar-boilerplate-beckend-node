import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';
import { ssoLoginSchema, verifySSOTokenSchema } from '../validators/sso.validator';
import { registerLimiter, loginLimiter, refreshTokenLimiter } from '../middleware/rateLimiter';

const router = Router();
const authController = new AuthController();

// Manual Authentication
router.post('/register', registerLimiter, validate(registerSchema), authController.register.bind(authController));
router.post('/login', loginLimiter, validate(loginSchema), authController.login.bind(authController));
router.post('/refresh', refreshTokenLimiter, validate(refreshTokenSchema), authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));

// SSO Authentication
router.post('/sso/login', loginLimiter, validate(ssoLoginSchema), authController.ssoLogin.bind(authController));
router.post('/sso/verify', validate(verifySSOTokenSchema), authController.verifySSOToken.bind(authController));
router.get('/sso/info', authController.getSSOInfo.bind(authController));

export default router;
