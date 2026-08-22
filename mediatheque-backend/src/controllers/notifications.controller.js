import * as notificationService from '../services/notification.service.js';
import { getMemberIdForUser } from '../services/member.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => {
  const memberId = await getMemberIdForUser(req.user.sub);
  const data = await notificationService.listNotifications(memberId);
  success(res, data);
});

export const markAsRead = asyncHandler(async (req, res) => {
  const memberId = await getMemberIdForUser(req.user.sub);
  const notification = await notificationService.markAsRead(req.params.id, memberId);
  success(res, notification, 'Notification marquée comme lue');
});

// Admin uniquement : à appeler manuellement ou via un cron externe (ex: cron-job.org)
export const runReminders = asyncHandler(async (req, res) => {
  const result = await notificationService.runReminders();
  success(res, result, `${result.created} rappel(s) créé(s)`);
});
