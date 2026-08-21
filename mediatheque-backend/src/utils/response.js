// Un seul point d'entrée pour toutes les réponses succès, afin que
// chaque controller renvoie exactement le même format (voir specs).
// Les erreurs, elles, passent par AppError + error.middleware.js —
// pas par ce fichier.

export function success(res, data, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function paginated(res, items, { page, limit, total }, message = 'OK') {
  return res.status(200).json({
    success: true,
    message,
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
