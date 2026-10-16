'use strict';
const assert = require('assert');
const L = require('../js/logic.js');
const FOODS = require('../js/foods.js');

let n = 0;
function check(name, fn) { fn(); n++; console.log('ok - ' + name); }

// --- goal ---
check('goal: 2000 valid', () => assert.strictEqual(L.validateGoal(2000), null));
check('goal: 999 out of range', () => assert.strictEqual(L.validateGoal(999), 'goal_range'));
check('goal: 5001 out of range', () => assert.strictEqual(L.validateGoal(5001), 'goal_range'));
check('goal: 1000 and 5000 boundaries valid', () => {
  assert.strictEqual(L.validateGoal(1000), null);
  assert.strictEqual(L.validateGoal(5000), null);
});
check('goal: non-integer rejected', () => assert.strictEqual(L.validateGoal(2000.5), 'goal_integer'));

// --- entry validation ---
const ASOF = '2026-10-16';
const good = { id: 'e1', date: '2026-10-16', meal: 'lunch', name: 'Plain Rice', qty: 1.5, kcal: 200, protein: 4, carbs: 44, fat: 0.5 };
check('entry: valid DB-style entry', () => assert.deepStrictEqual(L.validateEntry(good, ASOF), []));
check('entry: future date rejected', () => assert.ok(L.validateEntry({ ...good, date: '2026-10-17' }, ASOF).includes('date_future')));
check('entry: bad date rejected', () => assert.ok(L.validateEntry({ ...good, date: '2026-02-30' }, ASOF).includes('date_invalid')));
check('entry: bad meal rejected', () => assert.ok(L.validateEntry({ ...good, meal: 'brunch' }, ASOF).includes('meal_invalid')));
check('entry: empty name rejected', () => assert.ok(L.validateEntry({ ...good, name: '   ' }, ASOF).includes('name_empty')));
check('entry: qty bounds', () => {
  assert.ok(L.validateEntry({ ...good, qty: 0 }, ASOF).includes('qty_range'));
  assert.ok(L.validateEntry({ ...good, qty: 21 }, ASOF).includes('qty_range'));
  assert.deepStrictEqual(L.validateEntry({ ...good, qty: 0.25 }, ASOF), []);
});
check('entry: kcal bounds', () => assert.ok(L.validateEntry({ ...good, kcal: 2001 }, ASOF).includes('kcal_range')));
check('entry: macros exceeding calories rejected', () => {
  assert.ok(L.validateEntry({ ...good, kcal: 50, protein: 100 }, ASOF).includes('macros_exceed'));
});

// --- totals ---
check('entryTotals: 1.5 x rice = 300 kcal', () => {
  assert.deepStrictEqual(L.entryTotals(good), { kcal: 300, protein: 6, carbs: 66, fat: 0.8 });
});
check('dayTotals: hand-verified 2 roti + 1.5 rice + 1 dal', () => {
  const entries = [
    { id: 'a', date: '2026-10-16', meal: 'breakfast', name: 'Roti', qty: 2, kcal: 120, protein: 3, carbs: 22, fat: 2 },
    { id: 'b', date: '2026-10-16', meal: 'lunch', name: 'Plain Rice', qty: 1.5, kcal: 200, protein: 4, carbs: 44, fat: 0.5 },
    { id: 'c', date: '2026-10-16', meal: 'lunch', name: 'Dal', qty: 1, kcal: 150, protein: 8, carbs: 22, fat: 3 },
    { id: 'd', date: '2026-10-15', meal: 'dinner', name: 'Other day', qty: 1, kcal: 999, protein: 0, carbs: 0, fat: 0 }
  ];
  const t = L.dayTotals(entries, '2026-10-16');
  assert.strictEqual(t.kcal, 690);
  assert.strictEqual(t.protein, 20);
  assert.strictEqual(t.carbs, 132);
  assert.strictEqual(t.fat, 7.8);
  assert.strictEqual(t.count, 3);
  assert.strictEqual(t.meals.breakfast.kcal, 240);
  assert.strictEqual(t.meals.lunch.kcal, 450);
  assert.strictEqual(t.meals.dinner.count, 0);
});
check('macroKcal/macroPct: 20P/132C/7.8F', () => {
  const mk = L.macroKcal({ protein: 20, carbs: 132, fat: 7.8 });
  assert.deepStrictEqual(mk, { protein: 80, carbs: 528, fat: 70.2 });
  const p = L.macroPct({ protein: 20, carbs: 132, fat: 7.8 });
  assert.strictEqual(p.protein + p.carbs + p.fat > 99 && p.protein + p.carbs + p.fat <= 100.2, true);
});
check('macroPct: zero totals -> all zero', () => assert.deepStrictEqual(L.macroPct({ protein: 0, carbs: 0, fat: 0 }), { protein: 0, carbs: 0, fat: 0 }));

