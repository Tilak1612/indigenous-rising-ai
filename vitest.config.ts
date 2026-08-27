import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // The default 5s test / 1s waitFor budget is enough on an idle machine
    // but not on a loaded one: the workflow suites assert on state that
    // settles after an awaited write, so under CPU contention they time out
    // and report failures that are not defects. Observed on this repo —
    // the same suite passed alone and failed in the full run at load 16,
    // then passed at load 13 once the budget was raised. These are
    // correctness assertions; the timeout only bounds how long a settle is
    // allowed to take, so a larger budget costs nothing when things pass.
    testTimeout: 20_000,
    hookTimeout: 20_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
