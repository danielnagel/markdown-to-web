import { it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { buildTree } from '../src/fs/tree.js';

let root;

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'mdweb-tree-'));
  fs.mkdirSync(path.join(root, 'sub'));
  fs.writeFileSync(path.join(root, 'a.md'), '# A');
  fs.writeFileSync(path.join(root, 'sub', 'b.md'), '# B');
  fs.mkdirSync(path.join(root, '.git'));
  fs.writeFileSync(path.join(root, '.git', 'HEAD'), 'ref: refs/heads/main');
});

afterAll(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

it('builds a sorted tree and excludes .git', () => {
  const tree = buildTree(root);
  expect(tree.map((e) => e.name)).toEqual(['a.md', 'sub']);

  const sub = tree.find((e) => e.name === 'sub');
  expect(sub.children).toEqual([{ type: 'file', name: 'b.md', path: 'sub/b.md' }]);
});
