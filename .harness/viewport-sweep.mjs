#!/usr/bin/env node
// Dashboard feature-parity sweep: desktop vs tablet vs phone.
//
//   npm run dev:harness                  # in one terminal (http://localhost:5199)
//   node .harness/viewport-sweep.mjs     # [tiers] default: free,growth,enterprise
//   SWEEP_ROUTES=/dashboard,/dashboard/plan node .harness/viewport-sweep.mjs free
//
// Drives headless Chrome over the DevTools protocol (no dependencies) with true
// viewport emulation — 1280x800, 768x1024 with touch, 375x812 with touch in
// mobile mode — and for every tier and dashboard route records the visible
// controls, headings, header controls, every tab panel (each tab is clicked),
// the header menus (opened), and the sidebar (opened via its trigger on
// phones). It then reports anything present on desktop but missing on a
// smaller width, plus horizontal overflow, off-screen controls and touch
// targets under the WCAG 2.2 24px minimum (inline links in a sentence are
// exempt). Exit code 1 if anything is found.
//
// Settles on STABLE content, not first content: a first version captured a
// transient "No matches found" that /dashboard/funding showed for ~1s while
// loading — which turned out to be a real bug on every width.
import { spawn } from 'node:child_process';
import { writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.env.HARNESS_URL || 'http://localhost:5199';
const PORT = 9333;
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TIERS = (process.argv[2] || 'free,growth,enterprise').split(',');
const ROUTES = process.env.SWEEP_ROUTES ? process.env.SWEEP_ROUTES.split(',') : ['/dashboard','/dashboard/funding/matches','/dashboard/plan','/dashboard/assistant','/dashboard/tasks','/dashboard/resources','/dashboard/documents','/dashboard/forum','/dashboard/compliance','/dashboard/funding','/dashboard/analytics','/dashboard/network','/dashboard/certifications','/dashboard/funding/saved','/dashboard/business-tools','/dashboard/templates','/dashboard/api','/dashboard/team','/dashboard/security','/dashboard/integrations','/dashboard/training-calendar','/dashboard/support','/dashboard/settings','/dashboard/profile'];
const VIEWPORTS = { desktop: [1280, 800, false], tablet: [768, 1024, true], mobile: [375, 812, true] };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdp() {
  for (let i = 0; i < 120; i++) { try { await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; } catch { await sleep(500); } }
  const page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0; const pending = new Map();
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
  const send = (method, params = {}) => new Promise((res, rej) => { const my = ++id; pending.set(my, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id: my, method, params })); });
  await send('Page.enable'); await send('Runtime.enable');
  const evaluate = async (expression) => { const { result, exceptionDetails } = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (exceptionDetails) throw new Error(exceptionDetails.text + ' ' + (exceptionDetails.exception?.description || '').slice(0, 300)); return result.value; };
  const goto = async (url) => { await send('Page.navigate', { url }); await sleep(800);
    for (let i = 0; i < 40; i++) { if ((await evaluate('document.readyState')) === 'complete') break; await sleep(250); } };
  return { send, evaluate, goto, close: () => ws.close() };
}

