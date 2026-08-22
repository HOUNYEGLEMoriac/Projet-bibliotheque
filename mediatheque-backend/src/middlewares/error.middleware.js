import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { isProd } from '../config/env.js';

// Doit être le DERNIER middleware monté dans app.js (4 arguments =
// Express le reconnaît comme error handler).
export function errorMiddleware(err, req, res, next) {
  // Erreur métier connue (AppError) → on fait confiance au message/code
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Erreur Postgres/Supabase (ex: RPC qui a fait un `raise exception`)
  // remonte généralement avec un champ `message`. On la traite comme
  // une erreur métier 400 par défaut plutôt que 500.
  if (err?.code && err?.message && !err.statusCode) {
    logger.warn({ err }, 'Erreur Supabase/Postgres');
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Erreur inattendue (bug) → 500, jamais exposer la stack en prod
  logger.error({ err }, 'Erreur non gérée');
  return res.status(500).json({
    success: false,
    message: isProd ? 'Erreur interne du serveur' : err.message,
  });
}

// 404 pour toute route non définie — monté juste avant errorMiddleware
export function notFoundMiddleware(req, res) {
  res.status(404).json({
    success: false,
    message: `Route non trouvée: ${req.method} ${req.originalUrl}`,
  });
}
