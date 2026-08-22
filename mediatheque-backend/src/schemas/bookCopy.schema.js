import { z } from 'zod';

export const bookCopySchema = z.object({
  bookId: z.string().uuid('bookId invalide'),
  reference: z.string().min(1, 'Référence requise'),
});

export const bookCopyUpdateSchema = z.object({
  status: z.enum(['available', 'borrowed', 'reserved', 'damaged', 'lost']).optional(),
  condition: z.enum(['new', 'good', 'worn', 'damaged']).optional(),
});
