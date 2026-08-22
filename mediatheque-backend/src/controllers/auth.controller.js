import * as authService from '../services/auth.service.js';
import { success } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  success(res, result, 'Inscription réussie', 201);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  success(res, result, 'Connexion réussie');
});

export const me = asyncHandler(async (req, res) => {
  const profile = await authService.getMe(req.user.sub);
  success(res, profile);
});

export const createAdmin = asyncHandler(async (req, res) => {
  const admin = await authService.createAdmin(req.body);
  success(res, admin, 'Compte admin créé', 201);
});
