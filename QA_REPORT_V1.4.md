# DAILY OS v1.4.0 — release QA

## Scope and provenance

Release branch: v1.4-release, based on main 177bcf7000122c12e697c0a7099344ec29d07ade. Original app base: abe764f7693ce2a386643222a31b2a33cd4a3473. All 124 archive SHA-256 entries verified. APP-ONLY patch passed git apply --check before application.

Adds One-time Tasks, School, Daily Review and Weekly Report. Original Opening, 683 quotes, 52 SVG assets, existing colours and five-tab navigation retained. No Character Opening, portraits or Opening Atmosphere added. CI/font configuration and TESTING.md unchanged.

## Validation

- npm ci, TypeScript check, 153 unit tests, legacy fixture builds and production build: PASS.
- Real v1.3-to-v1.4 upgrade and targeted feature/visual regressions: 22 passed, 12 intentionally skipped (duplicate legacy visual cases outside the reference viewport).
- New visual references: 24 reviewed images, dark/light Today + expanded review, School, task form, Progress + Weekly Report across 390x844, 393x852 and 430x932. New baseline generation: 3 passed. Modal form uses a viewport screenshot; full-page capture is unstable for its fixed overlay.
- Existing v1.3 Opening/Money visual references preserved. Legacy full-page comparison removes only additive Life/Review/Weekly panels in the test DOM, preserving original reference images.
- Final complete E2E: 82 passed, 12 intentionally skipped, zero failures (4.4 minutes). Final TypeScript, 153 unit tests and production build rerun: PASS.

## Functional and migration evidence

One-time task create/edit/complete/reopen/delete confirmation, priorities, overdue and future-task access covered. Fixed future tasks becoming inaccessible from Today by adding All tasks; priority breaks equal-deadline ties. School subjects and homework/test/project types covered. Daily Review and Weekly Report persist independently of routine completion, streak, Rest Day and Perfect Day.

Money regression: 1000 - 24.90 + 200 = 1175.10 zl. Weight, goal, preferences, recurring task snapshots, history, Money, quoteHistory and last Opening date survive upgrading the actual built v1.3 app, on all three viewports. IndexedDB remains daily-os v1/state/main with additive life data. Backup v5 export/import, v1-v4 and raw-state import, malformed-import atomicity covered by model/browser tests. Service worker update and offline reload preserve state; all 52 distinct SVGs remain cached.

Manual isolated preview check: synthetic School test marked complete appeared in Daily Review while routines stayed 0/8. No production user state was cleared or replaced. Physical iPhone/Safari was not tested; these are Chromium mobile viewport checks.

## Release gates

PR CI, Vercel preview/offline QA, main merge and production smoke are recorded in the PR after completion. Production remains gated on successful QA.
