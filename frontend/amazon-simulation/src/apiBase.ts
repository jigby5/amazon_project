/**
 * API origin for fetch calls. Set `VITE_API_BASE_URL` in `.env` for Azure (e.g. https://your-api.azurewebsites.net).
 * No trailing slash. Defaults to local HTTPS dev server.
 */
const raw = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:5000';
export const API_BASE = raw.replace(/\/$/, '');
