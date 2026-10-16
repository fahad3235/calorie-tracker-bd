(function () {
  'use strict';
  var L = window.CalorieLogic;
  var FOODS = window.FOODS || [];
  var STORE_KEY = 'calorie-tracker-bd-v1';
  var ASOF = new URLSearchParams(window.location.search).get('asof');
  var today = L.todayStr(ASOF);

  var I18N = {
    en: {
      app_title: 'Calorie Tracker BD', tab_today: 'Today', tab_foods: 'Foods', tab_history: 'History', tab_data: 'Data',
      date_label: 'Date', goal_label: 'Daily goal (kcal)', save: 'Save', eaten: 'Eaten', goal: 'Goal', remaining: 'Remaining', entries: 'Entries',
      add_entry: 'Add entry', meal: 'Meal', food_db: 'From food database', custom: 'Custom\u2026', food_name: 'Food name', qty: 'Servings',
      kcal_serv: 'kcal / serving', protein_serv: 'Protein (g) / serving', carbs_serv: 'Carbs (g) / serving', fat_serv: 'Fat (g) / serving',
      add_entry_btn: 'Add entry', meals_today: 'Meals today', macros: 'Macros', entries_today: 'Entries today',
      no_entries: 'No entries yet for this day.', last7: 'Last 7 days',
      food_db_title: 'Food database', food_db_note: 'Approximate values per serving, for personal tracking only.',
      search: 'Search', th_food: 'Food', th_serving: 'Serving', th_protein: 'Protein', th_carbs: 'Carbs', th_fat: 'Fat',
      history_title: 'Last 30 days', th_date: 'Date', th_entries: 'Entries', th_goal: 'Goal', th_status: 'Status',
      data_title: 'Export / Import / Erase', export: 'Export JSON', import: 'Import JSON', erase: 'Erase all data',
      erase_hint: 'Type DELETE to confirm.', erase_btn: 'Erase everything',
      footer_disclaimer: 'Personal tracker. Food values are approximate estimates, not medical or nutrition advice. Everything stays in your browser.',
      meal_breakfast: 'Breakfast', meal_lunch: 'Lunch', meal_dinner: 'Dinner', meal_snack: 'Snack',
      add: 'Add', delete: 'Delete', over: 'Over goal', under: 'Under goal', no_entries_short: 'No entries',
      of_goal: 'of goal', protein: 'Protein', carbs: 'Carbs', fat: 'Fat', serving: 'serving', kcal: 'kcal',
      err_date_invalid: 'Invalid date.', err_date_future: 'Date cannot be in the future.', err_meal_invalid: 'Invalid meal.',
      err_name_empty: 'Enter a food name.', err_name_long: 'Food name is too long (max 80).',
      err_qty_range: 'Servings must be 0.25\u201320.', err_kcal_range: 'kcal must be 0\u20132000.',
      err_protein_range: 'Protein must be 0\u2013500 g.', err_carbs_range: 'Carbs must be 0\u2013500 g.', err_fat_range: 'Fat must be 0\u2013500 g.',
      err_macros_exceed: 'Macros exceed calories \u2014 check the numbers.',
      err_goal_integer: 'Goal must be a whole number.', err_goal_range: 'Goal must be 1000\u20135000 kcal.',
      import_ok: 'Imported.', import_fail: 'Import failed.', erase_done: 'All data erased.', erase_wrong: 'Type DELETE to erase.',
      goal_saved: 'Goal saved.'
    },
    bn: {
      app_title: '\u0995\u09cd\u09af\u09be\u09b2\u09cb\u09b0\u09bf \u099f\u09cd\u09b0\u09cd\u09af\u09be\u0995\u09be\u09b0 \u09ac\u09bf\u09a1\u09bf', tab_today: '\u0986\u099c\u0995\u09c7', tab_foods: '\u0996\u09be\u09ac\u09be\u09b0', tab_history: '\u0987\u09a4\u09bf\u09b9\u09be\u09b8', tab_data: '\u09a1\u09c7\u099f\u09be',
      date_label: '\u09a4\u09be\u09b0\u09bf\u0996', goal_label: '\u09a6\u09c8\u09a8\u09bf\u0995 \u09b2\u0995\u09cd\u09b7\u09cd\u09af (kcal)', save: '\u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3', eaten: '\u0996\u09be\u0993\u09af\u09bc\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7', goal: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af', remaining: '\u09ac\u09be\u0995\u09bf', entries: '\u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf',
      add_entry: '\u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8', meal: '\u09ac\u09c7\u09b2\u09be', food_db: '\u0996\u09be\u09ac\u09be\u09b0\u09c7\u09b0 \u09a1\u09c7\u099f\u09be\u09ac\u09c7\u09b8 \u09a5\u09c7\u0995\u09c7', custom: '\u09a8\u09bf\u099c\u09c7\u09b0 \u09ae\u09a4\u09cb\u2026', food_name: '\u0996\u09be\u09ac\u09be\u09b0\u09c7\u09b0 \u09a8\u09be\u09ae', qty: '\u09aa\u09b0\u09bf\u09ac\u09c7\u09b6\u09a8',
      kcal_serv: 'kcal / \u09aa\u09b0\u09bf\u09ac\u09c7\u09b6\u09a8', protein_serv: '\u09aa\u09cd\u09b0\u09cb\u099f\u09bf\u09a8 (\u0997\u09cd\u09b0\u09be\u09ae) / \u09aa\u09b0\u09bf\u09ac\u09c7\u09b6\u09a8', carbs_serv: '\u09b6\u09b0\u09cd\u0995\u09b0\u09be (\u0997\u09cd\u09b0\u09be\u09ae) / \u09aa\u09b0\u09bf\u09ac\u09c7\u09b6\u09a8', fat_serv: '\u099a\u09b0\u09cd\u09ac\u09bf (\u0997\u09cd\u09b0\u09be\u09ae) / \u09aa\u09b0\u09bf\u09ac\u09c7\u09b6\u09a8',
      add_entry_btn: '\u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8', meals_today: '\u0986\u099c\u0995\u09c7\u09b0 \u09ac\u09c7\u09b2\u09be', macros: '\u09ae\u09cd\u09af\u09be\u0995\u09cd\u09b0\u09cb', entries_today: '\u0986\u099c\u0995\u09c7\u09b0 \u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf',
      no_entries: '\u098f\u0987 \u09a6\u09bf\u09a8\u09c7 \u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u09a8\u09c7\u0987\u0964', last7: '\u09b6\u09c7\u09b7 \u09ed \u09a6\u09bf\u09a8',
      food_db_title: '\u0996\u09be\u09ac\u09be\u09b0\u09c7\u09b0 \u09a1\u09c7\u099f\u09be\u09ac\u09c7\u09b8', food_db_note: '\u09aa\u09cd\u09b0\u09a4\u09bf \u09aa\u09b0\u09bf\u09ac\u09c7\u09b6\u09a8\u09c7\u09b0 \u0986\u09a8\u09c1\u09ae\u09be\u09a8\u09bf\u0995 \u09ae\u09be\u09a8, \u09b6\u09c1\u09a7\u09c1 \u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u0997\u09a4 \u099f\u09cd\u09b0\u09cd\u09af\u09be\u0995\u09bf\u0982\u09af\u09bc\u09c7\u09b0 \u099c\u09a8\u09cd\u09af\u0964',
      search: '\u0996\u09c1\u0981\u099c\u09c1\u09a8', th_food: '\u0996\u09be\u09ac\u09be\u09b0', th_serving: '\u09aa\u09b0\u09bf\u09ac\u09c7\u09b6\u09a8', th_protein: '\u09aa\u09cd\u09b0\u09cb\u099f\u09bf\u09a8', th_carbs: '\u09b6\u09b0\u09cd\u0995\u09b0\u09be', th_fat: '\u099a\u09b0\u09cd\u09ac\u09bf',
      history_title: '\u09b6\u09c7\u09b7 \u09e9\u09e6 \u09a6\u09bf\u09a8', th_date: '\u09a4\u09be\u09b0\u09bf\u0996', th_entries: '\u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf', th_goal: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af', th_status: '\u0985\u09ac\u09b8\u09cd\u09a5\u09be',
      data_title: '\u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f / \u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f / \u09ae\u09c1\u099b\u09c1\u09a8', export: 'JSON \u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f', import: 'JSON \u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f', erase: '\u09b8\u09ac \u09a1\u09c7\u099f\u09be \u09ae\u09c1\u099b\u09c1\u09a8',
      erase_hint: '\u09a8\u09bf\u09b6\u09cd\u099a\u09bf\u09a4 \u0995\u09b0\u09a4\u09c7 DELETE \u09b2\u09bf\u0996\u09c1\u09a8\u0964', erase_btn: '\u09b8\u09ac \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09c1\u09a8',
      footer_disclaimer: '\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u0997\u09a4 \u099f\u09cd\u09b0\u09cd\u09af\u09be\u0995\u09be\u09b0\u0964 \u0996\u09be\u09ac\u09be\u09b0\u09c7\u09b0 \u09ae\u09be\u09a8 \u0986\u09a8\u09c1\u09ae\u09be\u09a8\u09bf\u0995, \u099a\u09bf\u0995\u09bf\u09ce\u09b8\u09be \u09ac\u09be \u09aa\u09c1\u09b7\u09cd\u099f\u09bf \u09aa\u09b0\u09be\u09ae\u09b0\u09cd\u09b6 \u09a8\u09af\u09bc\u0964 \u09b8\u09ac\u0995\u09bf\u099b\u09c1 \u0986\u09aa\u09a8\u09be\u09b0 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7\u0987 \u09a5\u09be\u0995\u09c7\u0964',
      meal_breakfast: '\u09b8\u0995\u09be\u09b2\u09c7\u09b0 \u09a8\u09be\u09b8\u09cd\u09a4\u09be', meal_lunch: '\u09a6\u09c1\u09aa\u09c1\u09b0\u09c7\u09b0 \u0996\u09be\u09ac\u09be\u09b0', meal_dinner: '\u09b0\u09be\u09a4\u09c7\u09b0 \u0996\u09be\u09ac\u09be\u09b0', meal_snack: '\u09a8\u09be\u09b8\u09cd\u09a4\u09be',
      add: '\u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8', delete: '\u09ae\u09c1\u099b\u09c1\u09a8', over: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af\u09c7\u09b0 \u09ac\u09c7\u09b6\u09bf', under: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af\u09c7\u09b0 \u0995\u09ae', no_entries_short: '\u0995\u09cb\u09a8\u09cb \u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u09a8\u09c7\u0987',
      of_goal: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af\u09c7\u09b0', protein: '\u09aa\u09cd\u09b0\u09cb\u099f\u09bf\u09a8', carbs: '\u09b6\u09b0\u09cd\u0995\u09b0\u09be', fat: '\u099a\u09b0\u09cd\u09ac\u09bf', serving: '\u09aa\u09b0\u09bf\u09ac\u09c7\u09b6\u09a8', kcal: 'kcal',
      err_date_invalid: '\u0985\u09ac\u09c8\u09a7 \u09a4\u09be\u09b0\u09bf\u0996\u0964', err_date_future: '\u09ad\u09ac\u09bf\u09b7\u09cd\u09af\u09a4\u09c7\u09b0 \u09a4\u09be\u09b0\u09bf\u0996 \u09a6\u09c7\u0993\u09af\u09bc\u09be \u09af\u09be\u09ac\u09c7 \u09a8\u09be\u0964', err_meal_invalid: '\u0985\u09ac\u09c8\u09a7 \u09ac\u09c7\u09b2\u09be\u0964',
      err_name_empty: '\u0996\u09be\u09ac\u09be\u09b0\u09c7\u09b0 \u09a8\u09be\u09ae \u09a6\u09bf\u09a8\u0964', err_name_long: '\u0996\u09be\u09ac\u09be\u09b0\u09c7\u09b0 \u09a8\u09be\u09ae \u0985\u09a8\u09c7\u0995 \u09b2\u09ae\u09cd\u09ac\u09be (\u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u09ee\u09e6)\u0964',
      err_qty_range: '\u09aa\u09b0\u09bf\u09ac\u09c7\u09b6\u09a8 \u09e6.\u09e8\u09eb\u2013\u09e8\u09e6 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964', err_kcal_range: 'kcal \u09e6\u2013\u09e8\u09e6\u09e6\u09e6 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_protein_range: '\u09aa\u09cd\u09b0\u09cb\u099f\u09bf\u09a8 \u09e6\u2013\u09eb\u09e6\u09e6 \u0997\u09cd\u09b0\u09be\u09ae \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964', err_carbs_range: '\u09b6\u09b0\u09cd\u0995\u09b0\u09be \u09e6\u2013\u09eb\u09e6\u09e6 \u0997\u09cd\u09b0\u09be\u09ae \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964', err_fat_range: '\u099a\u09b0\u09cd\u09ac\u09bf \u09e6\u2013\u09eb\u09e6\u09e6 \u0997\u09cd\u09b0\u09be\u09ae \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_macros_exceed: '\u09ae\u09cd\u09af\u09be\u0995\u09cd\u09b0\u09cb \u0995\u09cd\u09af\u09be\u09b2\u09cb\u09b0\u09bf\u09b0 \u099a\u09c7\u09af\u09bc\u09c7 \u09ac\u09c7\u09b6\u09bf \u2014 \u09b8\u0982\u0996\u09cd\u09af\u09be\u0997\u09c1\u09b2\u09cb \u09a6\u09c7\u0996\u09c1\u09a8\u0964',
      err_goal_integer: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af \u09aa\u09c2\u09b0\u09cd\u09a3 \u09b8\u0982\u0996\u09cd\u09af\u09be \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964', err_goal_range: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af \u09e7\u09e6\u09e6\u09e6\u2013\u09eb\u09e6\u09e6\u09e6 kcal \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      import_ok: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964', import_fail: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09ac\u09cd\u09af\u09b0\u09cd\u09a5 \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964', erase_done: '\u09b8\u09ac \u09a1\u09c7\u099f\u09be \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964', erase_wrong: '\u09ae\u09c1\u099b\u09a4\u09c7 DELETE \u09b2\u09bf\u0996\u09c1\u09a8\u0964',
      goal_saved: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964'
    }
  };

  var state = load();
  var viewDate = today;
  var foodQuery = '';

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        var res = L.validateImport({ app: L.APP_ID, version: L.VERSION, goal: parsed.goal, entries: parsed.entries || [] }, ASOF);
        if (res.ok) return { goal: parsed.goal, entries: parsed.entries || [], lang: parsed.lang === 'bn' ? 'bn' : 'en' };
      }
    } catch (e) { /* fall through to defaults */ }
    return { goal: 2000, entries: [], lang: 'en' };
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage full/blocked */ }
  }
  function t(key) { return (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key; }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function foodName(f) { return state.lang === 'bn' ? f.bn : f.en; }
  function $ (id) { return document.getElementById(id); }

  function applyLang() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    $('langBtn').textContent = state.lang === 'en' ? '\u09ac\u09be\u0982\u09b2\u09be' : 'English';
    $('foodName').placeholder = state.lang === 'bn' ? '\u09af\u09c7\u09ae\u09a8: \u09ad\u09be\u09a4' : 'e.g. Plain Rice';
    buildFoodSelect();
  }

  function buildFoodSelect() {
    var sel = $('foodSel');
    var cur = sel.value;
    sel.innerHTML = '<option value="">' + esc(t('custom')) + '</option>' +
      FOODS.map(function (f) {
        return '<option value="' + esc(f.id) + '">' + esc(foodName(f)) + ' (' + esc(f.serving) + ')</option>';
      }).join('');
    sel.value = cur;
  }

  function renderToday() {
    $('datePicker').value = viewDate;
    $('goalInput').value = state.goal;
    var totals = L.dayTotals(state.entries, viewDate);
    $('eatenVal').textContent = L.fmtInt(totals.kcal, state.lang);
    $('goalVal').textContent = L.fmtInt(state.goal, state.lang);
    var remain = Math.max(0, Math.round(state.goal - totals.kcal));
    $('remainVal').textContent = L.fmtInt(remain, state.lang);
    $('countVal').textContent = L.fmtInt(totals.count, state.lang);
    var pct = state.goal > 0 ? Math.min(100, Math.round(totals.kcal / state.goal * 100)) : 0;
    $('progressBar').style.width = pct + '%';
    $('progressBar').className = 'progress-bar' + (totals.kcal > state.goal ? ' over' : '');
    $('progressText').textContent = L.fmtInt(pct, state.lang) + '% ' + t('of_goal');

    var mealHtml = L.MEALS.map(function (m) {
      var mt = totals.meals[m];
      return '<div class="meal-card"><div class="meal-name">' + esc(t('meal_' + m)) + '</div>' +
        '<div class="meal-kcal">' + L.fmtInt(mt.kcal, state.lang) + ' ' + t('kcal') + '</div>' +
        '<div class="muted">' + L.fmtInt(mt.count, state.lang) + ' ' + t('entries') + '</div></div>';
    }).join('');
    $('mealBreakdown').innerHTML = mealHtml;

    var pcts = L.macroPct(totals);
    $('macroP').style.width = pcts.protein + '%';
    $('macroC').style.width = pcts.carbs + '%';
    $('macroF').style.width = pcts.fat + '%';
    var mk = L.macroKcal(totals);
    $('macroText').textContent =
      t('protein') + ' ' + L.fmtNumber(totals.protein, state.lang) + 'g (' + L.fmtInt(mk.protein, state.lang) + ' kcal) \u00b7 ' +
      t('carbs') + ' ' + L.fmtNumber(totals.carbs, state.lang) + 'g (' + L.fmtInt(mk.carbs, state.lang) + ' kcal) \u00b7 ' +
      t('fat') + ' ' + L.fmtNumber(totals.fat, state.lang) + 'g (' + L.fmtInt(mk.fat, state.lang) + ' kcal)';

    var list = L.dayEntries(state.entries, viewDate);
    $('entriesEmpty').hidden = list.length > 0;
    $('entriesList').innerHTML = list.map(function (e) {
      var et = L.entryTotals(e);
      return '<div class="entry-row"><div><strong>' + esc(e.name) + '</strong>' +
        '<div class="muted">' + esc(t('meal_' + e.meal)) + ' \u00b7 ' + L.fmtNumber(e.qty, state.lang) + ' ' + t('serving') + '</div></div>' +
        '<div class="entry-kcal">' + L.fmtInt(et.kcal, state.lang) + ' kcal</div>' +
        '<button type="button" class="del-btn" data-del="' + esc(e.id) + '">' + esc(t('delete')) + '</button></div>';
    }).join('');
    $('entriesList').querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.entries = state.entries.filter(function (e) { return e.id !== btn.getAttribute('data-del'); });
        save(); renderAll();
      });
    });
    renderChart();
  }

  function renderChart() {
    var svg = $('chartSvg');
    var data = L.last7Days(state.entries, viewDate);
    var max = Math.max.apply(null, data.map(function (d) { return d.kcal; }).concat([state.goal, 100]));
    var W = 700, H = 220, padL = 40, padB = 30, padT = 12, chartH = H - padT - padB, chartW = W - padL - 8;
    var goalY = padT + chartH - (state.goal / max) * chartH;
    var bars = data.map(function (d, i) {
      var bw = chartW / 7;
      var bh = (d.kcal / max) * chartH;
      var x = padL + i * bw + bw * 0.2;
      var y = padT + chartH - bh;
      var label = d.date.slice(5);
      return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (bw * 0.6).toFixed(1) + '" height="' + bh.toFixed(1) + '" fill="#2e7d32" rx="3"></rect>' +
        '<text x="' + (x + bw * 0.3).toFixed(1) + '" y="' + (y - 4).toFixed(1) + '" text-anchor="middle" font-size="11">' + L.fmtInt(d.kcal, state.lang) + '</text>' +
        '<text x="' + (x + bw * 0.3).toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle" font-size="11">' + esc(label) + '</text>';
    }).join('');
    svg.innerHTML =
      '<line x1="' + padL + '" y1="' + goalY.toFixed(1) + '" x2="' + (W - 8) + '" y2="' + goalY.toFixed(1) + '" stroke="#c62828" stroke-dasharray="5,4" stroke-width="1.5"></line>' +
      '<text x="' + (W - 12) + '" y="' + (goalY - 5).toFixed(1) + '" text-anchor="end" font-size="11" fill="#c62828">' + t('goal') + ' ' + L.fmtInt(state.goal, state.lang) + '</text>' +
      bars;
  }

  function renderFoods() {
    var rows = L.searchFoods(FOODS, foodQuery).map(function (f) {
      return '<tr><td>' + esc(foodName(f)) + '</td><td>' + esc(f.serving) + '</td><td>' + L.fmtInt(f.kcal, state.lang) + '</td>' +
        '<td>' + L.fmtNumber(f.protein, state.lang) + '</td><td>' + L.fmtNumber(f.carbs, state.lang) + '</td><td>' + L.fmtNumber(f.fat, state.lang) + '</td>' +
        '<td><button type="button" class="add-food-btn" data-food="' + esc(f.id) + '">' + esc(t('add')) + '</button></td></tr>';
    }).join('');
    $('foodTable').innerHTML = rows || '<tr><td colspan="7" class="muted">' + esc(t('no_entries')) + '</td></tr>';
    $('foodTable').querySelectorAll('[data-food]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        fillFromFood(btn.getAttribute('data-food'));
        switchTab('today');
        $('foodName').focus();
      });
    });
  }

  function fillFromFood(id) {
    var f = FOODS.find(function (x) { return x.id === id; });
    if (!f) return;
    $('foodSel').value = id;
    $('foodName').value = foodName(f);
    $('kcalInput').value = f.kcal;
    $('proteinInput').value = f.protein;
    $('carbsInput').value = f.carbs;
    $('fatInput').value = f.fat;
  }

  function renderHistory() {
    var rows = [];
    for (var i = 0; i < 30; i++) {
      var d = L.addDays(viewDate, -i);
      var totals = L.dayTotals(state.entries, d);
      var status = totals.count === 0 ? t('no_entries_short') : (totals.kcal > state.goal ? t('over') : t('under'));
      rows.push('<tr><td>' + esc(d) + '</td><td>' + L.fmtInt(totals.kcal, state.lang) + '</td><td>' + L.fmtInt(totals.count, state.lang) + '</td><td>' + L.fmtInt(state.goal, state.lang) + '</td><td>' + esc(status) + '</td></tr>');
    }
    $('historyTable').innerHTML = rows.join('');
  }

  function switchTab(name) {
    document.querySelectorAll('.tab').forEach(function (b) { b.classList.toggle('active', b.dataset.tab === name); });
    document.querySelectorAll('.panel').forEach(function (p) { p.classList.toggle('active', p.id === 'panel-' + name); });
  }

  function renderAll() { applyLang(); renderToday(); renderFoods(); renderHistory(); }

  // Events
  document.querySelectorAll('.tab').forEach(function (b) {
    b.addEventListener('click', function () { switchTab(b.dataset.tab); });
  });
  $('langBtn').addEventListener('click', function () {
    state.lang = state.lang === 'en' ? 'bn' : 'en';
    save(); renderAll();
  });
  $('datePicker').addEventListener('change', function () {
    if (L.isValidDateStr($('datePicker').value)) { viewDate = $('datePicker').value; renderAll(); }
  });
  $('goalSave').addEventListener('click', function () {
    var g = Number($('goalInput').value);
    var err = L.validateGoal(g);
    if (err) { $('goalError').hidden = false; $('goalError').textContent = t('err_' + err); return; }
    state.goal = g; save();
    $('goalError').hidden = false; $('goalError').className = 'ok'; $('goalError').textContent = t('goal_saved');
    renderAll();
  });
  $('foodSel').addEventListener('change', function () {
    if ($('foodSel').value) fillFromFood($('foodSel').value);
  });
  $('foodSearch').addEventListener('input', function () { foodQuery = $('foodSearch').value; renderFoods(); });
  $('addForm').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var entry = {
      id: 'e' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36),
      date: viewDate,
      meal: $('mealSel').value,
      name: $('foodName').value.trim(),
      qty: Number($('qtyInput').value),
      kcal: Number($('kcalInput').value),
      protein: Number($('proteinInput').value),
      carbs: Number($('carbsInput').value),
      fat: Number($('fatInput').value)
    };
    var errs = L.validateEntry(entry, ASOF);
    if (errs.length) {
      $('formError').hidden = false; $('formError').className = 'error';
      $('formError').textContent = t('err_' + errs[0]);
      return;
    }
    state.entries.push(entry); save();
    $('formError').hidden = false; $('formError').className = 'ok'; $('formError').textContent = t('add_entry_btn') + ' \u2713';
    $('foodName').value = ''; $('foodSel').value = '';
    renderAll();
  });
  $('exportBtn').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify(L.exportData(state.goal, state.entries), null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'calorie-tracker-bd.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $('importFile').addEventListener('change', function () {
    var file = $('importFile').files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var res = L.validateImport(JSON.parse(reader.result), ASOF);
        if (!res.ok) throw new Error(res.error);
        state.goal = res.data.goal; state.entries = res.data.entries; save();
        $('importMsg').className = 'ok'; $('importMsg').textContent = t('import_ok');
        renderAll();
      } catch (e) {
        $('importMsg').className = 'error'; $('importMsg').textContent = t('import_fail') + ' ' + e.message;
      }
    };
    reader.readAsText(file);
    $('importFile').value = '';
  });
  $('eraseBtn').addEventListener('click', function () {
    if ($('eraseInput').value !== 'DELETE') {
      $('eraseMsg').className = 'error'; $('eraseMsg').textContent = t('erase_wrong'); return;
    }
    state.entries = []; state.goal = 2000; save();
    $('eraseInput').value = '';
    $('eraseMsg').className = 'ok'; $('eraseMsg').textContent = t('erase_done');
    renderAll();
  });

  renderAll();
  window.__app = { state: state, renderAll: renderAll, t: t };
})();
