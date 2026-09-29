import path from 'node:path';
import { sourceDir } from '../sync/git.js';

// git sources live under DATA_DIR/<name> (see sync/git.js); local sources
// point directly at their configured path.
export function sourceRoot(source) {
  return source.type === 'git' ? sourceDir(source.name) : path.resolve(source.path);
}
