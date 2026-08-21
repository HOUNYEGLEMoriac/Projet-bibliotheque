import { supabase } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

// Helper partagé par loans/reservations/notifications pour retrouver
// l'id `member` correspondant à l'utilisateur JWT connecté (req.user.sub
// est un users.id, pas un members.id — ce sont deux tables distinctes).
export async function getMemberIdForUser(userId) {
  const { data, error } = await supabase
    .from('members')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Aucune fiche membre associée à ce compte', 404);
  return data.id;
}

export async function listMembers({ search, page, limit }) {
  let query = supabase
    .from('members')
    .select('id, first_name, last_name, phone, max_loans, users(email, is_active)', { count: 'exact' });

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
  }

  const from = (page - 1) * limit;
  const { data, error, count } = await query.range(from, from + limit - 1).order('last_name');

  if (error) throw new AppError(error.message, 500);
  return { items: data, total: count };
}

export async function getMemberById(memberId) {
  const { data, error } = await supabase
    .from('members')
    .select('id, first_name, last_name, phone, address, avatar_url, max_loans, user_id, users(email, is_active, role)')
    .eq('id', memberId)
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Membre introuvable', 404);
  return data;
}

export async function updateMemberProfile(memberId, updates) {
  const payload = {};
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.address !== undefined) payload.address = updates.address;
  if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

  const { data, error } = await supabase
    .from('members')
    .update(payload)
    .eq('id', memberId)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

// Réservé admin : (dés)active le compte user lié, et/ou change max_loans
export async function updateMemberStatus(memberId, { isActive, maxLoans }) {
  if (maxLoans !== undefined) {
    const { error } = await supabase.from('members').update({ max_loans: maxLoans }).eq('id', memberId);
    if (error) throw new AppError(error.message, 500);
  }

  if (isActive !== undefined) {
    const { data: member, error: findError } = await supabase
      .from('members')
      .select('user_id')
      .eq('id', memberId)
      .maybeSingle();

    if (findError) throw new AppError(findError.message, 500);
    if (!member) throw new AppError('Membre introuvable', 404);

    const { error } = await supabase.from('users').update({ is_active: isActive }).eq('id', member.user_id);
    if (error) throw new AppError(error.message, 500);
  }

  return getMemberById(memberId);
}
