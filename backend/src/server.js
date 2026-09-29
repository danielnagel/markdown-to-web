import 'dotenv/config';
import { createApp } from './app.js';
import { loadSources } from './config/index.js';
import { ensureCloned, pull } from './sync/git.js';
import { fullIndexBuild } from './sync/build.js';
import { scheduleSync } from './sync/cron.js';
import { sourceRoot } from './fs/paths.js';
import { ensureDemoUser } from './auth/users.js';

async function main() {
  // Without a secret jsonwebtoken would sign/verify with `undefined` and fail
  // on every login - better to refuse to start at all.
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }

  const sources = loadSources();

  if (process.env.MODE === 'demo') {
    await ensureDemoUser();
  }

  for (const source of sources) {
    if (source.type === 'git') {
      const freshlyCloned = await ensureCloned(source);
      if (!freshlyCloned) {
        await pull(source);
      }
    }
    fullIndexBuild(source.name, sourceRoot(source));
  }

  scheduleSync(sources.filter((s) => s.type === 'git'));

  const app = createApp(sources);
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Backend läuft auf Port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal error during startup:', err);
  process.exit(1);
});
