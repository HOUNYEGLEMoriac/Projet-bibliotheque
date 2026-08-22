import { supabase } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { daysBetween } from '../utils/dates.js';

// Montant par jour de retard — pas précisé dans les specs, valeur par
// défaut ajustable via variable d'env pour ne pas coder la devise en dur.
const RATE_PER_DAY = parseFloat(process.env.PENALTY_RATE_PER_DAY ?? '100');

// Appelé automatiquement après un retour (voir return.service.js).
// Ne crée une pénalité que si le retour est réellement en retard.
export async function createPenaltyIfLate({ loanId, memberId, dueDate, returnedAt }) {
  const daysOverdue = daysBetween(dueDate, returnedAt);
  if (daysOverdue <= 0) return null;

  const { data, error } = await supabase
    .from('penalties')
    .insert({
      loan_id: loanId,
      member_id: memberId,
      days_overdue: daysOverdue,
      amount: (daysOverdue * RATE_PER_DAY).toFixed(2),
    })
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function listPenalties({ memberId, status, page = 1, limit = 20 }) {
  let query = supabase
    .from('penalties')
    .select('*, loans(book_copies(books(title))), members(first_name, last_name)', { count: 'exact' });

  if (memberId) query = query.eq('member_id', memberId);
  if (status) query = query.eq('status', status);

  const from = (page - 1) * limit;
  const { data, error, count } = await query
    .range(from, from + limit - 1)
    .order('created_at', { ascending: false });

  if (error) throw new AppError(error.message, 500);
  return { items: data, total: count };
}

export async function updatePenaltyStatus(penaltyId, status) {
  const { data, error } = await supabase
    .from('penalties')
    .update({ status })
    .eq('id', penaltyId)
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Pénalité introuvable', 404);
  return data;
}
