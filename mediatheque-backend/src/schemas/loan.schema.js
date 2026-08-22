import { z } from 'zod';

// memberId optionnel : un member l'omet (c'est lui-même), un admin le précise
export const createLoanSchema = z.object({
  bookId: z.string().uuid('bookId invalide'),
  memberId: z.string().uuid().optional(),
});

export const returnLoanSchema = z.object({
  condition: z.enum(['good', 'worn', 'damaged', 'lost']).default('good'),
  notes: z.string().optional(),
});

export const loanQuerySchema = z.object({
  memberId: z.string().uuid().optional(),
  status: z.enum(['active', 'returned', 'overdue', 'lost']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
