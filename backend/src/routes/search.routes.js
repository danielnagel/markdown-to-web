import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { search } from '../search/index.js';
import { findSource } from './helpers.js';

export default function searchRouter(sources) {
  const router = Router();

  router.get('/:source', requireAuth, (req, res, next) => {
    try {
      findSource(sources, req.params.source);
      const q = req.query.q;
      res.json(q ? search(req.params.source, String(q)) : []);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
