// Dev-only harness: renders the REAL App (real routes, real ProtectedRoute,
// real DashboardLayout) with the two auth hooks aliased to stubs, so the
// dashboard can be measured in a browser without credentials.
//
// Deliberately minimal: it inherits postcss/tailwind resolution from the
// repo cwd rather than re-specifying it. An earlier version overrode those,
// got Tailwind's relative content globs wrong, and emitted almost no
// utilities — the app rendered unstyled and every measurement taken from it
// was meaningless. The launcher now sets cwd, so this file only needs the
// aliases. Not part of any build.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// postcss, tailwind, and tailwind's RELATIVE content globs all resolve from
// process.cwd(). Launched from another directory they silently scan nothing,
// Tailwind emits almost no utilities, and the app renders unstyled — which
// makes every layout measurement taken from it worthless while still looking
// like a working page. Pinning cwd here removes that whole failure mode.
process.chdir(__dirname);

export default defineConfig({
  root: __dirname,
  cacheDir: path.resolve(__dirname, 'node_modules/.vite-harness'),
  server: { host: '127.0.0.1', port: 5199 },
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@\/hooks\/useAuth$/, replacement: path.resolve(__dirname, '.harness/useAuth.tsx') },
      { find: /^@\/hooks\/useSubscription$/, replacement: path.resolve(__dirname, '.harness/useSubscription.tsx') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
});
