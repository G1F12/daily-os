# DAILY OS

Production: https://daily-os-virid.vercel.app/

A lightweight iPhone-first PWA for daily routines, day completion, streaks and weight. No backend, account, cookies or analytics. React + TypeScript + Vite; no chart or UI library.

## Run locally

Node.js 22+ (22.12+ recommended):

```sh
npm ci
npm run dev
```

## Check and build

```sh
npm run check
npm test
npm run preview
```

`npm test` builds the app before running 89 checks (24 original + 32 v1.1 + 33 v1.2), including offline-shell verification.

## v1.1

Today shows last weight, yesterday delta or the preceding seven-day average. Checkbox changes have a six-second Undo. Progress adds weekly task totals, a 30-day completion calendar and weight charts for 7D / 30D / 90D / ALL, with measured points and a period-average line. History separates completed and incomplete snapshot tasks.

Database `daily-os`, database version 1 and state schema 1 are retained. Migration is additive and idempotent: existing tasks, snapshots, weights, settings and derived streaks remain intact. Export envelope version 2 adds a last-export timestamp; imports accept v1 and v2 envelopes plus legacy raw states. Restore keeps a temporary in-memory copy and uses one atomic transaction. Validation failures or aborted writes retain the previous committed data.

Settings reports storage, offline readiness, app version 1.1.0 and last backup. Updates check again on resume and expose Reload when the new service worker is waiting.

The production build generates a versioned service worker and precaches the entire app shell. Development mode intentionally does not register a service worker.

## Install on iPhone

Open the production URL in **Safari → Share → Add to Home Screen → Add**. Open it online once and check Settings for **Ready for offline use**. Then daily routines, charts, settings and backups work offline. Use the installed app consistently: Safari and a standalone PWA can have separate storage, depending on iOS. Export/import to move data between them.

## Local data and backups

All tasks, settings, daily task snapshots and weight measurements live in **IndexedDB**, database `daily-os`. An atomic transaction writes each change. No data is transmitted to a server. Streaks are derived from saved completed dates, so one date cannot count twice. Separate tabs refresh through BroadcastChannel.

**Settings → Export Data** downloads a JSON file. Save it to Files or iCloud Drive. **Import Data** validates schema, tasks, calendar dates, completion IDs/percentages and weights, displays a summary and requires confirmation before replacing existing data. You can export your existing records from that confirmation dialog first. Invalid imports leave existing data intact.

Deleting the app or clearing Safari website data may remove local records. There is no cloud sync or automatic backup.

## Calendar and schedule rules

Calendar IDs use `YYYY-MM-DD` in **Europe/Warsaw**, including daylight-saving changes. The app refreshes on resume/focus and checks for rollover while open. Closed days are materialized on the next launch. Future dates are never counted.

Each day freezes its scheduled task snapshot when created. **Routine and training changes apply from tomorrow**; today and past records retain their original tasks. Each task has equal weight. There are 7 default daily tasks and 8 on Tuesday/Thursday/Saturday. Empty days do not count as completed streak days.

The current streak includes today if complete, otherwise consecutive completed days ending yesterday. A missed full day breaks it. Best streak is recomputed from history. Weekly task completion includes elapsed days only; completed days use the full Monday–Sunday week out of 7.

Weights are unique per calendar date; editing replaces that date’s value. Weight is stored as a typed measurement (`kind`, `value`, `unit`) so other body measurements can be added later. The 7-day average uses only recorded values in the last 7 calendar days; missing dates are not interpolated. Changes compare the latest weigh-in with the exact reference dates. The SVG chart filters 7D / 30D / 90D / ALL by calendar date, with measured points and no estimated entries.

## PWA and updates

Includes install manifest, PNG icons, Apple metadata, safe-area insets, dark/light/system themes, keyboard-accessible dialogs and reduced-motion support. New app versions show an update button; updates never replace user data. IndexedDB storage remains subject to iOS storage policies, so export regularly.

## Deploy

Connect this repository to Vercel. Framework: Vite. Build: `npm run build`. Output: `dist`. No environment variables are needed. Deploy main to production. No server routes are required.

## v1.2.0

Adds a compact offline daily reflection/quote with Share/Copy, intentional Rest Days, optional gain/loss weight goals, 6M/1Y weight views and 7/30/90-day completion analytics. Rest days preserve task/weight records, neither increase nor break streaks, and are excluded from task denominators. Resume restores the original day. Perfect days count complete, non-rest snapshots. Consistency is ordinary task completion; unrecorded dates are not invented.

### Quotes and attribution

