import { Router } from 'express';
import * as notificationsController from '../controllers/notifications.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { role } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', notificationsController.list);
router.put('/:id/read', notificationsController.markAsRead);
router.post('/reminders/run', role('admin'), notificationsController.runReminders);

export default router;
