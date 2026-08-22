import { Router } from 'express';
import * as membersController from '../controllers/members.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { role } from '../middlewares/role.middleware.js';
import {
  updateMemberProfileSchema,
  updateMemberStatusSchema,
  memberQuerySchema,
} from '../schemas/member.schema.js';

const router = Router();

router.use(authMiddleware);

router.get('/', role('admin'), validate(memberQuerySchema, { target: 'query' }), membersController.list);
router.get('/:id', membersController.getOne);
router.put('/:id', validate(updateMemberProfileSchema), membersController.updateProfile);
router.patch(
  '/:id/status',
  role('admin'),
  validate(updateMemberStatusSchema),
  membersController.updateStatus
);

export default router;
