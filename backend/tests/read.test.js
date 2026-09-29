import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { resolveSafePath, readFileSafe } from '../src/fs/read.js';

let root;

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'mdweb-read-'));
  fs.writeFileSync(path.join(root, 'note.md'), '# Hello');
});

afterAll(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe('resolveSafePath', () => {
  it('resolves a path within the root', () => {
    expect(resolveSafePath(root, 'note.md')).toBe(path.join(root, 'note.md'));
  });

  it('rejects a path that escapes the root', () => {
    expect(() => resolveSafePath(root, '../../etc/passwd')).toThrow(/escapes source root/);
  });
});

describe('readFileSafe', () => {
  it('reads an existing file', () => {
    expect(readFileSafe(root, 'note.md')).toBe('# Hello');
  });

  it('throws for a missing file', () => {
    expect(() => readFileSafe(root, 'missing.md')).toThrow(/file not found/);
  });
});
