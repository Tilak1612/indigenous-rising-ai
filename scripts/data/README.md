# Build-time funding snapshot

`funding-snapshot.json` is a copy of the published rows in `public.grants`, read
from the live table and committed so the prerender never depends on the network.

The prerender fetches live data first. The snapshot is the fallback, used only
when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are absent or the request
fails — so a network blip degrades the build to slightly older programme data
rather than failing it, or silently shipping a page with no programmes at all.

Each row carries `last_verified`, so if the snapshot does go stale the page says
when each programme was actually checked rather than implying all are current.

Refresh it with:

    npm run funding:snapshot
