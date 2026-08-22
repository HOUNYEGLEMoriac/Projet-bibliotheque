import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// Vérifie le header "Authorization: Bearer <token>" et attache le
// payload décodé (sub, email, role) à req.user. Ne re-vérifie pas
// is_active en base à chaque requête pour rester rapide — le token
// expire au bout de JWT_EXPIRES_IN, et /auth/me permet de vérifier
// l'état réel du compte quand c'est nécessaire.
export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Authentification requise', 401));
  }

  const token = header.slice('Bearer '.length);

  try {
    req.user = jwt.verify(token, env.JWT_SECRET);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Session expirée, reconnecte-toi', 401));
    }
    return next(new AppError('Token invalide', 401));
  }
}
