import { z } from 'zod';

export const bookSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  author: z.string().min(1, 'Auteur requis'),
  isbn: z.string().optional(),
  description: z.string().optional(),
  coverUrl: z.string().url().optional(),
  categoryId: z.string().uuid().optional(),
  publishedYear: z.number().int().optional(),
  publisher: z.string().optional(),
});

export const bookUpdateSchema = bookSchema.partial();

export const bookQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
