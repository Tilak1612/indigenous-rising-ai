// CI gate: the built JS chunks must not import each other in a cycle.
//
// A cycle between manual chunks makes the browser evaluate them in an order
// Rollup did not intend, and a `const` imported from the not-yet-evaluated
// chunk throws "Cannot access 'X' before initialization". That took the
// production app down on 2026-10-25 (react-vendor <-> form-vendor via a split
// @sentry/core). This reads dist/assets/*.js, builds the import graph from
// the `from "./chunk.js"` statements, and fails on any cycle.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'dist', 'assets');
if (!existsSync(ASSETS)) {
  console.error('[check-chunk-cycles] dist/assets missing — run the build first');
  process.exit(1);
}
const files = readdirSync(ASSETS).filter((f) => f.endsWith('.js'));
const graph = new Map();
for (const f of files) {
  const src = readFileSync(path.join(ASSETS, f), 'utf8');
  const deps = new Set();
  for (const m of src.matchAll(/from\s*"\.\/([^"]+\.js)"/g)) deps.add(m[1]);
  for (const m of src.matchAll(/import\s*"\.\/([^"]+\.js)"/g)) deps.add(m[1]);
  graph.set(f, deps);
}
const state = new Map();
const stack = [];
const cycles = [];
function visit(n) {
  state.set(n, 1); stack.push(n);
  for (const d of graph.get(n) ?? []) {
    if (!graph.has(d)) continue;
    if (state.get(d) === 1) cycles.push([...stack.slice(stack.indexOf(d)), d].join(' -> '));
    else if (!state.get(d)) visit(d);
  }
  stack.pop(); state.set(n, 2);
}
for (const f of files) if (!state.get(f)) visit(f);
if (cycles.length) {
  console.error('[check-chunk-cycles] FAIL — circular chunk imports:');
  for (const c of cycles) console.error('  ' + c);
  process.exit(1);
}
console.log(`[check-chunk-cycles] OK — ${files.length} chunks, no cycles`);
