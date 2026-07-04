import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import interactionRoutes from './routes/interactionRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import transacaoRoutes from './routes/transacaoRoutes.js';
import metaRoutes from './routes/metaRoutes.js';
import investimentoRoutes from './routes/investimentoRoutes.js';
import ensureDatabase from './services/ensureDatabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');

const parseAllowedOrigins = () => {
  const configuredOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([
    ...configuredOrigins,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]);
};

export const createApp = () => {
  const app = express();
  const allowedOrigins = parseAllowedOrigins();

  app.disable('x-powered-by');
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Muitas requisicoes. Tente novamente em alguns minutos.' },
  });

  const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 25,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Muitas tentativas de acesso. Aguarde antes de tentar novamente.' },
  });

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || !process.env.FRONTEND_URL) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '32kb' }));
  app.use('/api', apiLimiter);

  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/interactions', interactionRoutes);
  app.use('/api/system', systemRoutes);
  app.use('/api/transacoes', transacaoRoutes);
  app.use('/api/metas', metaRoutes);
  app.use('/api/investimentos', investimentoRoutes);

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  if (existsSync(frontendIndexPath)) {
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      return res.sendFile(frontendIndexPath);
    });
  }

  return app;
};

const app = createApp();

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Backend rodando em http://localhost:${PORT}`);
    if (process.env.DATABASE_URL) {
      ensureDatabase()
        .then(() => console.log('Banco verificado e pronto'))
        .catch((err) => console.error('Falha ao preparar banco:', err));
    }
  });
}

export default app;