The local pool has 153 entries: 152 original editorial reflections **inspired by** themes associated with 20 real people and six fictional characters, plus one short verified Steve Jobs quotation from his [2005 Stanford address](https://news.stanford.edu/stories/2005/06/youve-got-find-love-jobs-says). Reflections are explicitly labelled as original, not literal quotations, both in UI and shared text. Categories include philosophy, science, sport, practice, leadership, writing and fictional characters; fictional entries are 12/153, including Satoru Gojo. No quote API, network request or runtime AI. A deterministic date ordinal selects an entry in Europe/Warsaw; a versioned localStorage date/ID pin preserves today's selection across reloads and future append-only pool updates. IDs and text must remain stable. The selection cycles after 153 days.

### Data compatibility and update safety

IndexedDB remains `daily-os`, version **1**, store `state`, key `main`, state schema **1**. There is no database deletion, upgrade transaction or destructive migration. Optional `DailyRecord.restDay` and `Settings.weightGoal` are additive. Legacy records remain unchanged until an intentional user action. Stored structure is checked before mutation; unreadable state is not overwritten. Streaks remain derived from snapshots. Export uses envelope version **3**; imports accept v1/v2/v3 and legacy raw states. Goal baselines, enabled state and Rest Days round-trip; validation and single-transaction rollback preserve previous records on failure.

A new worker precaches the complete shell before activation, waits for **Reload** or dismissal with **Later**, and checks on resume. Activation retains the previous shell's hashed JS/CSS for already open tabs, then deletes only old `daily-os-*` static caches. It never accesses or clears IndexedDB. Updates require an online visit; daily features remain offline.

### Browser regression tests

```sh
npm ci
npx playwright install --with-deps chromium
npm test
npm run test:legacy
npm run test:e2e
```

The legacy fixture builds the exact v1.1 production commit `4663288501e1a65efb048fffd810d0fdac759626`. Three mobile viewports (390×844, 393×852, 430×932) cover interactions, no overflow, persistence and offline reopening. Ten reviewed visual baselines use 390×844. Use `npm run test:visual -- --project=iphone-390 --update-snapshots` only after reviewing intentional UI changes. Screenshots are Linux Chromium references; font/browser differences may require a reviewed baseline refresh. `DAILY_OS_TEST_URL` runs interaction smoke tests against a deployed preview/production without starting the local server. Tests use isolated browser profiles and synthetic records. Playwright is a dev dependency and never ships to users. No physical iPhone test is claimed.

## v1.3.0 implementation (release pending)

Money adds PLN cashflow with integer grosz amounts, separate starting balance, editable income/expenses, confirmation before deletion, Add/Delete Undo, monthly totals and compact category bars. All writes reuse the existing atomic IndexedDB transaction. Database/store/state-schema versions remain 1. Additive migration initialises empty Money and quote history without modifying legacy snapshots, weights, goals, settings or Rest Days. Backup export is v4; imports accept envelopes v1–v4 and legacy raw states.

The curated pool is 683 entries: 164 JJK-related, including 40 Gojo, 212 fictional total (31.04%) and 471 real-person reflections/quotes (68.96%). New entries are original editorial reflections and explicitly labelled **Inspired by**; they are not claimed character/person statements. The existing short verified Jobs quotation retains its source metadata. Seeded Fisher–Yates permutations are filtered to keep an author out of the previous seven days, including cycle boundaries; Sukuna aliases share one author key. Each complete cycle uses every ID exactly once. Date/history pins preserve selected IDs and visuals after updates, and the v1.2 same-day localStorage pin is migrated into IndexedDB. Missing IDs/assets have deterministic fallbacks.

Opening is claimed atomically once per Warsaw calendar day, after database load, with the same quote as Today. It auto-closes after 2.8 seconds or immediately on Tap to continue. A 180 ms fade is removed for reduced motion. The current visual is decoded before presentation; the worker precaches all 52 original compact SVG assets (40,198 bytes total, no external references), guaranteeing future offline openings after offline setup completes. No new library/backend/authentication is shipped.

### v1.3 QA

`npm test` passes 137 unit/integration tests; TypeScript and production build pass. Browser QA has now passed in the existing Vercel preview and a compatible Chromium sandbox: 64/64 local E2E declarations executed across 390×844, 393×852 and 430×932, plus 54/54 preview scenarios. This is synthetic Chromium QA, not physical iPhone testing. GitHub publication remains blocked by the connector's 403 write response; production was not changed.

`npm run test:legacy` builds exact production v1.2 SHA `68fcd44cc5fdd70411b98b0be93f21284bd7585f`. The E2E upgrade tests compare all legacy fields and verify empty additive Money. Six new snapshot scenarios were generated and reviewed. Existing v1.2 screenshots remain unchanged; the comparator masks only the intentional five-tab navigation and v1.3 version labels, and checks every other pixel with the established 1.5% tolerance. New Money screenshots cover the actual new navigation.

The GitHub Actions workflow runs build/unit tests, the legacy fixture, mobile scenarios and visual comparison. Missing new references must be reviewed and committed before release; the first run generates them as artifacts. Do not regenerate existing v1.2 references.
