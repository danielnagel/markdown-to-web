import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { readFileSafe } from '../fs/read.js';
import { sourceRoot } from '../fs/paths.js';
import { resolveWikilinks } from '../search/wikilinks.js';
import { findSource } from './helpers.js';

export default function fileRouter(sources) {
  const router = Router();

  // Express 5 (path-to-regexp v8) requires a named wildcard; req.params.filePath
  // comes back as an array of path segments, joined below.
  router.get('/:source/*filePath', requireAuth, (req, res, next) => {
    try {
      const source = findSource(sources, req.params.source);
      const relPath = req.params.filePath.join('/');
      const raw = readFileSafe(sourceRoot(source), relPath);
      const content = resolveWikilinks(raw, source.name);
      res.json({ path: relPath, content });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
