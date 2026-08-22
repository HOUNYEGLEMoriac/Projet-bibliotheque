import { supabase } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw new AppError(error.message, 500);
  success(res, data);
});

export const getOne = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('categories').select('*').eq('id', req.params.id).maybeSingle();
  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Catégorie introuvable', 404);
  success(res, data);
});

export const create = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('categories').insert(req.body).select().single();
  if (error) {
    if (error.code === '23505') throw new AppError('Cette catégorie existe déjà', 409);
    throw new AppError(error.message, 500);
  }
  success(res, data, 'Catégorie créée', 201);
});

export const update = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Catégorie introuvable', 404);
  success(res, data, 'Catégorie mise à jour');
});

export const remove = asyncHandler(async (req, res) => {
  const { error } = await supabase.from('categories').delete().eq('id', req.params.id);
  if (error) throw new AppError(error.message, 500);
  success(res, null, 'Catégorie supprimée');
});
