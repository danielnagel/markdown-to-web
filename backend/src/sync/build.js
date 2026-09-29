import fs from 'node:fs';
import path from 'node:path';
import { indexFile, removeFile, clearSource } from '../search/index.js';
import { upsertLink, removeLink, clearSourceLinks } from '../search/linkIndex.js';

function isMarkdown(filePath) {
  return filePath.endsWith('.md');
}

function listMarkdownFiles(rootDir) {
  const results = [];

  function walk(dir, relPath) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.git') continue;
      const entryRelPath = relPath ? `${relPath}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), entryRelPath);
      } else if (isMarkdown(entry.name)) {
        results.push(entryRelPath);
      }
    }
  }

  walk(rootDir, '');
  return results;
}

// Full (re-)index of a source, used at startup. Cheap enough for v1 since it
// only runs once per process lifetime per source - the 15-minute cron job
// uses incrementalUpdate() below instead, which is the one that has to scale
// with source size.
export function fullIndexBuild(sourceName, rootDir) {
  clearSource(sourceName);
  clearSourceLinks(sourceName);

  for (const relPath of listMarkdownFiles(rootDir)) {
    const content = fs.readFileSync(path.join(rootDir, relPath), 'utf-8');
    const filename = path.basename(relPath, '.md');
    indexFile(sourceName, relPath, filename, content);
    upsertLink(sourceName, filename, relPath);
  }
}

// Applies a `git diff --name-status` result (see sync/git.js pullAndDiff) to
// the search and link index, so sync cost scales with the number of changed
// files rather than the size of the whole source.
export function incrementalUpdate(sourceName, rootDir, changes) {
  for (const change of changes) {
    if (!isMarkdown(change.filePath)) continue;

    if (change.status === 'D') {
      removeFile(sourceName, change.filePath);
      removeLink(sourceName, change.filePath);
      continue;
    }

    const content = fs.readFileSync(path.join(rootDir, change.filePath), 'utf-8');
    const filename = path.basename(change.filePath, '.md');
    indexFile(sourceName, change.filePath, filename, content);
    upsertLink(sourceName, filename, change.filePath);
  }
}
