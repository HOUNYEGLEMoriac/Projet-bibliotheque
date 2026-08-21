import * as reservationService from '../services/reservation.service.js';
import { getMemberIdForUser } from '../services/member.service.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';

export const create = asyncHandler(async (req, res) => {
  const memberId =
    req.user.role === 'admin' && req.body.memberId
      ? req.body.memberId
      : await getMemberIdForUser(req.user.sub);

  const reservation = await reservationService.createReservation({ memberId, bookId: req.body.bookId });
  success(res, reservation, 'Réservation enregistrée', 201);
});

export const list = asyncHandler(async (req, res) => {
  let memberId = req.query.memberId;
  if (req.user.role !== 'admin') {
    memberId = await getMemberIdForUser(req.user.sub);
  }

  const data = await reservationService.listReservations({ memberId, status: req.query.status });
  success(res, data);
});

export const cancel = asyncHandler(async (req, res) => {
  const reservation = await reservationService.getReservationById(req.params.id);

  if (req.user.role !== 'admin' && reservation.members.user_id !== req.user.sub) {
    throw new AppError('Accès refusé', 403);
  }

  const updated = await reservationService.cancelReservation(req.params.id);
  success(res, updated, 'Réservation annulée');
});
