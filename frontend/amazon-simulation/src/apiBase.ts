/**
 * API origin for fetch calls. For Azure builds, set `VITE_API_BASE_URL` in the Static Web App build settings
 * (not only local `.env`). No trailing slash.
 * Local dev: falls back to https://localhost:5000 only when `import.meta.env.DEV` is true.
 */
const raw =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? 'https://localhost:5000' : '');
export const API_BASE = raw.replace(/\/$/, '');