const IN_PAGE = String.raw`window.__dash = {
  sleep: (ms) => new Promise(r => setTimeout(r, ms)),
  visible(el) { if (!el.getClientRects().length) return false; const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return false;
    if (el.closest('[aria-hidden="true"],[hidden],[inert]')) return false;
    const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; },
  name(el) { const n = (el.getAttribute('aria-label') || el.innerText || el.getAttribute('placeholder') || el.getAttribute('title') || el.getAttribute('name') || el.value || el.type || '').replace(/\s+/g, ' ').trim();
    return (el.tagName.toLowerCase() + (el.getAttribute('role') ? '[' + el.getAttribute('role') + ']' : '') + ':' + n).slice(0, 90); },
  SEL: 'a[href],button,input:not([type=hidden]),select,textarea,[role=tab],[role=switch],[role=combobox],[role=checkbox],[role=menuitem],[role=radio]',
  controls(root) { const h = document.querySelector('header'); return root ? [...root.querySelectorAll(this.SEL)].filter(e => this.visible(e) && !(h && root !== h && h.contains(e))) : []; },
  async settle() { let last = '', same = 0;
    for (let i = 0; i < 80; i++) { await this.sleep(150); const m = document.querySelector('main'); const txt = m ? m.innerText : '';
      const busy = !m || txt.trim().length < 40 || m.querySelector('.animate-spin') || m.querySelector('[role=status]');
      if (!busy && txt === last) { if (++same >= 4) break; } else same = 0; last = txt; }
    await this.sleep(200); },
  async capture(touch) {
    await this.settle();
    const main = document.querySelector('main'), header = document.querySelector('header'), W = innerWidth;
    const res = { path: location.pathname,
      h: main ? [...main.querySelectorAll('h1,h2,h3')].filter(e => this.visible(e)).map(e => e.tagName + ':' + e.innerText.trim().slice(0, 60)) : [],
      main: this.controls(main).map(e => this.name(e)), header: this.controls(header).map(e => this.name(e)),
      overflow: document.documentElement.scrollWidth - W,
      offscreen: this.controls(main).filter(e => { const r = e.getBoundingClientRect(); return r.right > W + 1 || r.left < -1; }).map(e => this.name(e)).slice(0, 10), tiny: [] };
    const inline = (e) => e.tagName === 'A' && e.parentElement && /^(P|LI|SPAN)$/.test(e.parentElement.tagName) && e.parentElement.innerText.trim().length > e.innerText.trim().length + 20;
    if (touch) for (const e of [...this.controls(main), ...this.controls(header)]) { if (inline(e) || ['INPUT','TEXTAREA','SELECT'].includes(e.tagName)) continue;
      const r = e.getBoundingClientRect(); if (r.width < 24 || r.height < 24) res.tiny.push(this.name(e) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
    res.tiny = res.tiny.slice(0, 15); res.tabs = {};
    // A collapsed site menu (marketing pages, e.g. where a free user lands on
    // /pricing from a paid-only route) holds the header links on small screens:
    // open it so its links count, instead of reporting them missing.
    const burger = header && [...header.querySelectorAll('button')].find(b => /open menu/i.test(b.getAttribute('aria-label') || ''));
    if (burger) { burger.click(); await this.sleep(500);
      const opened = [...document.querySelectorAll('header a[href], [role=dialog] a[href], nav a[href]')].filter(e => this.visible(e)).map(e => this.name(e));
      res.header = [...new Set([...res.header.filter(n => !/open menu/i.test(n)), ...opened])];
      burger.click(); await this.sleep(300); }
    for (const t of (main ? [...main.querySelectorAll('[role=tab]')].filter(e => this.visible(e)) : [])) {
      const label = t.innerText.replace(/\s+/g, ' ').trim().slice(0, 40);
      t.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 })); t.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); t.click(); await this.sleep(350);
      res.tabs[label] = this.controls(main.querySelector('[role=tabpanel][data-state=active]') || main).map(e => this.name(e)); }
    return res; },
  async menus() { const out = {}, header = document.querySelector('header');
    for (const label of ['Notifications', 'Change language', 'Account menu']) {
      const b = [...header.querySelectorAll('button')].find(x => (x.getAttribute('aria-label') || '').startsWith(label));
      if (!b) { out[label] = 'MISSING'; continue; }
      b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' })); await this.sleep(400);
      const menu = document.querySelector('[role=menu]');
      out[label] = menu ? [...menu.querySelectorAll('[role=menuitem],a,button')].filter(e => this.visible(e)).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 40)) : 'DID NOT OPEN';
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await this.sleep(300); }
    return out; },
  async sidebar() { const pick = () => [...document.querySelectorAll('[data-sidebar=sidebar] a[href], [data-sidebar=sidebar] button')]
      .filter(e => this.visible(e)).map(e => (e.getAttribute('href') || 'button') + '|' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 40));
    let items = pick(), via = false;
    if (!items.some(x => x.startsWith('/dashboard'))) { const t = document.querySelector('[data-sidebar=trigger]'); if (t) { t.click(); await this.sleep(700); items = pick(); via = true; } }
    return { items: [...new Set(items)], viaTrigger: via }; },
};`;

