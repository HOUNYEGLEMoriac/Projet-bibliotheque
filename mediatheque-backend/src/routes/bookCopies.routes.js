import { Router } from 'express';
import * as bookCopiesController from '../controllers/bookCopies.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { role } from '../middlewares/role.middleware.js';
import { bookCopySchema, bookCopyUpdateSchema } from '../schemas/bookCopy.schema.js';

const router = Router();

router.get('/', bookCopiesController.list);
router.get('/:id', bookCopiesController.getOne);
router.post('/', authMiddleware, role('admin'), validate(bookCopySchema), bookCopiesController.create);
router.put('/:id', authMiddleware, role('admin'), validate(bookCopyUpdateSchema), bookCopiesController.update);
router.delete('/:id', authMiddleware, role('admin'), bookCopiesController.remove);

export default router;
