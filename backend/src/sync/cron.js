import cron from 'node-cron';
import { pullAndDiff, sourceDir } from './git.js';
import { incrementalUpdate } from './build.js';

// Local sources get no live-watching (no chokidar) - they're only re-read at
// startup / container restart, since the primary focus is git sources and
// thousands-of-files scale.
export function scheduleSync(gitSources) {
  if (gitSources.length === 0) return;

  cron.schedule('*/15 * * * *', async () => {
    for (const source of gitSources) {
      try {
        const changes = await pullAndDiff(source);
        if (changes.length > 0) {
          incrementalUpdate(source.name, sourceDir(source.name), changes);
        }
      } catch (err) {
        console.error(`[sync] failed to sync source "${source.name}":`, err);
      }
    }
  });
}
