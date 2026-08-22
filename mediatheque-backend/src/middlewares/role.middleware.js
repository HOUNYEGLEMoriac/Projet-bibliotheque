import { AppError } from '../utils/AppError.js';

// Usage : router.post('/admins', authMiddleware, role('admin'), ...)
// Toujours monté APRÈS authMiddleware (a besoin de req.user).
export function role(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentification requise', 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Accès refusé pour ce rôle', 403));
    }
    next();
  };
}
