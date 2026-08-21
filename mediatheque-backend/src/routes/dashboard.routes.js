import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { role } from '../middlewares/role.middleware.js';

const router = Router();

router.get('/stats', authMiddleware, role('admin'), dashboardController.stats);

export default router;
