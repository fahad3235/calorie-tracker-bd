(function (global) {
  'use strict';
  // Pure logic for calorie-tracker-bd. No DOM, no storage \u2014 fully unit-testable.
  var MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];
  var APP_ID = 'calorie-tracker-bd';
  var VERSION = 1;
  var MAX_ENTRIES = 5000;

  function isValidDateStr(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var d = new Date(s + 'T00:00:00');
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }
  function localDateStr(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  function todayStr(asof) {
    if (asof && isValidDateStr(asof)) return asof;
    return localDateStr(new Date());
  }
  function addDays(dateStr, n) {
    var d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return localDateStr(d);
  }
  function round1(x) { return Math.round(x * 10) / 10; }
  function isFiniteNumber(x) { return typeof x === 'number' && isFinite(x); }

  function validateGoal(goal) {
    if (!isFiniteNumber(goal) || goal % 1 !== 0) return 'goal_integer';
    if (goal < 1000 || goal > 5000) return 'goal_range';
    return null;
  }

  // Entry: {id, date, meal, name, qty, kcal, protein, carbs, fat}
  // kcal/protein/carbs/fat are PER SERVING; totals multiply by qty.
  function validateEntry(e, asof) {
    var errors = [];
    if (!e || typeof e !== 'object') return ['entry_object'];
    if (!isValidDateStr(e.date)) errors.push('date_invalid');
    else if (e.date > todayStr(asof)) errors.push('date_future');
    if (MEALS.indexOf(e.meal) === -1) errors.push('meal_invalid');
    if (typeof e.name !== 'string' || e.name.trim().length === 0) errors.push('name_empty');
    else if (e.name.trim().length > 80) errors.push('name_long');
    if (!isFiniteNumber(e.qty) || e.qty < 0.25 || e.qty > 20) errors.push('qty_range');
    if (!isFiniteNumber(e.kcal) || e.kcal < 0 || e.kcal > 2000) errors.push('kcal_range');
    if (!isFiniteNumber(e.protein) || e.protein < 0 || e.protein > 500) errors.push('protein_range');
    if (!isFiniteNumber(e.carbs) || e.carbs < 0 || e.carbs > 500) errors.push('carbs_range');
    if (!isFiniteNumber(e.fat) || e.fat < 0 || e.fat > 500) errors.push('fat_range');
    if (errors.length === 0 && e.kcal > 0) {
      var macroKcal = e.protein * 4 + e.carbs * 4 + e.fat * 9;
      if (macroKcal > e.kcal + 100) errors.push('macros_exceed');
    }
    return errors;
  }

  function entryTotals(e) {
    return {
      kcal: round1(e.qty * e.kcal),
      protein: round1(e.qty * e.protein),
      carbs: round1(e.qty * e.carbs),
      fat: round1(e.qty * e.fat)
    };
  }

  function dayEntries(entries, dateStr) {
    return (entries || []).filter(function (e) { return e.date === dateStr; });
  }

  function dayTotals(entries, dateStr) {
    var totals = { kcal: 0, protein: 0, carbs: 0, fat: 0, count: 0, meals: {} };
    MEALS.forEach(function (m) {
      totals.meals[m] = { kcal: 0, protein: 0, carbs: 0, fat: 0, count: 0 };
    });
    dayEntries(entries, dateStr).forEach(function (e) {
      var t = entryTotals(e);
      totals.kcal = round1(totals.kcal + t.kcal);
      totals.protein = round1(totals.protein + t.protein);
      totals.carbs = round1(totals.carbs + t.carbs);
      totals.fat = round1(totals.fat + t.fat);
      totals.count += 1;
      var mt = totals.meals[e.meal];
      mt.kcal = round1(mt.kcal + t.kcal);
      mt.protein = round1(mt.protein + t.protein);
      mt.carbs = round1(mt.carbs + t.carbs);
      mt.fat = round1(mt.fat + t.fat);
      mt.count += 1;
    });
    return totals;
  }

  function macroKcal(totals) {
    return {
      protein: round1(totals.protein * 4),
      carbs: round1(totals.carbs * 4),
      fat: round1(totals.fat * 9)
    };
  }
  function macroPct(totals) {
    var mk = macroKcal(totals);
    var sum = mk.protein + mk.carbs + mk.fat;
    if (sum <= 0) return { protein: 0, carbs: 0, fat: 0 };
    return {
      protein: round1(mk.protein / sum * 100),
      carbs: round1(mk.carbs / sum * 100),
      fat: round1(mk.fat / sum * 100)
    };
  }

  // Last 7 days ending at endDateStr (inclusive), oldest first.
  function last7Days(entries, endDateStr) {
    var out = [];
    for (var i = 6; i >= 0; i--) {
      var d = addDays(endDateStr, -i);
      var t = dayTotals(entries, d);
      out.push({ date: d, kcal: t.kcal, count: t.count });
    }
    return out;
  }

  function searchFoods(foods, q) {
    var needle = (q || '').trim().toLowerCase();
    if (!needle) return foods.slice();
    return foods.filter(function (f) {
      return f.en.toLowerCase().indexOf(needle) !== -1 ||
        f.bn.indexOf(needle) !== -1 ||
        f.id.toLowerCase().indexOf(needle) !== -1;
    });
  }

  var BN_DIGITS = ['\u09e6', '\u09e7', '\u09e8', '\u09e9', '\u09ea', '\u09eb', '\u09ec', '\u09ed', '\u09ee', '\u09ef'];
  function toBnDigits(str) {
    return String(str).replace(/[0-9]/g, function (d) { return BN_DIGITS[Number(d)]; });
  }
  function fmtNumber(n, lang) {
    var s = Number(n).toLocaleString('en-US', { maximumFractionDigits: 1 });
    return lang === 'bn' ? toBnDigits(s) : s;
  }
  function fmtInt(n, lang) {
    var s = Math.round(Number(n)).toLocaleString('en-US');
    return lang === 'bn' ? toBnDigits(s) : s;
  }

  function validateImport(obj, asof) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { ok: false, error: 'import_not_object' };
    if (obj.app !== APP_ID) return { ok: false, error: 'import_wrong_app' };
    if (obj.version !== VERSION) return { ok: false, error: 'import_version' };
    var gErr = validateGoal(obj.goal);
    if (gErr) return { ok: false, error: 'import_goal' };
    if (!Array.isArray(obj.entries)) return { ok: false, error: 'import_entries' };
    if (obj.entries.length > MAX_ENTRIES) return { ok: false, error: 'import_too_many' };
    var ids = {};
    for (var i = 0; i < obj.entries.length; i++) {
      var e = obj.entries[i];
      var errs = validateEntry(e, asof);
      if (errs.length) return { ok: false, error: 'import_entry_' + i + '_' + errs[0] };
      if (typeof e.id !== 'string' || !e.id) return { ok: false, error: 'import_entry_id' };
      if (ids[e.id]) return { ok: false, error: 'import_duplicate_id' };
      ids[e.id] = true;
    }
    return { ok: true, data: { goal: obj.goal, entries: obj.entries } };
  }

  function exportData(goal, entries) {
    return { app: APP_ID, version: VERSION, goal: goal, entries: entries };
  }

  var api = {
    MEALS: MEALS, APP_ID: APP_ID, VERSION: VERSION, MAX_ENTRIES: MAX_ENTRIES,
    isValidDateStr: isValidDateStr, todayStr: todayStr, addDays: addDays,
    round1: round1, validateGoal: validateGoal, validateEntry: validateEntry,
    entryTotals: entryTotals, dayEntries: dayEntries, dayTotals: dayTotals,
    macroKcal: macroKcal, macroPct: macroPct, last7Days: last7Days,
    searchFoods: searchFoods, toBnDigits: toBnDigits, fmtNumber: fmtNumber,
    fmtInt: fmtInt, validateImport: validateImport, exportData: exportData
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.CalorieLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
