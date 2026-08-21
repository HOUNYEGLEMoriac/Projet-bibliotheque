import { supabase } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

async function count(table, filters = {}) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  for (const [col, val] of Object.entries(filters)) query = query.eq(col, val);
  const { count: total, error } = await query;
  if (error) throw new AppError(error.message, 500);
  return total ?? 0;
}

export async function getStats() {
  const [totalBooks, totalMembers, activeLoans, overdueLoans, pendingReservations, unpaidPenalties] =
    await Promise.all([
      count('books'),
      count('members'),
      count('loans', { status: 'active' }),
      count('loans', { status: 'overdue' }),
      count('reservations', { status: 'pending' }),
      count('penalties', { status: 'pending' }),
    ]);

  return {
    totalBooks,
    totalMembers,
    activeLoans,
    overdueLoans,
    pendingReservations,
    unpaidPenalties,
  };
}
