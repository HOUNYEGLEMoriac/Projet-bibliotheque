import { Router } from 'express';
import * as penaltiesController from '../controllers/penalties.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { role } from '../middlewares/role.middleware.js';
import { updatePenaltyStatusSchema } from '../schemas/penalty.schema.js';

const router = Router();

router.use(authMiddleware);

router.get('/', penaltiesController.list);
router.put('/:id', role('admin'), validate(updatePenaltyStatusSchema), penaltiesController.updateStatus);

export default router;
