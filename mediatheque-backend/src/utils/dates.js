// Petits helpers utilisés côté controllers pour affichage/validation.
// Le calcul des due_date / expires_at réels se fait dans les fonctions
// RPC Postgres (voir 004_rpc_functions.sql) — pas ici — pour rester
// cohérent avec l'heure serveur de la base.

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isPast(date) {
  return new Date(date).getTime() < Date.now();
}

export function daysBetween(from, to) {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
