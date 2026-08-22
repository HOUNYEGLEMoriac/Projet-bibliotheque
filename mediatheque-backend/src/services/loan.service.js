import { supabase } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

const MAX_RENEWALS = 2;
const RENEWAL_DAYS = 7;

export async function createLoan({ memberId, bookId }) {
  const { data, error } = await supabase.rpc('create_loan', {
    p_member_id: memberId,
    p_book_id: bookId,
  });

  if (error) throw new AppError(error.message, 409);
  return data;
}

export async function listLoans({ memberId, status, page, limit }) {
  let query = supabase
    .from('loans')
    .select('*, book_copies(reference, books(title, author, cover_url)), members(first_name, last_name)', {
      count: 'exact',
    });

  if (memberId) query = query.eq('member_id', memberId);
  if (status) query = query.eq('status', status);

  const from = (page - 1) * limit;
  const { data, error, count } = await query
    .range(from, from + limit - 1)
    .order('loaned_at', { ascending: false });

  if (error) throw new AppError(error.message, 500);
  return { items: data, total: count };
}

export async function getLoanById(loanId) {
  const { data, error } = await supabase
    .from('loans')
    .select('*, book_copies(reference, books(title, author)), members(first_name, last_name, user_id)')
    .eq('id', loanId)
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Emprunt introuvable', 404);
  return data;
}

export async function renewLoan(loanId) {
  const loan = await getLoanById(loanId);

  if (loan.status !== 'active') {
    throw new AppError(`Impossible de renouveler un emprunt au statut "${loan.status}"`, 409);
  }
  if (loan.renewed_count >= MAX_RENEWALS) {
    throw new AppError(`Nombre maximum de renouvellements atteint (${MAX_RENEWALS})`, 409);
  }

  const newDueDate = new Date(loan.due_date);
  newDueDate.setDate(newDueDate.getDate() + RENEWAL_DAYS);

  const { data, error } = await supabase
    .from('loans')
    .update({ due_date: newDueDate.toISOString(), renewed_count: loan.renewed_count + 1 })
    .eq('id', loanId)
    .eq('status', 'active') // garde-fou si double-clic concurrent
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}
