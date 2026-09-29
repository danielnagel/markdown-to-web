import fs from 'node:fs';
import path from 'node:path';

// Builds the folder/file tree on demand from disk rather than maintaining a
// persisted structure. The filesystem is already the source of truth for
// which files/folders exist, so this keeps sync (see ../sync) responsible
// only for the search/link index, which is the only thing that genuinely
// needs a stored table (for FTS5 to query at all).
export function buildTree(rootDir) {
  function walk(dir, relPath) {
    const entries = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.name !== '.git')
      .sort((a, b) => a.name.localeCompare(b.name));

    return entries.map((entry) => {
      const entryRelPath = relPath ? `${relPath}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        return {
          type: 'dir',
          name: entry.name,
          path: entryRelPath,
          children: walk(path.join(dir, entry.name), entryRelPath),
        };
      }
      return { type: 'file', name: entry.name, path: entryRelPath };
    });
  }

  return walk(rootDir, '');
}
