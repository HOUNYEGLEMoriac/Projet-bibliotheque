import { Router } from 'express';
import * as reservationsController from '../controllers/reservations.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { role } from '../middlewares/role.middleware.js';
import { createReservationSchema, reservationQuerySchema } from '../schemas/reservation.schema.js';

const router = Router();

router.use(authMiddleware);

router.post('/', role('member', 'admin'), validate(createReservationSchema), reservationsController.create);
router.get('/', validate(reservationQuerySchema, { target: 'query' }), reservationsController.list);
router.delete('/:id', reservationsController.cancel);

export default router;