// --- dates / 7-day ---
check('addDays: 2026-10-16 - 1 = 2026-10-15', () => assert.strictEqual(L.addDays('2026-10-16', -1), '2026-10-15'));
check('addDays: year boundary', () => assert.strictEqual(L.addDays('2026-01-01', -1), '2025-12-31'));
check('last7Days: 7 entries ending at view date', () => {
  const entries = [{ id: 'x', date: '2026-10-16', meal: 'lunch', name: 'Rice', qty: 1, kcal: 200, protein: 4, carbs: 44, fat: 0.5 }];
  const d = L.last7Days(entries, '2026-10-16');
  assert.strictEqual(d.length, 7);
  assert.strictEqual(d[0].date, '2026-10-10');
  assert.strictEqual(d[6].date, '2026-10-16');
  assert.strictEqual(d[6].kcal, 200);
  assert.strictEqual(d[0].kcal, 0);
});

// --- foods DB ---
check('foods: 43 items, unique ids, sane values', () => {
  assert.strictEqual(FOODS.length, 43);
  const ids = new Set(FOODS.map(f => f.id));
  assert.strictEqual(ids.size, 43);
  for (const f of FOODS) {
    assert.ok(f.kcal > 0, f.id + ' kcal');
    assert.ok(f.protein >= 0 && f.carbs >= 0 && f.fat >= 0, f.id + ' macros');
    assert.ok(f.protein * 4 + f.carbs * 4 + f.fat * 9 <= f.kcal + 100, f.id + ' macro-kcal consistency');
    assert.ok(f.bn.length > 0, f.id + ' Bengali name');
  }
});
check('searchFoods: english + Bengali + empty', () => {
  assert.strictEqual(L.searchFoods(FOODS, 'rice').some(f => f.id === 'rice'), true);
  assert.strictEqual(L.searchFoods(FOODS, '\u09ad\u09be\u09a4').some(f => f.id === 'rice'), true);
  assert.strictEqual(L.searchFoods(FOODS, '').length, 43);
  assert.strictEqual(L.searchFoods(FOODS, 'zzz-no-match').length, 0);
});

// --- digits / formatting ---
check('fmtInt Bengali digits: 2000 -> \u09e8,\u09e6\u09e6\u09e6', () => assert.strictEqual(L.fmtInt(2000, 'bn'), '\u09e8,\u09e6\u09e6\u09e6'));
check('fmtNumber Bengali digits: 7.5 -> \u09ed.\u09eb', () => assert.strictEqual(L.fmtNumber(7.5, 'bn'), '\u09ed.\u09eb'));
check('fmtInt English unchanged', () => assert.strictEqual(L.fmtInt(2000, 'en'), '2,000'));

// --- import/export ---
check('validateImport: valid round-trip', () => {
  const data = L.exportData(2000, [good]);
  const res = L.validateImport(data, ASOF);
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.data.goal, 2000);
  assert.strictEqual(res.data.entries.length, 1);
});
check('validateImport: wrong app rejected', () => {
  assert.strictEqual(L.validateImport({ app: 'other', version: 1, goal: 2000, entries: [] }, ASOF).error, 'import_wrong_app');
});
check('validateImport: wrong version rejected', () => {
  assert.strictEqual(L.validateImport({ app: L.APP_ID, version: 99, goal: 2000, entries: [] }, ASOF).error, 'import_version');
});
check('validateImport: duplicate id rejected', () => {
  const res = L.validateImport({ app: L.APP_ID, version: 1, goal: 2000, entries: [good, good] }, ASOF);
  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.error, 'import_duplicate_id');
});
check('validateImport: bad entry rejected', () => {
  const res = L.validateImport({ app: L.APP_ID, version: 1, goal: 2000, entries: [{ ...good, qty: 0 }] }, ASOF);
  assert.strictEqual(res.ok, false);
});
check('validateImport: bad goal rejected', () => {
  assert.strictEqual(L.validateImport({ app: L.APP_ID, version: 1, goal: 5, entries: [] }, ASOF).ok, false);
});
check('validateImport: 10 malformed shapes rejected', () => {
  const bad = [null, [], 'x', 42, {}, { app: L.APP_ID }, { app: L.APP_ID, version: 1 },
    { app: L.APP_ID, version: 1, goal: 2000 }, { app: L.APP_ID, version: 1, goal: 2000, entries: 'no' },
    { app: L.APP_ID, version: 1, goal: 2000, entries: [{ ...good, id: '' }] }];
  for (const b of bad) assert.strictEqual(L.validateImport(b, ASOF).ok, false, JSON.stringify(b));
});

console.log('\n' + n + '/' + n + ' node unit checks passed');
