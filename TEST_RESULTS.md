# TEST_RESULTS  -  calorie-tracker-bd (run #71, 12:00 slot, 2026-10-16)

## Node unit tests  -  32/32 passed
Command: `node tests/test_logic.js`

- Goal validation: 2000 valid; 999 / 5001 out of range; 1000 / 5000
  boundaries valid; 2000.5 non-integer rejected.
- Entry validation: valid DB-style entry passes; future date, invalid date
  (2026-02-30), bad meal, empty name, qty 0 / 21, kcal 2001, and
  macros-exceeding-calories all rejected; qty 0.25 boundary passes.
- Math hand-verified: 1.5 x rice (200 kcal/serving) = 300 kcal / 6 g protein /
  66 g carbs / 0.8 g fat. Day scenario (2 roti + 1.5 rice + 1 dal) =
  690 kcal, 20 g protein, 132 g carbs, 7.8 g fat; breakfast 240, lunch 450;
  other-day entry excluded.
- Macro math: 20P/132C/7.8F -> 80 / 528 / 70.2 macro-kcal; percentages sum
  to ~100.1 (rounding); zero totals -> all-zero percentages.
- Dates: addDays across year boundary (2026-01-01 - 1 = 2025-12-31);
  last7Days returns 7 entries ending at the view date.
- Food DB: 43 items, unique IDs, all kcal > 0, macro-kcal <= kcal + 100
  for every item, every item has a Bengali name.
- Search: "rice" finds Plain Rice; Bengali search finds rice; empty query
  returns all 43; no-match returns 0.
- Formatting: fmtInt(2000, 'bn') renders Bengali digits with comma grouping;
  fmtNumber(7.5, 'bn') renders Bengali decimal; English unchanged.
- Import: valid export round-trips; wrong app / wrong version / duplicate ID /
  bad entry / bad goal rejected; 10 malformed shapes rejected.

Fix during testing (test-side only): macro-percentage sum assertion used a
<= 100.1 bound, but the float sum is 100.10000000000001; widened to 100.2.
No app-logic bug found.

## Headless-Chrome smoke  -  25/25 desktop + 25/25 mobile, 0 console/page errors
Command: `node tests/smoke.mjs both` (raw CDP, system Chromium, ?asof=2026-10-16)

Desktop 1280px and mobile 390px each verified: title, 4 tabs, default
eaten 0 / goal 2,000, food select 44 options (Custom + 43), foods table
43 rows, DB select auto-fills Plain Rice 200 kcal, 1.5 servings -> eaten
300 / remaining 1,700 / macro text Protein 6 g, reload persistence,
Bengali toggle (Bengali digits + Bengali title + button becomes English),
empty-name inline error with eaten unchanged, goal edit 2500 -> goal 2,500
/ remaining 2,200, Bengali food search -> 1 row, history shows 2026-10-16
with 300 kcal, chart has 7 bars, delete entry -> eaten 0, and
no-horizontal-overflow on all 4 tabs at each viewport.

## Source hygiene
- Pure-ASCII sources: Bengali text stored as \uXXXX escapes in JS and
  numeric entities in HTML (verified with grep -P for non-ASCII bytes).
- Zero network requests by design (static files + localStorage).
- No secrets in code. No fabricated data: food values are labeled
  approximate estimates; app ships empty (no demo log entries).
