import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  description: z.string().optional(),
});

export const categoryUpdateSchema = categorySchema.partial();
