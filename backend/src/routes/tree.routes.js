import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { buildTree } from '../fs/tree.js';
import { sourceRoot } from '../fs/paths.js';
import { findSource } from './helpers.js';

export default function treeRouter(sources) {
  const router = Router();

  router.get('/:source', requireAuth, (req, res, next) => {
    try {
      const source = findSource(sources, req.params.source);
      res.json(buildTree(sourceRoot(source)));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
