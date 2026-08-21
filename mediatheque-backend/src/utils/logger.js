import pino from 'pino';
import { isProd } from '../config/env.js';

// En dev : sortie lisible en couleur (pino-pretty).
// En prod : JSON brut, prêt pour un agrégateur de logs.
export const logger = pino({
  level: isProd ? 'info' : 'debug',
  transport: isProd
    ? undefined
    : { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } },
});
