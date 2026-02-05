import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerValidation, loginValidation } from '../validations/auth.validation';

const router = Router();

router.post('/register', validate(registerValidation), authController.register.bind(authController));
router.post('/login', validate(loginValidation), authController.login.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.get('/profile', authenticate, authController.getProfile.bind(authController));

export default router;

