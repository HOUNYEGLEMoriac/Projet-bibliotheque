import { Router } from 'express';
import * as categoriesController from '../controllers/categories.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { role } from '../middlewares/role.middleware.js';
import { categorySchema, categoryUpdateSchema } from '../schemas/category.schema.js';

const router = Router();

router.get('/', categoriesController.list);
router.get('/:id', categoriesController.getOne);
router.post('/', authMiddleware, role('admin'), validate(categorySchema), categoriesController.create);
router.put('/:id', authMiddleware, role('admin'), validate(categoryUpdateSchema), categoriesController.update);
router.delete('/:id', authMiddleware, role('admin'), categoriesController.remove);

export default router;
