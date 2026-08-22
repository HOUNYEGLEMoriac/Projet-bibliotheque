import * as returnService from '../services/return.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, paginated } from '../utils/response.js';

export const create = asyncHandler(async (req, res) => {
  const result = await returnService.returnLoan(req.params.loanId, {
    condition: req.body.condition,
    notes: req.body.notes,
    processedBy: req.user.sub,
  });
  success(res, result, 'Retour enregistré');
});

export const list = asyncHandler(async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const { items, total } = await returnService.listReturns({ page, limit });
  paginated(res, items, { page, limit, total });
});
