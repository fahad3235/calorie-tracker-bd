# Calorie Tracker BD

Offline bilingual (English / Bangla) daily calorie & macro tracker for Bangladesh,
with a 43-item Bangladeshi food database. Everything runs in the browser  - 
no server, no account, no network requests.

## Problem

People tracking what they eat in Bangladesh usually juggle a notebook or a
foreign app with no local foods (bhat, dal, ruti, biryani, fuchka). This app
keeps daily calorie + macro tracking simple, local, and fully offline.

## Features

- **Daily log**  -  add entries per meal (Breakfast / Lunch / Dinner / Snack)
  with servings, kcal, protein, carbs, fat; edit-free delete.
- **43-food Bangladeshi database**  -  pick a food to auto-fill its values,
  or enter a fully custom food.
- **Daily goal**  -  editable kcal goal (1000-5000), eaten / remaining /
  progress bar, over-goal highlighting.
- **Meal breakdown + macros**  -  per-meal kcal cards, macro split bar
  (protein / carbs / fat) with grams and macro-kcal.
- **7-day chart**  -  SVG bar chart of daily kcal with a goal line.
- **30-day history**  -  per-day kcal, entry count, over/under-goal status.
- **Food browser**  -  search the database by English or Bangla name.
- **Data**  -  JSON export / strict import (wrong app, version, duplicate IDs,
  and malformed entries all rejected with data intact), typed-DELETE erase-all.
- **Bilingual**  -  EN / Bangla toggle persisted, Bengali digits in Bangla mode.
- **Offline & private**  -  localStorage only; zero network requests.

## Stack

Vanilla HTML / CSS / JavaScript. No frameworks, no build step, no dependencies.

## Prerequisites

Any modern browser (Chrome / Edge / Firefox / Safari). For the tests: Node.js 18+.

## Install / Run

No install needed. Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Dev commands

```bash
node tests/test_logic.js   # 32 node unit checks
node tests/smoke.mjs both  # headless-Chrome smoke: 25 desktop + 25 mobile checks
```

The smoke test uses the system Chromium at `/opt/meta-chromium/chrome`
(fallback: any Chrome on PATH) and the raw Chrome DevTools Protocol  - 
no puppeteer dependency. Append `?asof=YYYY-MM-DD` to the page URL to
pin "today" for deterministic testing.

## Testing

- `tests/test_logic.js`  -  pure-logic checks: goal/entry validation, exact
  totals math (2 roti + 1.5 rice + 1 dal = 690 kcal), macro math, 7-day
  windowing, food-database integrity (43 items, unique IDs, macro-kcal
  consistency), Bengali-digit formatting, import validation (10 malformed
  shapes rejected).
- `tests/smoke.mjs`  -  real-browser checks: DB auto-fill, add entry,
  reload persistence, BN toggle + Bengali digits, inline validation,
  goal edit, Bengali search, history, 7-bar chart, delete, and
  no-horizontal-overflow on all 4 tabs at 1280px and 390px.

## Deployment

Static site  -  deploy the folder as-is to GitHub Pages, Netlify, or any
static host. No build step, no environment variables.

## Limitations

- Food-database values are **approximate cookbook averages** per serving,
  not lab-measured values. They are a starting point for personal tracking.
- This is a personal tracker, **not medical or nutrition advice**. It does
  not estimate BMR/TDEE, set goals for you, or diagnose anything.
- Data lives in one browser's localStorage  -  export JSON to move or back up.
- No barcode scanning, no photo logging, no multi-user support.

## Status

MVP complete. Tests: 32/32 node unit + 25/25 desktop smoke + 25/25 mobile
smoke, 0 console/page errors. See `TEST_RESULTS.md` for the verified run.
