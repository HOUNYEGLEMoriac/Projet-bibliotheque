import { AppError } from '../utils/AppError.js';

// Middleware générique et réutilisable : validate(schema) prend
// n'importe quel schéma Zod. La validation se fait toujours en amont
// de la route — jamais dans le controller.
//
// Usage : router.post('/loans', auth, validate(loanSchema), loansController.create)
//
// Par défaut valide req.body. Passer { target: 'query' } ou
// { target: 'params' } pour valider autre chose.
export function validate(schema, { target = 'body' } = {}) {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new AppError(`Validation échouée: ${JSON.stringify(details)}`, 422));
    }

    // Remplace par la donnée parsée/typée (coercions Zod incluses)
    req[target] = result.data;
    next();
  };
}
