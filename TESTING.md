# Verification — DAILY OS v1.0.0

## Completed

- Strict TypeScript check: PASS (`npm run check`, also part of build).
- Vite production build: PASS.
- Automated suite: **24 / 24 PASS**, Node.js + fake-indexeddb + service-worker VM.
- JavaScript: 226.21 kB raw / 70.93 kB gzip.
- CSS: 17.21 kB raw / 4.22 kB gzip.
- Offline app shell: 8 files precached with a content-versioned cache.
- Atomic IndexedDB read/modify/write, reload persistence, concurrent writes and rollback.
- Default tasks, checkbox changes, weight create/update and historical weight records.
- 5/7 = 71%, 100% complete, date-derived streak without duplicate counting.
- Calendar rollover, missed days, Warsaw midnight and daylight-saving transitions.
- Default Gym weekdays and modified schedules applied to new snapshots.
- Historical snapshots unaffected by routine edits/deletion/disabling.
- Weekly statistics, exact-date weight deltas and seven-calendar-day averages.
- JSON export/import round-trip, rejection of malformed backup data.
- Manifest standalone/scope/start URL, actual PNG dimensions, Apple metadata.
- Safe-area and reduced-motion CSS declarations.
- Worker cache installation, cleanup and shell/asset responses with networking unavailable.

## Production browser acceptance — PASS

Production: https://daily-os-virid.vercel.app/ (Vercel Production / Ready).

- First launch: seven Wednesday tasks, no Gym.
- Checkbox progress: 1/7 = 14%, 5/7 = 71%, 7/7 = 100% / DAY COMPLETE.
- Weight 76.8 kg saved; same-day edit to 76.6 kg leaves one weight entry.
- Reload and close/reopen browser tab preserve tasks, weight and streak.
- Current/best streak stay at one after repeated reloads.
- Today, Progress, History and day-detail snapshot render correctly.
- Settings: create, rename, select period, disable and delete a test routine.
- Gym weekday editing updates its schedule; defaults restored afterward.
- JSON downloaded and restored through the file picker and confirmation preview.
- Settings reports Ready for offline use after service-worker installation.
- Production manifest served correctly; production sw.js byte-identical to tested build.
- No horizontal overflow at the available desktop viewport.
- No application-origin errors observed; cloud-browser extension messages excluded.

## Verification limits

A physical iPhone/Safari, installed standalone process restart, mobile viewport overflow,
and actual browser offline reload were not available in the cloud-browser API.
Safe-area declarations and offline worker behavior passed static/VM tests, but these
are not substitutes for physical-device acceptance. No claim is made that these
physical-device checks passed.

## Release status

GitHub main is connected to Vercel. v1.0.0 is live in Production, not only Preview.
Test data used above remains only in the isolated test browser, never on a server.
