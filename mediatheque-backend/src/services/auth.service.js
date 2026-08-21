import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const SALT_ROUNDS = 10;

function generateToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

// Inscription : crée user + member atomiquement via le RPC register_member
export async function register({ email, password, firstName, lastName, phone }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const { data, error } = await supabase.rpc('register_member', {
    p_email: email,
    p_password_hash: passwordHash,
    p_first_name: firstName,
    p_last_name: lastName,
    p_phone: phone ?? null,
  });

  if (error) {
    // unique_violation levé côté RPC remonte ici avec ce message
    throw new AppError(error.message, 409);
  }

  const row = data[0];
  const token = generateToken({ id: row.user_id, email: row.email, role: row.role });

  return {
    token,
    user: { id: row.user_id, email: row.email, role: row.role, memberId: row.member_id },
  };
}

// Connexion : vérifie email + mot de passe, renvoie un JWT
export async function login({ email, password }) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, password_hash, role, is_active')
    .eq('email', email)
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);
  if (!user) throw new AppError('Email ou mot de passe incorrect', 401);
  if (!user.is_active) throw new AppError('Ce compte a été désactivé', 403);

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) throw new AppError('Email ou mot de passe incorrect', 401);

  const token = generateToken(user);

  return {
    token,
    user: { id: user.id, email: user.email, role: user.role },
  };
}

// Profil complet de l'utilisateur connecté (+ fiche member si role='member')
export async function getMe(userId) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, role, is_active, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);
  if (!user) throw new AppError('Utilisateur introuvable', 404);

  if (user.role !== 'member') {
    return user;
  }

  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('id, first_name, last_name, phone, address, avatar_url, max_loans')
    .eq('user_id', userId)
    .maybeSingle();

  if (memberError) throw new AppError(memberError.message, 500);

  return { ...user, member };
}

// Réservé aux admins : créer un autre compte admin (pas de fiche member)
export async function createAdmin({ email, password }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const { data, error } = await supabase
    .from('users')
    .insert({ email, password_hash: passwordHash, role: 'admin' })
    .select('id, email, role')
    .single();

  if (error) {
    if (error.code === '23505') throw new AppError('Cet email est déjà utilisé', 409);
    throw new AppError(error.message, 500);
  }

  return data;
}
