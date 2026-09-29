import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

export default function sourcesRouter(sources) {
  const router = Router();

  router.get('/', requireAuth, (req, res) => {
    res.json(sources.map((s) => ({ name: s.name })));
  });

  return router;
}
