# Verification — DAILY OS v1.1.0

## Automated checks — PASS

- Strict TypeScript check and Vite production build passed.
- **56/56 tests: 24 original + 32 new**, zero failures or skipped tests.
- Lossless, deterministic and idempotent reading of existing v1 IndexedDB state tested with fake-indexeddb. Database name `daily-os`, database version 1 and state schema 1 retained. No database deletion.
- Same-day weight updates, no duplicates, yesterday/7D/30D changes, real-entry averages, missing dates and chart filtering tested.
- Weekly totals exclude future days; 30-day calendar states and snapshot details tested.
- Undo in both directions, date-scoped undo across midnight and streak idempotency tested.
- v1/v2/raw backup acceptance, malformed rejection, export timestamp and injected failed restore preserving existing data tested.
- Offline shell/cache and service worker installation, upgrade, cache cleanup and skip-waiting tested in a VM with network unavailable.
- Manifest, icon dimensions, safe-area and reduced-motion declarations pass.

## Preview acceptance — PASS

Vercel preview: https://daily-2htm7e7lc-mallow4.vercel.app/

- First launch, task completion and both Undo directions.
- Weight save closes dialog; current value prefilled; same-day edit replaces measurement.
- A real v1.0 export restored successfully; synthetic v1 fixture with 37 daily records and 7 weights accepted through confirmation.
- Weekly fixture result 16/22 = 73%; future days excluded.
- 7-day average 76.9 kg from 4 real measurements, yesterday delta -0.1 kg, 30-day delta -1.3 kg.
- Period filtering and point selection show recorded date/value; no missing-date measurements.
- Calendar complete/partial/missed states and snapshot Completed / Incomplete / Weight details.
- History shows all original daily and weight entries; Settings shows 1.1.0 and Offline Ready.

## Production smoke — PASS

Production: https://daily-os-virid.vercel.app/
Release merge: c819ece9c017d98f46dc142bf79f21e221b1f889

- Existing browser v1.0 state created before release (Omega-3 complete, weight 76.8).
- Old service worker detected update; Update activated v1.1; both records and 2/7 progress preserved.
- Task completion, Undo, same-day weight edit to 76.7; History retains exactly one weight entry.
- 7/7 = 100%, DAY COMPLETE, streak 1; reload preserves all values without incrementing streak.
- Removing a task recalculates streak to 0; Undo restores 1 without duplicate counting.
- Today, Progress, History, snapshot details, graph ALL selection and Settings verified.
- Export downloads v2; last-export timestamp displayed; confirmation and atomic restore complete successfully.
- Offline Ready shown after worker upgrade.
- Production index.html, sw.js, manifest.json and both PNG icons served HTTP 200 and are byte-identical to the tested build; sw.js uses Cache-Control: no-cache.

## Bundle size

| Asset | v1.0 raw / gzip | v1.1 raw / gzip |
| --- | --- | --- |
| JavaScript | 226.21 / 70.93 kB | 234.18 / 73.11 kB |
| CSS | 17.21 / 4.22 kB | 19.66 / 4.68 kB |

No new dependencies. Offline shell precaches 8 files.

## Verification limits

Physical iPhone/Safari v1.1, installed standalone process restart, mobile viewport overflow and actual browser offline reload are not available through the cloud browser API. Worker offline behavior and CSS/manifest pass automated checks; these do not substitute for physical-device acceptance. User verified v1.0 on a real iPhone. Test data remains only in isolated browser storage, never on a server.

---

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
