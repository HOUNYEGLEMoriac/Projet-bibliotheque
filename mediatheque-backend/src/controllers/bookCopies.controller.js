import { supabase } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => {
  let query = supabase.from('book_copies').select('*, books(title, author)');
  if (req.query.bookId) query = query.eq('book_id', req.query.bookId);

  const { data, error } = await query.order('reference');
  if (error) throw new AppError(error.message, 500);
  success(res, data);
});

export const getOne = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('book_copies')
    .select('*, books(title, author)')
    .eq('id', req.params.id)
    .maybeSingle();
  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Exemplaire introuvable', 404);
  success(res, data);
});

export const create = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.rpc('create_book_copy', {
    p_book_id: req.body.bookId,
    p_reference: req.body.reference,
  });
  if (error) throw new AppError(error.message, 409);
  success(res, data, 'Exemplaire ajouté', 201);
});

export const update = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('book_copies')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Exemplaire introuvable', 404);
  success(res, data, 'Exemplaire mis à jour');
});

export const remove = asyncHandler(async (req, res) => {
  const { error } = await supabase.rpc('delete_book_copy', { p_copy_id: req.params.id });
  if (error) throw new AppError(error.message, 409);
  success(res, null, 'Exemplaire supprimé');
});
