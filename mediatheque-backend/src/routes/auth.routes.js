import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { role } from '../middlewares/role.middleware.js';
import { registerSchema, loginSchema, createAdminSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.me);

// Seul un admin déjà authentifié peut créer un autre admin
router.post(
  '/admins',
  authMiddleware,
  role('admin'),
  validate(createAdminSchema),
  authController.createAdmin
);

export default router;
