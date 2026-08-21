import { supabase } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, paginated } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => {
  const { categoryId, search, page, limit } = req.query;

  let query = supabase.from('books').select('*, categories(name)', { count: 'exact' });
  if (categoryId) query = query.eq('category_id', categoryId);
  if (search) query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);

  const from = (page - 1) * limit;
  const { data, error, count } = await query.range(from, from + limit - 1).order('title');
  if (error) throw new AppError(error.message, 500);

  paginated(res, data, { page, limit, total: count });
});

export const getOne = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('books')
    .select('*, categories(name), book_copies(id, reference, status, condition)')
    .eq('id', req.params.id)
    .maybeSingle();
  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Livre introuvable', 404);
  success(res, data);
});

export const create = asyncHandler(async (req, res) => {
  const payload = {
    title: req.body.title,
    author: req.body.author,
    isbn: req.body.isbn,
    description: req.body.description,
    cover_url: req.body.coverUrl,
    category_id: req.body.categoryId,
    published_year: req.body.publishedYear,
    publisher: req.body.publisher,
    total_copies: 0,
    available_copies: 0,
  };

  const { data, error } = await supabase.from('books').insert(payload).select().single();
  if (error) {
    if (error.code === '23505') throw new AppError('Cet ISBN existe déjà', 409);
    throw new AppError(error.message, 500);
  }
  success(res, data, 'Livre créé — ajoute des exemplaires via /book-copies', 201);
});

export const update = asyncHandler(async (req, res) => {
  const payload = {};
  if (req.body.title !== undefined) payload.title = req.body.title;
  if (req.body.author !== undefined) payload.author = req.body.author;
  if (req.body.isbn !== undefined) payload.isbn = req.body.isbn;
  if (req.body.description !== undefined) payload.description = req.body.description;
  if (req.body.coverUrl !== undefined) payload.cover_url = req.body.coverUrl;
  if (req.body.categoryId !== undefined) payload.category_id = req.body.categoryId;
  if (req.body.publishedYear !== undefined) payload.published_year = req.body.publishedYear;
  if (req.body.publisher !== undefined) payload.publisher = req.body.publisher;

  const { data, error } = await supabase.from('books').update(payload).eq('id', req.params.id).select().single();
  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError('Livre introuvable', 404);
  success(res, data, 'Livre mis à jour');
});

export const remove = asyncHandler(async (req, res) => {
  const { error } = await supabase.from('books').delete().eq('id', req.params.id);
  if (error) throw new AppError(error.message, 500);
  success(res, null, 'Livre supprimé');
});
