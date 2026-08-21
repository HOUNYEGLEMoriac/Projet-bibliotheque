import * as dashboardService from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';

export const stats = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStats();
  success(res, data);
});
