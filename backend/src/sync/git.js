import path from 'node:path';
import fs from 'node:fs';
import simpleGit from 'simple-git';
import { DATA_DIR } from '../config/index.js';

export function sourceDir(name) {
  return path.join(DATA_DIR, name);
}

// The PAT is passed as an HTTP auth header via GIT_CONFIG_* env vars instead
// of being embedded in the clone URL: a URL with credentials would end up in
// the clone's .git/config (on the persistent volume) and in simple-git's
// error messages (which log the full command line), leaking the token.
// simple-git blocks GIT_CONFIG_COUNT by default since it can smuggle in
// arbitrary git config - safe here because every value is set by us.
export function gitFor(source, dir) {
  // Deliberately not the whole process.env: simple-git also rejects other
  // "unsafe" vars that may be set on a dev machine (EDITOR, GIT_EDITOR, ...).
  const env = { PATH: process.env.PATH, HOME: process.env.HOME, GIT_TERMINAL_PROMPT: '0' };
  if (source.pat) {
    const credentials = Buffer.from(`x-access-token:${source.pat}`).toString('base64');
    Object.assign(env, {
      GIT_CONFIG_COUNT: '1',
      GIT_CONFIG_KEY_0: `http.${new URL(source.url).origin}/.extraHeader`,
      GIT_CONFIG_VALUE_0: `Authorization: Basic ${credentials}`,
    });
  }
  return simpleGit({ baseDir: dir, unsafe: { allowUnsafeConfigEnvCount: true } }).env(env);
}

// Returns true if a fresh clone happened, false if the source was already
// cloned (from a previous container run - DATA_DIR is a persistent volume in
// production, see docker-compose.yml).
export async function ensureCloned(source) {
  const dir = sourceDir(source.name);
  if (fs.existsSync(path.join(dir, '.git'))) {
    return false;
  }
  fs.mkdirSync(dir, { recursive: true });
  await gitFor(source, dir).clone(source.url, dir);
  return true;
}

export async function pull(source) {
  await gitFor(source, sourceDir(source.name)).pull();
}

// Pulls and returns the files that changed (added/modified/deleted) between
// the HEAD before and after the pull, so the cron job (see cron.js) can
// update the search/link index incrementally instead of rescanning the
// whole clone - the sync cost then scales with the number of changed files,
// not the size of the source (important once a source has thousands of
// files).
export async function pullAndDiff(source) {
  const git = gitFor(source, sourceDir(source.name));
  const before = await git.revparse(['HEAD']);
  await git.pull();
  const after = await git.revparse(['HEAD']);

  if (before === after) {
    return [];
  }

  const diff = await git.diff(['--name-status', before, after]);
  return diff
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [status, ...rest] = line.split('\t');
      return { status: status[0], filePath: rest[rest.length - 1] };
    });
}
