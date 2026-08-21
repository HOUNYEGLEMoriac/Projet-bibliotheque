import { Router } from 'express';
import * as returnsController from '../controllers/returns.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { role } from '../middlewares/role.middleware.js';

const router = Router();

// Historique des retours — la création se fait via POST /loans/:loanId/return
router.get('/', authMiddleware, role('admin'), returnsController.list);

export default router;
