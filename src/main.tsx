import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Validate critical environment variables at startup.
// Fail loudly here rather than silently failing on first user action.
const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

const missingVars = REQUIRED_ENV_VARS.filter(
  key => !import.meta.env[key]
);

if (missingVars.length > 0) {
  document.body.innerHTML = `
    <div style="font-family:monospace;padding:2rem;color:#dc2626;background:#fef2f2;min-height:100vh;">
      <h1>Configuration Error</h1>
      <p>The following required environment variables are missing:</p>
      <ul>${missingVars.map(v => `<li>${v}</li>`).join('')}</ul>
      <p>Please check your <code>.env</code> file or Vercel environment settings.</p>
    </div>
  `;
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

createRoot(document.getElementById("root")!).render(<App />);
