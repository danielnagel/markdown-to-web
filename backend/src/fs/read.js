import fs from 'node:fs';
import path from 'node:path';

// Resolves `requestedPath` against `rootDir` and throws if the result would
// escape rootDir (e.g. via "../../etc/passwd"). requestedPath comes straight
// from the URL (see routes/file.routes.js), so this is the only thing
// standing between this endpoint and an arbitrary-file-read vulnerability.
export function resolveSafePath(rootDir, requestedPath) {
  const resolvedRoot = path.resolve(rootDir);
  const resolvedTarget = path.resolve(resolvedRoot, requestedPath);

  if (resolvedTarget !== resolvedRoot && !resolvedTarget.startsWith(resolvedRoot + path.sep)) {
    const err = new Error('path escapes source root');
    err.status = 400;
    throw err;
  }
  return resolvedTarget;
}

export function readFileSafe(rootDir, requestedPath) {
  const target = resolveSafePath(rootDir, requestedPath);
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    const err = new Error('file not found');
    err.status = 404;
    throw err;
  }
  return fs.readFileSync(target, 'utf-8');
}
