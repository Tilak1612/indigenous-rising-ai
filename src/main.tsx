import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// src/lib/analytics.ts was a stub that appended every conversion event to this
// key and never sent or flushed it, so it grew without bound in visitors'
// browsers. The stub is gone; clear what it left behind.
try {
  localStorage.removeItem('analytics-queue-v1');
} catch {
  // storage unavailable (private mode, blocked site data) — nothing to clear
}

createRoot(document.getElementById("root")!).render(<App />);
