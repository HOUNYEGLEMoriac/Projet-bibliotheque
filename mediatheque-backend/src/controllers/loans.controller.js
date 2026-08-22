import * as loanService from '../services/loan.service.js';
import { getMemberIdForUser } from '../services/member.service.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, paginated } from '../utils/response.js';

export const create = asyncHandler(async (req, res) => {
  // Un member emprunte pour lui-même ; un admin peut préciser memberId
  const memberId =
    req.user.role === 'admin' && req.body.memberId
      ? req.body.memberId
      : await getMemberIdForUser(req.user.sub);

  const loan = await loanService.createLoan({ memberId, bookId: req.body.bookId });
  success(res, loan, 'Emprunt enregistré', 201);
});

export const list = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  let memberId = req.query.memberId;

  // Un member ne peut voir que ses propres emprunts, quoi qu'il demande
  if (req.user.role !== 'admin') {
    memberId = await getMemberIdForUser(req.user.sub);
  }

  const { items, total } = await loanService.listLoans({ memberId, status, page, limit });
  paginated(res, items, { page, limit, total });
});

export const getOne = asyncHandler(async (req, res) => {
  const loan = await loanService.getLoanById(req.params.id);

  if (req.user.role !== 'admin' && loan.members.user_id !== req.user.sub) {
    throw new AppError('Accès refusé', 403);
  }

  success(res, loan);
});

export const renew = asyncHandler(async (req, res) => {
  const loan = await loanService.getLoanById(req.params.id);

  if (req.user.role !== 'admin' && loan.members.user_id !== req.user.sub) {
    throw new AppError('Accès refusé', 403);
  }

  const updated = await loanService.renewLoan(req.params.id);
  success(res, updated, 'Emprunt renouvelé');
});
