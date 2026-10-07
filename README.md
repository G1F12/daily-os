# DAILY OS

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
npm run build
npm run preview
```

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

Weights are unique per calendar date; editing replaces that date’s value. Weight is stored as a typed measurement (`kind`, `value`, `unit`) so other body measurements can be added later. The 7-day average uses only recorded values in the last 7 calendar days; missing dates are not interpolated. Changes compare the latest weigh-in with the exact reference dates. The SVG chart shows the last 30 entries with calendar-spaced points.

## PWA and updates

Includes install manifest, PNG icons, Apple metadata, safe-area insets, dark/light/system themes, keyboard-accessible dialogs and reduced-motion support. New app versions show an update button; updates never replace user data. IndexedDB storage remains subject to iOS storage policies, so export regularly.

## Deploy

Connect this repository to Vercel. Framework: Vite. Build: `npm run build`. Output: `dist`. No environment variables are needed. Deploy main to production. No server routes are required.
