// Headless-Chrome smoke test via raw CDP (no puppeteer dependency).
// Usage: node tests/smoke.mjs [desktop|mobile|both]
'use strict';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CHROME = '/opt/meta-chromium/chrome';
const PORT = 9223;
const BASE = path.resolve(__dirname, '..');
const URL = 'file://' + BASE + '/index.html?asof=2026-10-16';
const MODE = process.argv[2] || 'both';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, timeoutMs, label) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) { if (await fn()) return; await sleep(100); }
  throw new Error('timeout waiting for ' + label);
}

class CDP {
  constructor(wsUrl) { this.ws = new WebSocket(wsUrl); this.nextId = 1; this.pending = new Map(); this.handlers = {}; this.ready = new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; }); this.ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && this.pending.has(m.id)) { const { res, rej } = this.pending.get(m.id); this.pending.delete(m.id); if (m.error) rej(new Error(JSON.stringify(m.error))); else res(m.result); } else if (m.method && this.handlers[m.method]) { for (const h of this.handlers[m.method]) h(m.params); } }; }
  on(method, h) { (this.handlers[method] = this.handlers[method] || []).push(h); }
  async send(method, params) { await this.ready; const id = this.nextId++; const p = new Promise((res, rej) => this.pending.set(id, { res, rej })); this.ws.send(JSON.stringify({ id, method, params: params || {} })); return p; }
  async evaluate(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('evaluate exception: ' + JSON.stringify(r.exceptionDetails).slice(0, 500)); return r.result.value; }
  close() { try { this.ws.close(); } catch (e) {} }
}

