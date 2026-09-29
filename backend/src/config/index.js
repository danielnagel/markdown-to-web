import fs from 'node:fs';
import path from 'node:path';

export const DATA_DIR = process.env.DATA_DIR || './data';

const ENV_PLACEHOLDER = /^ENV:(.+)$/;

function resolveEnvPlaceholders(source) {
  const resolved = { ...source };
  if (typeof resolved.pat === 'string') {
    const match = resolved.pat.match(ENV_PLACEHOLDER);
    if (match) {
      const value = process.env[match[1]];
      if (!value) {
        throw new Error(`sources.config: env var "${match[1]}" referenced by source "${source.name}" is not set`);
      }
      resolved.pat = value;
    }
  }
  return resolved;
}

function validateSource(source) {
  if (!source.name || typeof source.name !== 'string') {
    throw new Error('sources.config: every source needs a string "name"');
  }
  if (source.type === 'git') {
    if (!source.url) throw new Error(`sources.config: git source "${source.name}" needs a "url"`);
  } else if (source.type === 'local') {
    if (!source.path) throw new Error(`sources.config: local source "${source.name}" needs a "path"`);
  } else {
    throw new Error(`sources.config: source "${source.name}" has unknown type "${source.type}"`);
  }
}

// MODE=demo ignores whatever sources.config.json is mounted and loads the
// baked-in demo dataset instead (see backend/Dockerfile, which COPYs
// demo/notes into ./demo-notes) - there is no external data or git access in
// demo mode.
function configPath() {
  if (process.env.MODE === 'demo') {
    return path.join(import.meta.dirname, '..', '..', 'sources.config.demo.json');
  }
  return process.env.SOURCES_CONFIG_PATH || path.join(import.meta.dirname, '..', '..', 'sources.config.json');
}

export function loadSources() {
  const configFile = configPath();
  const raw = fs.readFileSync(configFile, 'utf-8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('sources.config: expected a JSON array');
  }

  const names = new Set();
  return parsed.map((entry) => {
    validateSource(entry);
    if (names.has(entry.name)) {
      throw new Error(`sources.config: duplicate source name "${entry.name}"`);
    }
    names.add(entry.name);
    return resolveEnvPlaceholders(entry);
  });
}
