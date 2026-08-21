import { z } from 'zod';

// Ce que le membre peut modifier sur son propre profil
export const updateMemberProfileSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

// Réservé aux admins
export const updateMemberStatusSchema = z.object({
  isActive: z.boolean().optional(),
  maxLoans: z.number().int().min(1).optional(),
});

export const memberQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
