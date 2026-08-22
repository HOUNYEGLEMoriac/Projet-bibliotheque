import * as penaltyService from '../services/penalty.service.js';
import { getMemberIdForUser } from '../services/member.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, paginated } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  let memberId = req.query.memberId;

  if (req.user.role !== 'admin') {
    memberId = await getMemberIdForUser(req.user.sub);
  }

  const { items, total } = await penaltyService.listPenalties({
    memberId,
    status: req.query.status,
    page,
    limit,
  });
  paginated(res, items, { page, limit, total });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const penalty = await penaltyService.updatePenaltyStatus(req.params.id, req.body.status);
  success(res, penalty, 'Pénalité mise à jour');
});