function missing(a, b) { const cb = {}; for (const x of b) cb[x] = (cb[x] || 0) + 1; const ca = {}; for (const x of a) ca[x] = (ca[x] || 0) + 1;
  return Object.keys(ca).filter((k) => (cb[k] || 0) < ca[k]); }

function analyse(results) {
  const findings = [];
  for (const [tier, vps] of Object.entries(results)) for (const [route, d] of Object.entries(vps.desktop)) {
    const add = (vp, msg) => findings.push(`[${tier}] ${route} ${vp}: ${msg}`);
    if (d.overflow > 0) add('desktop', `horizontal overflow ${d.overflow}px`);
    for (const vp of ['tablet', 'mobile']) { const x = vps[vp][route];
      for (const k of ['main', 'header', 'h']) { const m = missing(d[k], x[k]); if (m.length) add(vp, `missing ${k}: ${m.join(' | ')}`); }
      for (const [tab, c] of Object.entries(d.tabs)) { if (!(tab in x.tabs)) add(vp, `tab "${tab}" not reachable`); else { const m = missing(c, x.tabs[tab]); if (m.length) add(vp, `tab "${tab}" missing ${m.join(' | ')}`); } }
      if (x.overflow > 0) add(vp, `horizontal overflow ${x.overflow}px`);
      if (x.offscreen.length) add(vp, `off-screen: ${x.offscreen.join(' | ')}`);
      if (x.tiny.length) add(vp, `targets <24px: ${x.tiny.join(' | ')}`);
      if (d.menus) { for (const [mk, mv] of Object.entries(d.menus)) if (JSON.stringify(x.menus[mk]) !== JSON.stringify(mv)) add(vp, `menu ${mk}: desktop ${JSON.stringify(mv)} vs ${JSON.stringify(x.menus[mk])}`);
        const m = missing(d.sidebar.items, x.sidebar.items); if (m.length) add(vp, `sidebar missing ${m.join(' | ')}`); } } }
  return findings;
}

const profile = mkdtempSync(join(tmpdir(), 'viewport-sweep-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
const results = {};
let code = 1;
try {
  const c = await cdp();
  await c.goto(BASE + '/dashboard');
  const styled = await c.evaluate(`[...document.styleSheets].some(s => { try { return [...s.cssRules].some(r => (r.selectorText||'').includes('.overflow-x-auto')); } catch { return false; } })`);
  if (!styled) throw new Error('Tailwind is not loaded — measurements would be of an unstyled page (see .harness/README.md)');
  for (const tier of TIERS) {
    await c.evaluate(`localStorage.setItem('harness-tier', ${JSON.stringify(tier)}); true`);
    results[tier] = {};
    for (const [vp, [w, h, touch]] of Object.entries(VIEWPORTS)) {
      await c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 });
      await c.send('Emulation.setTouchEmulationEnabled', touch ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
      results[tier][vp] = {};
      for (const route of ROUTES) {
        await c.goto(BASE + route); await c.evaluate(IN_PAGE + '; true');
        const r = await c.evaluate(`window.__dash.capture(${touch})`);
        if (route === '/dashboard') {
          await c.goto(BASE + route); await c.evaluate(IN_PAGE + '; true'); await c.evaluate('window.__dash.settle()'); r.menus = await c.evaluate('window.__dash.menus()');
          await c.goto(BASE + route); await c.evaluate(IN_PAGE + '; true'); await c.evaluate('window.__dash.settle()'); r.sidebar = await c.evaluate('window.__dash.sidebar()');
        }
        results[tier][vp][route] = r; process.stdout.write('.');
      }
      console.log(` ${tier} ${vp}`);
    }
  }
  await c.evaluate(`localStorage.removeItem('harness-tier'); true`);
  c.close();
  const out = join(tmpdir(), 'viewport-sweep.json');
  writeFileSync(out, JSON.stringify(results, null, 1));
  const findings = analyse(results);
  console.log(`\n${findings.length} finding(s) across ${TIERS.length} tier(s) x 3 viewports x ${ROUTES.length} routes`);
  for (const f of findings) console.log('  ' + f);
  console.log(`raw results: ${out}`);
  code = findings.length ? 1 : 0;
} finally {
  chrome.kill('SIGKILL');
  rmSync(profile, { recursive: true, force: true });
}
process.exit(code);
