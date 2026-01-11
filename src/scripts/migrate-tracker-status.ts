/**
 * One-time migration script to add status field to existing candidates.
 */

import { loadTracker, saveTracker } from '../pipeline/correction-tracker.js';

async function migrate() {
  console.log('Loading tracker...');
  const tracker = await loadTracker();

  let updated = 0;
  for (const [key, candidate] of Object.entries(tracker.candidates)) {
    if (!('status' in candidate)) {
      // @ts-expect-error - Adding new field
      candidate.status = 'pending';
      updated++;
    }
  }

  if (updated > 0) {
    console.log(`Updated ${updated} candidates with 'pending' status`);
    await saveTracker(tracker);
    console.log('✅ Migration complete!');
  } else {
    console.log('✅ All candidates already have status field');
  }
}

migrate();
