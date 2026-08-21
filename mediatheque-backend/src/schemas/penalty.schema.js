import { z } from 'zod';

export const updatePenaltyStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'waived']),
});
