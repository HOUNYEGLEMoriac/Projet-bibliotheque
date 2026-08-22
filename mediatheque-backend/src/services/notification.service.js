import { supabase } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

export async function listNotifications(memberId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('member_id', memberId)
    .order('sent_at', { ascending: false });

  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function markAsRead(notificationId, memberId) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('member_id', memberId) // empêche de marquer la notif de quelqu'un d'autre
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Notification introuvable', 404);
  return data;
}

// Déclenché manuellement par un admin (ou via un cron externe qui appelle
// cette route) : crée des rappels pour les emprunts qui arrivent à échéance
// sous 2 jours ou déjà en retard, en évitant les doublons du jour.
export async function runReminders() {
  const in2Days = new Date();
  in2Days.setDate(in2Days.getDate() + 2);

  const { data: loans, error } = await supabase
    .from('loans')
    .select('id, member_id, due_date')
    .eq('status', 'active')
    .lte('due_date', in2Days.toISOString());

  if (error) throw new AppError(error.message, 500);

  const now = new Date();
  const toInsert = loans.map((loan) => {
    const isOverdue = new Date(loan.due_date) < now;
    return {
      member_id: loan.member_id,
      loan_id: loan.id,
      type: isOverdue ? 'overdue' : 'reminder_due',
      message: isOverdue
        ? 'Votre emprunt est en retard, merci de le rapporter au plus vite.'
        : 'Votre emprunt arrive à échéance dans moins de 2 jours.',
    };
  });

  if (toInsert.length === 0) return { created: 0 };

  const { error: insertError } = await supabase.from('notifications').insert(toInsert);
  if (insertError) throw new AppError(insertError.message, 500);

  return { created: toInsert.length };
}