async function runViewport(width, mobile, label) {
  const errors = [];
  const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=' + PORT, '--user-data-dir=/tmp/ct-smoke-' + label, 'about:blank'], { stdio: 'ignore' });
  try {
    await waitFor(async () => { try { const r = await fetch('http://127.0.0.1:' + PORT + '/json/version'); return r.ok; } catch (e) { return false; } }, 15000, 'chrome debug port');
    const target = await (await fetch('http://127.0.0.1:' + PORT + '/json/new', { method: 'PUT' })).json();
    const cdp = new CDP(target.webSocketDebuggerUrl);
    cdp.on('Runtime.consoleAPICalled', (p) => { if (p.type === 'error') errors.push('console.error: ' + JSON.stringify(p.args).slice(0, 300)); });
    cdp.on('Runtime.exceptionThrown', (p) => errors.push('exception: ' + (p.exceptionDetails.exception ? p.exceptionDetails.exception.description : JSON.stringify(p.exceptionDetails).slice(0, 300))));
    cdp.on('Log.entryAdded', (p) => { if (p.entry.level === 'error') errors.push('log.error: ' + p.entry.text); });
    await cdp.send('Runtime.enable'); await cdp.send('Page.enable'); await cdp.send('Log.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile });
    let loadCount = 0; cdp.on('Page.loadEventFired', () => { loadCount++; });
    await cdp.send('Page.navigate', { url: URL });
    await waitFor(async () => loadCount >= 1, 15000, 'page load');
    // fresh state
    await cdp.evaluate(`localStorage.clear(); location.reload();`);
    await waitFor(async () => loadCount >= 2, 15000, 'reload after clear');
    await sleep(300);

    const checks = [];
    function ck(name, cond, extra) { checks.push({ name, pass: !!cond, extra: extra || '' }); }

    let r = await cdp.evaluate(`(() => ({
      title: document.title,
      tabs: document.querySelectorAll('.tab').length,
      eaten: document.getElementById('eatenVal').textContent,
      goal: document.getElementById('goalVal').textContent,
      foods: document.getElementById('foodSel').options.length,
      foodRows: document.querySelectorAll('#foodTable tr').length
    }))()`);
    ck('title mentions Calorie Tracker', r.title.includes('Calorie Tracker'));
    ck('4 tabs', r.tabs === 4, 'got ' + r.tabs);
    ck('default eaten 0', r.eaten === '0', 'got ' + r.eaten);
    ck('default goal 2,000', r.goal === '2,000', 'got ' + r.goal);
    ck('food select has 44 options (Custom + 43)', r.foods === 44, 'got ' + r.foods);
    ck('foods table has 43 rows', r.foodRows === 43, 'got ' + r.foodRows);

    // Add 1.5 servings of rice via DB select
    r = await cdp.evaluate(`(() => {
      const sel = document.getElementById('foodSel'); sel.value = 'rice'; sel.dispatchEvent(new Event('change', {bubbles:true}));
      const filled = { name: document.getElementById('foodName').value, kcal: document.getElementById('kcalInput').value };
      document.getElementById('qtyInput').value = '1.5';
      document.getElementById('addBtn').click();
      return { filled, eaten: document.getElementById('eatenVal').textContent,
        rows: document.querySelectorAll('#entriesList .entry-row').length,
        remain: document.getElementById('remainVal').textContent,
        macro: document.getElementById('macroText').textContent };
    })()`);
    ck('DB select fills rice 200 kcal', r.filled.name === 'Plain Rice' && r.filled.kcal === '200', JSON.stringify(r.filled));
    ck('1.5 rice -> eaten 300', r.eaten === '300', 'got ' + r.eaten);
    ck('1 entry row', r.rows === 1);
    ck('remaining 1,700', r.remain === '1,700', 'got ' + r.remain);
    ck('macro text shows protein 6g', r.macro.includes('Protein 6'), 'got ' + r.macro);

    // Persistence across reload
    await cdp.evaluate(`location.reload();`);
    await waitFor(async () => loadCount >= 3, 15000, 'reload 2');
    await sleep(300);
    r = await cdp.evaluate(`({ eaten: document.getElementById('eatenVal').textContent, rows: document.querySelectorAll('#entriesList .entry-row').length })`);
    ck('reload persists eaten 300', r.eaten === '300' && r.rows === 1, JSON.stringify(r));

    // Bengali toggle: digits + labels
    r = await cdp.evaluate(`(() => {
      document.getElementById('langBtn').click();
      return { eaten: document.getElementById('eatenVal').textContent,
        langBtn: document.getElementById('langBtn').textContent,
        h1: document.querySelector('h1').textContent };
    })()`);
    ck('BN toggle shows Bengali digits \u09e9\u09e6\u09e6', r.eaten === '\u09e9\u09e6\u09e6', 'got ' + r.eaten);
    ck('BN toggle shows Bengali title', r.h1.includes('\u0995\u09cd\u09af\u09be\u09b2\u09cb\u09b0\u09bf'), 'got ' + r.h1);
    ck('BN toggle button becomes English', r.langBtn === 'English', 'got ' + r.langBtn);
    await cdp.evaluate(`document.getElementById('langBtn').click();`); // back to EN

    // Validation: empty name rejected
    r = await cdp.evaluate(`(() => {
      document.getElementById('foodSel').value = '';
      document.getElementById('foodName').value = '';
      document.getElementById('kcalInput').value = '100';
      document.getElementById('addBtn').click();
      const err = document.getElementById('formError');
      return { hidden: err.hidden, text: err.textContent, eaten: document.getElementById('eatenVal').textContent };
    })()`);
    ck('empty name shows inline error, eaten unchanged', !r.hidden && r.eaten === '300', JSON.stringify(r));

    // Goal edit
    r = await cdp.evaluate(`(() => {
      document.getElementById('goalInput').value = '2500';
      document.getElementById('goalSave').click();
      return { goal: document.getElementById('goalVal').textContent, remain: document.getElementById('remainVal').textContent };
    })()`);
    ck('goal edit 2500 -> goal 2,500 remain 2,200', r.goal === '2,500' && r.remain === '2,200', JSON.stringify(r));

    // Foods tab search (Bengali)
    r = await cdp.evaluate(`(() => {
      document.querySelector('[data-tab="foods"]').click();
      const inp = document.getElementById('foodSearch'); inp.value = '\u09ad\u09be\u09a4'; inp.dispatchEvent(new Event('input', {bubbles:true}));
      return { rows: document.querySelectorAll('#foodTable tr').length, first: document.querySelector('#foodTable tr td')?.textContent };
    })()`);
    ck('Bengali search \u09ad\u09be\u09a4 -> 1 row', r.rows === 1, JSON.stringify(r));

    // History tab shows today
    r = await cdp.evaluate(`(() => {
      document.querySelector('[data-tab="history"]').click();
      const rows = [...document.querySelectorAll('#historyTable tr')].map(tr => tr.textContent);
      return { today: rows.find(t => t.includes('2026-10-16')) || '' };
    })()`);
    ck('history shows 2026-10-16 with 300 kcal', r.today.includes('300'), 'got ' + r.today);

    // Chart has 7 bars
    r = await cdp.evaluate(`document.querySelectorAll('#chartSvg rect').length`);
    ck('chart has 7 bars', r === 7, 'got ' + r);

    // Delete entry -> back to 0
    r = await cdp.evaluate(`(() => {
      document.querySelector('[data-tab="today"]').click();
      document.querySelector('[data-del]').click();
      return { eaten: document.getElementById('eatenVal').textContent, rows: document.querySelectorAll('#entriesList .entry-row').length };
    })()`);
    ck('delete entry -> eaten 0', r.eaten === '0' && r.rows === 0, JSON.stringify(r));

    // Overflow check on every tab
    r = await cdp.evaluate(`(() => {
      const out = {};
      for (const t of ['today','foods','history','data']) {
        document.querySelector('[data-tab="' + t + '"]').click();
        out[t] = document.documentElement.scrollWidth;
      }
      return out;
    })()`);
    for (const t of ['today', 'foods', 'history', 'data']) ck('no horizontal overflow on ' + t + ' tab (' + width + 'px)', r[t] <= width + 1, 'scrollWidth ' + r[t]);

    const failed = checks.filter(c => !c.pass);
    for (const c of checks) console.log((c.pass ? 'ok   - ' : 'FAIL - ') + label + ' ' + c.name + (c.pass ? '' : ' :: ' + c.extra));
    console.log(label + ': ' + (checks.length - failed.length) + '/' + checks.length + ' smoke checks passed; console/page errors: ' + errors.length);
    for (const e of errors) console.log('  ERROR: ' + e);
    cdp.close();
    return { checks, errors };
  } finally {
    try { chrome.kill('SIGKILL'); } catch (e) {}
    await sleep(300);
  }
}

(async () => {
  let all = [];
  if (MODE === 'desktop' || MODE === 'both') all.push(await runViewport(1280, false, 'desktop'));
  if (MODE === 'mobile' || MODE === 'both') all.push(await runViewport(390, true, 'mobile'));
  const totalFail = all.reduce((s, r) => s + r.checks.filter(c => !c.pass).length + r.errors.length, 0);
  if (totalFail > 0) { console.log('SMOKE FAILED with ' + totalFail + ' failures/errors'); process.exit(1); }
  console.log('SMOKE ALL GREEN');
})().catch(e => { console.error('SMOKE HARNESS ERROR:', e); process.exit(1); });
