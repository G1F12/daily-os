# DAILY OS v1.5.0 QA

Executed in the existing GitHub Codespace on 2026-10-08. Base: 1a74d3ab0a24bacc9318618e547f6a895912b0f7. Applied only APP_ONLY.patch, then QA/test corrections. ZIP manifest: 127/127 PASS.

## Results

- npm ci, npm run check and production build: PASS. Node 24.21.0; npm 11.19.0.
- Unit/integration: 169 PASS, zero failures or skips.
- Full Playwright: 106 PASS, 0 FAIL, 12 existing SKIP, 5.7 minutes. Skips are six v1.3 visuals on each of 393/430 px.
- 390x844, 393x852, 430x932: no horizontal overflow; original five tabs retained.
- Existing visual snapshots PASS unchanged, including Opening/JJK. 54 new images of More/modules/forms cover both themes and all three viewports; reviewed in the browser contact sheet and compared in the full regression.
- Backup v1-v6 imports, v6 module round trip, invalid backup rejection and atomic database rollback: PASS.
- Real Git fixtures v1.2/v1.3/v1.4 build: PASS. Real IndexedDB/service-worker upgrade to v1.5, old data/52 SVG preservation and offline reload: PASS across all three viewports.
- Warsaw midnight and 23/25-hour DST days, week totals, backwards clock refusal: PASS.
- Offline More and all four modules, paused reload/resume duration: PASS across all three viewports.

## Computer Use

Private Codespaces preview: Ideas CRUD and one-time task conversion/reload; Wishlist CRUD, explicit single Money expense (1000 to 975.10 PLN, one 24.90 Shopping entry), separate Mark only without expense; Nutrition partial manual macros, saved dishes, edit/delete/reload; Time manual entry/edit/delete and Start/Pause/reload/Resume/Stop: PASS. Forms have labelled inputs, named dialogs and close buttons.

## Corrections and preserved scope

Old tests now expect current backup v6/footer v1.5 while historical import versions remain tested. New timer test waits for persistence before clock changes and session assertions. New migration fixture expects its actual v1.4 version. No reproduced application defect required deviation from the supplied app patch. No changes to .github, life-ui.tsx, opening.tsx, quotes.ts, public assets or old snapshots.

## Build

JS index-BrLBYPh2.js: 348739 bytes. CSS index-xXWyep-t.css: 32831 bytes. Full dist: 452129 bytes. Cache daily-os-d762b29f72ee: 60 URLs, 449440 bytes of file content excluding root alias. 52 quote SVGs retained.

## Release gate

G1F12/daily-os; mallow4/daily-os; prj_A0btFBIr5DxzoP21e0nFuWBJRKW1; https://daily-os-virid.vercel.app. Preview/CI/source SHA/merge SHA/deployment ID will be recorded in PR and final report after release verification. Chromium mobile emulation and browser QA do not certify physical iPhone/Safari.
