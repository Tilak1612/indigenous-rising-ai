import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const base = process.env.GITHUB_PAGES === 'true' && repoName ? `/${repoName}/` : '/';

  return {
    base,
    // react-helmet-async ships CommonJS. Left external, the ESM prerender
    // bundle fails with "Named export 'HelmetProvider' not found". Bundling it
    // resolves the interop. Only affects the --ssr build.
    ssr: { noExternal: ['react-helmet-async'] },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Sentry first, in its own chunk. The old react matcher
            // (`/\/react\//`) also caught `@sentry/react`, and Rollup then split
            // `@sentry/core` between react-vendor and form-vendor. That made
            // react-vendor import form-vendor while form-vendor imports React
            // from react-vendor: a chunk cycle, evaluated in the wrong order,
            // so react-hook-form ran `React.createContext` before the React
            // binding existed ("Cannot access 'O' before initialization") and
            // the whole app failed to mount in production from 2026-10-25.
            if (id.includes('/node_modules/@sentry/')) {
              return 'sentry-vendor';
            }
            if (/\/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom|@remix-run\/router)\//.test(id)) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui/')) {
              return 'ui-vendor';
            }
            if (id.includes('react-hook-form') || id.includes('/node_modules/zod/') || id.includes('@hookform')) {
              return 'form-vendor';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
          }
        },
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    // 'hidden' only omits the //# sourceMappingURL comment from each bundle. The
    // .map files are still emitted into dist/assets and Vercel serves them, so
    // they ARE publicly fetchable at <bundle>.js.map. That is acceptable here
    // because the repository is public, so they disclose nothing the source does
    // not, and it is what makes decoding a production stack trace possible
    // (f39ff3b moved off `false` for exactly that). If the repo ever goes
    // private, revisit this - a "hidden" map is not a private one.
    sourcemap: 'hidden',
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  };
});
