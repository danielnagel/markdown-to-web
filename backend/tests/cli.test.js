import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { beforeEach, describe, expect, it } from 'vitest';

const cliDir = path.join(import.meta.dirname, '..', 'src', 'cli');

let dataDir;

beforeEach(() => {
  // Each test gets its own empty DATA_DIR, so users.sqlite starts empty.
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdweb-cli-test-'));
});

// Runs a CLI script as a real child process (like `npm run user:create`
// would) and returns its exit code and captured stdout/stderr.
function runCli(scriptName, args = []) {
  const result = spawnSync(process.execPath, [path.join(cliDir, scriptName), ...args], {
    env: { ...process.env, DATA_DIR: dataDir },
    encoding: 'utf8',
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

describe('user:create CLI', () => {
  it('creates a new user', () => {
    const result = runCli('userCreate.js', ['alice', 'supersecret1']);

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/User created: alice/);
    expect(runCli('userList.js').stdout).toMatch(/alice/);
  });

  it('fails without both arguments', () => {
    const result = runCli('userCreate.js', ['alice']);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/Usage/);
  });

  it('fails for a too-short password', () => {
    const result = runCli('userCreate.js', ['alice', 'short']);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/at least/);
  });

  it('fails for a username that already exists', () => {
    runCli('userCreate.js', ['alice', 'supersecret1']);
    const result = runCli('userCreate.js', ['alice', 'supersecret2']);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/already exists/);
  });
});

describe('user:list CLI', () => {
  it('reports when there are no users', () => {
    const result = runCli('userList.js');

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/No users exist/);
  });

  it('lists users with creation date and last login', () => {
    runCli('userCreate.js', ['alice', 'supersecret1']);
    const result = runCli('userList.js');

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/alice\s+\(created: \d{4}-\d{2}-\d{2}T.*, last login: never\)/);
  });
});
