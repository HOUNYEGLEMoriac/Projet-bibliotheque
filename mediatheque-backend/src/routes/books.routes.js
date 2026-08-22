import { Router } from 'express';
import * as booksController from '../controllers/books.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { role } from '../middlewares/role.middleware.js';
import { bookSchema, bookUpdateSchema, bookQuerySchema } from '../schemas/book.schema.js';

const router = Router();

router.get('/', validate(bookQuerySchema, { target: 'query' }), booksController.list);
router.get('/:id', booksController.getOne);
router.post('/', authMiddleware, role('admin'), validate(bookSchema), booksController.create);
router.put('/:id', authMiddleware, role('admin'), validate(bookUpdateSchema), booksController.update);
router.delete('/:id', authMiddleware, role('admin'), booksController.remove);

export default router;
