import express from 'express';
import authRouter from './routes/auth.routes.js';
import sourcesRouter from './routes/sources.routes.js';
import treeRouter from './routes/tree.routes.js';
import fileRouter from './routes/file.routes.js';
import searchRouter from './routes/search.routes.js';
import { notFound, errorHandler } from './middleware/errors.js';

export function createApp(sources) {
  const app = express();

  // Number of reverse-proxy hops in front of this service (e.g. an outer
  // reverse proxy plus the frontend's nginx = 2). The login rate limiter
  // keys on req.ip, so this must match the real deployment or all clients
  // share the proxy's IP (and thus one limit).
  app.set('trust proxy', Number.parseInt(process.env.TRUST_PROXY_HOPS ?? '0', 10));

  app.use(express.json());

  app.use('/auth', authRouter);
  app.use('/api/sources', sourcesRouter(sources));
  app.use('/api/tree', treeRouter(sources));
  app.use('/api/file', fileRouter(sources));
  app.use('/api/search', searchRouter(sources));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
