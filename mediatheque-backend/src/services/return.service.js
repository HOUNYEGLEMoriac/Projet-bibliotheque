import { supabase } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { createPenaltyIfLate } from './penalty.service.js';

export async function returnLoan(loanId, { condition, notes, processedBy }) {
  // Récupère le loan avant retour pour connaître due_date/member_id
  // (après le RPC, on pourrait re-sélectionner, mais autant l'avoir avant).
  const { data: loanBefore, error: findError } = await supabase
    .from('loans')
    .select('id, due_date, member_id, status')
    .eq('id', loanId)
    .maybeSingle();

  if (findError) throw new AppError(findError.message, 500);
  if (!loanBefore) throw new AppError('Emprunt introuvable', 404);

  const { data, error } = await supabase.rpc('return_loan', {
    p_loan_id: loanId,
    p_condition: condition,
    p_notes: notes ?? null,
    p_processed_by: processedBy,
  });

  if (error) throw new AppError(error.message, 409);

  // Pénalité automatique si le retour est en retard sur due_date
  const penalty = await createPenaltyIfLate({
    loanId,
    memberId: loanBefore.member_id,
    dueDate: loanBefore.due_date,
    returnedAt: new Date(),
  });

  return { loan: data, penalty };
}

export async function listReturns({ page = 1, limit = 20 } = {}) {
  const from = (page - 1) * limit;
  const { data, error, count } = await supabase
    .from('returns')
    .select('*, loans(member_id, book_copies(reference, books(title)))', { count: 'exact' })
    .range(from, from + limit - 1)
    .order('returned_at', { ascending: false });

  if (error) throw new AppError(error.message, 500);
  return { items: data, total: count };
}
