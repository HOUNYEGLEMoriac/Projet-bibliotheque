import { supabase } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

export async function createReservation({ memberId, bookId }) {
  const { data, error } = await supabase.rpc('create_reservation', {
    p_member_id: memberId,
    p_book_id: bookId,
  });

  if (error) throw new AppError(error.message, 409);
  return data;
}

export async function cancelReservation(reservationId) {
  const { data, error } = await supabase.rpc('cancel_reservation', {
    p_reservation_id: reservationId,
  });

  if (error) throw new AppError(error.message, 409);
  return data;
}

export async function listReservations({ memberId, status }) {
  let query = supabase
    .from('reservations')
    .select('*, books(title, author, cover_url), members(first_name, last_name)');

  if (memberId) query = query.eq('member_id', memberId);
  if (status) query = query.eq('status', status);

  const { data, error } = await query.order('position');

  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function getReservationById(reservationId) {
  const { data, error } = await supabase
    .from('reservations')
    .select('*, members(user_id)')
    .eq('id', reservationId)
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Réservation introuvable', 404);
  return data;
}
