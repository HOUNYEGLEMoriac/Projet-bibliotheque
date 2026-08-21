// Évite d'écrire try/catch dans chaque controller.
// Usage : router.get('/x', asyncHandler(async (req, res) => { ... }))
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
