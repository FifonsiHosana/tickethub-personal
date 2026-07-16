import { AuthController } from './auth.controller.js';
import { validate } from '@/middleware/validate.js';
import { loginSchema, registerSchema } from './auth.schema.js';
import { Router } from 'express';

const router = Router();

const authController = new AuthController();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/roles', authController.getUserRoles);

export default router;
