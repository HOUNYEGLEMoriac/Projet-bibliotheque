import 'dotenv/config';

// Liste des variables obligatoires. Si l'une manque, le serveur ne
// démarre pas — mieux vaut planter au boot qu'au premier appel API
// qui en a besoin (ex: la première requête Supabase).
const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `[env] Variables d'environnement manquantes: ${missing.join(', ')}\n` +
    `Copie .env.example vers .env et renseigne-les.`
  );
  process.exit(1);
}

export const env = {
  PORT: parseInt(process.env.PORT ?? '4000', 10),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
};

export const isProd = env.NODE_ENV === 'production';
