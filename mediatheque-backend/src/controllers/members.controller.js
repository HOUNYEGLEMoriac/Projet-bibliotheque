import * as memberService from '../services/member.service.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, paginated } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => {
  const { search, page, limit } = req.query;
  const { items, total } = await memberService.listMembers({ search, page, limit });
  paginated(res, items, { page, limit, total });
});

export const getOne = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberById(req.params.id);

  if (req.user.role !== 'admin' && member.user_id !== req.user.sub) {
    throw new AppError('Accès refusé', 403);
  }

  success(res, member);
});

// Le membre modifie son propre profil (téléphone, adresse, avatar)
export const updateProfile = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberById(req.params.id);

  if (req.user.role !== 'admin' && member.user_id !== req.user.sub) {
    throw new AppError('Accès refusé', 403);
  }

  const updated = await memberService.updateMemberProfile(req.params.id, req.body);
  success(res, updated, 'Profil mis à jour');
});

// Admin uniquement : activer/désactiver, changer max_loans
export const updateStatus = asyncHandler(async (req, res) => {
  const updated = await memberService.updateMemberStatus(req.params.id, req.body);
  success(res, updated, 'Statut du membre mis à jour');
});
