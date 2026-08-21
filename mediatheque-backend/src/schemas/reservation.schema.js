import { z } from 'zod';

export const createReservationSchema = z.object({
  bookId: z.string().uuid('bookId invalide'),
  memberId: z.string().uuid().optional(),
});

export const reservationQuerySchema = z.object({
  memberId: z.string().uuid().optional(),
  status: z.enum(['pending', 'ready', 'cancelled', 'fulfilled']).optional(),
});
