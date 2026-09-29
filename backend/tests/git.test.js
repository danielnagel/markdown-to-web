import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, it, expect } from 'vitest';
import { ensureCloned, sourceDir } from '../src/sync/git.js';

const PAT = 'github_pat_dummy-secret-token';

function makeUpstreamRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdweb-upstream-'));
  const git = (...args) => execFileSync('git', args, { cwd: dir });
  git('init', '--quiet');
  fs.writeFileSync(path.join(dir, 'Note.md'), '# Note');
  git('add', '.');
  git('-c', 'user.name=test', '-c', 'user.email=test@example.com', 'commit', '--quiet', '-m', 'init');
  return dir;
}

describe('ensureCloned', () => {
  it('clones a source without persisting the PAT in .git/config', async () => {
    const source = { name: 'clone-test', type: 'git', url: `file://${makeUpstreamRepo()}`, pat: PAT };

    expect(await ensureCloned(source)).toBe(true);
    expect(fs.existsSync(path.join(sourceDir(source.name), 'Note.md'))).toBe(true);
    expect(fs.readFileSync(path.join(sourceDir(source.name), '.git', 'config'), 'utf-8')).not.toContain(PAT);

    expect(await ensureCloned(source)).toBe(false);
  });

  it('keeps the PAT out of the error of a failed clone', async () => {
    const source = { name: 'missing-test', type: 'git', url: 'file:///does/not/exist', pat: PAT };

    const error = await ensureCloned(source).catch((err) => err);
    expect(error).toBeInstanceOf(Error);
    expect(JSON.stringify({ message: error.message, task: error.task })).not.toContain(PAT);
  });
});
