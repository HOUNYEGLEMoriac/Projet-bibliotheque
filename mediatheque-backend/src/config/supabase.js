import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { env } from './env.js';

// IMPORTANT : la service_role key bypass RLS entièrement.
// Elle ne doit JAMAIS être envoyée au front — elle vit uniquement ici,
// côté serveur. Tout le contrôle d'accès se fait dans les middlewares
// auth/role, pas dans Supabase.
//
// `realtime.transport: ws` est nécessaire sous Node < 22 (pas de
// WebSocket natif). On n'utilise pas les fonctionnalités realtime ici,
// mais le client Supabase les initialise quand même au démarrage.
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    transport: ws,
  },
});