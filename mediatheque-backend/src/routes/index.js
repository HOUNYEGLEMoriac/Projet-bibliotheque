import { Router } from 'express';
import { success } from '../utils/response.js';

import authRoutes from './auth.routes.js';
import categoriesRoutes from './categories.routes.js';
import booksRoutes from './books.routes.js';
import bookCopiesRoutes from './bookCopies.routes.js';
import loansRoutes from './loans.routes.js';
import returnsRoutes from './returns.routes.js';
import reservationsRoutes from './reservations.routes.js';
import penaltiesRoutes from './penalties.routes.js';
import notificationsRoutes from './notifications.routes.js';
import membersRoutes from './members.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

// Vérifie que l'API + la connexion Supabase répondent.
router.get('/health', (req, res) => {
  success(res, { status: 'ok', timestamp: new Date().toISOString() }, 'API opérationnelle');
});

router.use('/auth', authRoutes);
router.use('/categories', categoriesRoutes);
router.use('/books', booksRoutes);
router.use('/book-copies', bookCopiesRoutes);
router.use('/loans', loansRoutes);
router.use('/returns', returnsRoutes);
router.use('/reservations', reservationsRoutes);
router.use('/penalties', penaltiesRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/members', membersRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
