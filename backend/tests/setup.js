import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Runs before any test file's own imports (see vitest.config.js
// setupFiles), so DATA_DIR is already set by the time src/config/index.js
// (which reads it once at import time) is first imported.
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'mdweb-test-'));
process.env.JWT_SECRET = 'test-jwt-secret';

const { createUser, userExists } = await import('../src/auth/users.js');
if (!userExists('admin')) {
  // Low bcrypt cost factor keeps the test suite fast - security doesn't
  // matter for a throwaway test credential.
  await createUser('admin', 'password123', { rounds: 4 });
}
