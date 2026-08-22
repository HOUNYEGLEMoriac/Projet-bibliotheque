import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import routes from './routes/index.js';
import { logger } from './utils/logger.js';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware.js';

export const app = express();

// Sécurité / middlewares de base
app.use(helmet());
app.use(cors()); // à restreindre à l'origine du front une fois déployée
app.use(express.json());
app.use(pinoHttp({ logger }));

// Toutes les routes de l'API sous /api (aligné avec services/api.js du front)
app.use('/api', routes);

// Doivent rester en dernier, dans cet ordre précis
app.use(notFoundMiddleware);
app.use(errorMiddleware);
