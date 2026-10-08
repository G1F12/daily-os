# DAILY OS v1.3 implementation — preview QA complete, release blocked

Date: 2026-10-07. Authoritative parent: production v1.2.0, commit `68fcd44cc5fdd70411b98b0be93f21284bd7585f` in `G1F12/daily-os`.

This is a completed implementation with passing unit/integration checks and a production build, **not a verified release**. Browser scenarios and visual-reference scenarios are written and syntax-checked, but have not completed. Never describe them as PASS.

| Requested result | Evidence/status |
| --- | --- |
| Production URL | https://daily-os-virid.vercel.app — still v1.2.0 |
| GitHub release SHA | None: writes returned `403 Resource not accessible by integration` |
| Local source commits | `fe060b5d5a5ed7a0f22c32044caf30dfaa8d0a5d` implementation; `0452bc15e72093fab2bfbe5ec747262314d7a1f6` test timer/viewport corrections |
| Implemented version | 1.3.0 in package and Settings |
| TypeScript/build | PASS |
| Unit/integration | 137/137 PASS, 0 skipped |
| E2E | PASS: 64/64 executed across 390×844, 393×852, 430×932; preview functional run 54/54 |
| Visual regression | PASS: existing v1.2 visual suite preserved; 6 new v1.3 references generated and reviewed |
| v1.2→v1.3 migration | PASS: unit/integration plus real v1.2 shell upgrade and offline persistence |
| Existing user data | Production was not changed. Synthetic IndexedDB tests confirm rollback, serialized writes and legacy-field preservation. Actual iPhone records were not inspected |
| Money | Starting balance; income/expense; amount/title/category/date; edit; confirmed delete; Add/Delete Undo; grouped history; monthly totals/top category/bars |
| Arithmetic | Integer PLN grosz, decimal-string parsing; 1–10,000,000,000 grosz per operation; no fractional-number financial arithmetic; display-only division by 100 |
| Pool | 683 total, 164 JJK, 40 Gojo |
| Fictional/real | 212/471 = 31.04%/68.96%; JJK 24.01%; Gojo 24.39% of JJK |
| Rotation | Version/cycle seeded Fisher–Yates permutation, greedy author cooldown with deterministic retries, full-pool cycles, persistent date/visual pins |
| Author window | Previous 7 days, including cycle boundary; canonical Sukuna aliases |
| Visual assets | 52 original SVG compositions, 40,198 bytes uncompressed; 20,753 bytes summed individual gzip |
| Opening | Once per Europe/Warsaw calendar day; 2.8 s; Tap to continue; 180 ms fade; reduced motion removes fade and progress animation; focus trapped; same quote as Today |
| Offline Opening | PASS: browser offline next-day Opening loads bundled visual and Money remains writable |
| Backups | Export v4; v1/v2/v3/v4 import compatibility and atomic invalid-import preservation PASS |
| JS gzip before/after | 79,631 → 94,197 bytes (+14,566, +18.3%) |
| CSS gzip before/after | 5,070 → 5,825 bytes (+755, +14.9%) |
| Initial asset strategy | No external visual requests; one current visual decoded for display; remaining SVGs fetched for SW install only; all 40 KB precached, no full-resolution images |
| Preview smoke | PASS: Opening, Today quote consistency, Money CRUD/Undo/reload, backup v4, offline, History/Settings navigation |
| Production smoke | Not run: production intentionally remains v1.2 until GitHub publication is available |
| Physical iPhone | Not performed |

## Current release blocker

1. GitHub `create_tree` and branch creation for `G1F12/daily-os`: HTTP 403, `Resource not accessible by integration`. Repository metadata recognises the repository and reports push/admin, but the write operation remains unavailable. No force-push or unrelated repository was used.
2. Vercel preview access is restored. Preview is READY in the existing project `daily-os` (`daily-9kpxl3owm-mallow4.vercel.app`); no new project was created. Production was not promoted.

## Continue without restarting

Use the existing repository and this local continuation commit. Restore GitHub write permission, push branch `v1.3`, then promote the already verified preview to the existing production project and perform production smoke. No new architecture, repository or Vercel project is needed.

## Known limitations before production release

- Production smoke is pending because production was intentionally not changed.
- Currency is PLN; no account/backend/bank integration. Category changes use the small default category list (existing imported categories remain selectable).
- Visuals are original thematic geometric illustrations, not character portraits.
- New material consists of labelled original reflections; it is not a database of literal JJK dialogue.
- The pool is 683, exceeding the required minimum, below the optional 800–1000 preference.
- Import file size limit remains the existing 10 MB; users with exceptionally large backups would need a validated increase before importing them.
