// Erreur métier typée : un controller/service fait juste
// `throw new AppError('message', 404)` et error.middleware.js
// se charge de la transformer en réponse JSON correcte.
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true; // distingue une erreur "attendue" d'un bug
  }
}
